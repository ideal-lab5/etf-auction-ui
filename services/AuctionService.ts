import { Auction, AuctionStatus } from "../domain/Auction";
import { IAuctionService } from "./IAuctionService";
import { singleton } from "tsyringe";
import { ContractPromise } from '@polkadot/api-contract';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { SHA3 } from 'sha3';
import { BN, BN_ONE } from "@polkadot/util";
import contractMetadata from '../assets/proxy/tlock_proxy.json';
import chainSpec from "../assets/etfTestSpecRaw.json";
import { SubmittableResult } from "@polkadot/api";

@singleton()
export class AuctionService implements IAuctionService {
  public api: any;
  private contract: any;
  private lastestSlot: any;
  private readonly MAX_CALL_WEIGHT2 = new BN(1_000_000_000_000).isub(BN_ONE);
  private readonly MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
  private readonly PROOFSIZE = new BN(1_000_000_000);
  private readonly TIME = 10; //seconds
  // custom types for the auction structs
  private readonly CUSTOM_TYPES = {
    Proposal: {
      ciphertext: 'Vec<u8>',
      nonce: 'Vec<u8>',
      capsule: 'Vec<u8>',
      commitment: 'Vec<u8>',
    },
    AuctionResult: {
      winner: 'AccountId',
      debt: 'Balance'
    }
  };


  constructor() {
    this.getEtfApi().then(() => {
      console.log("Starting AuctionService");
    });
  }

  async getEtfApi(signer = undefined): Promise<any> {
    if (!this.api) {
      await cryptoWaitReady()
      const etfjs = await import('@ideallabs/etf.js');
      let api = new etfjs.Etf(process.env.NEXT_PUBLIC_NODE_DETAILS);
      console.log("Connecting to ETF chain");
      await api.init(JSON.stringify(chainSpec), this.CUSTOM_TYPES);
      this.api = api;
      //Loading proxy contract
      this.contract = new ContractPromise(this.api.api, contractMetadata, process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
      this.api.eventEmitter.on('blockHeader', () => {
        // update the state of the latest slot
        this.lastestSlot = this.api.latestSlot?.slot?.replace(/,/g, "");
      });
    }
    if (signer) {
      this.api.api.setSigner(signer);
    }
    return Promise.resolve(this.api);
  }

  async cancelAuction(signer: any, auctionId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async newAuction(signer: any, title: string, assetId: number, duration: number, deposit: number): Promise<boolean> {
    let api = await this.getEtfApi(signer.signer)
    // deadline ~ number of minutes => convert to number of slots
    let distance = duration * 60 / (this.TIME)
    // since we only need one value, we don't really need a slot scheduler
    let target = parseInt(this.lastestSlot) + distance
    async function sendContractTx(contract: any, auctionService: AuctionService): Promise<SubmittableResult> {
      return new Promise(async (resolve, reject) => {
        try {
          await contract.tx
            .newAuction({
              gasLimit: api.api.registry.createType('WeightV2', {
                refTime: auctionService.MAX_CALL_WEIGHT2,
                proofSize: auctionService.PROOFSIZE,
              }),
              storageDepositLimit: null,
            },
              title,
              assetId,
              target,
              deposit,
            ).signAndSend(signer.address, (result: SubmittableResult) => {
              // Log the transaction status
              console.log('Transaction status:', result.status.type);
              if (result.status.isInBlock || result.status.isFinalized) {
                console.log(`Transaction included in block hash ${result.status.asInBlock}`);
                resolve(result);
              }

            });
        } catch (error) {
          // Reject the promise if any error arises
          console.log(error);
          reject(error);
        }
      });
    };

    return await sendContractTx(this.contract, this).then(() => Promise.resolve(true)).catch(() => {
      console.log("Error sending transaction");
      return Promise.resolve(false);
    });
  }

  async bid(signer: any, auctionId: string, deadline: number, amount: number): Promise<boolean> {
    let api = await this.getEtfApi(signer.signer);
    let amountString = amount.toString();
    const hasher = new SHA3(256)
    hasher.update(amountString);
    const hash = hasher.digest();
    hasher.update(new Date().getTime().toString());
    const seed = hasher.digest();
    // the seed shouldn't be reused
    let timelockedBid = api.encrypt(amountString, 1, [deadline], seed);
    // now we want to call the publish function of the contract
    const value = 1000000;
    async function sendContractTx(contract: any, auctionService: AuctionService): Promise<SubmittableResult> {
      return new Promise(async (resolve, reject) => {
        try {
          await contract.tx
            .bid({
              gasLimit: api.api.registry.createType('WeightV2', {
                refTime: auctionService.MAX_CALL_WEIGHT2,
                proofSize: auctionService.PROOFSIZE,
              }),
              storageDepositLimit: null,
              value,
            },
              auctionId,
              timelockedBid.ct.aes_ct.ciphertext,
              timelockedBid.ct.aes_ct.nonce,
              timelockedBid.ct.etf_ct[0],
              Array.from(hash),
            ).signAndSend(signer.address, (result: SubmittableResult) => {
              // Log the transaction status
              console.log('Transaction status:', result.status.type);
              if (result.status.isInBlock || result.status.isFinalized) {
                console.log(`Transaction included in block hash ${result.status.asInBlock}`);
                resolve(result);
              }
            });

        } catch (error) {
          // Reject the promise if any error arises
          console.log(error);
          reject(error);
        }
      });
    };

    return await sendContractTx(this.contract, this).then(() => Promise.resolve(true)).catch(() => {
      console.log("Error sending transaction");
      return Promise.resolve(false);
    });
  }

  async completeAuction(signer: any, auctionId: string, deadline: number): Promise<boolean> {
    let api = await this.getEtfApi(signer.signer);
    let revealedBids = await this.revealBids(signer.signer, auctionId, deadline);
    async function sendContractTx(contract: any): Promise<SubmittableResult> {
      return new Promise(async (resolve, reject) => {
        try {
          await contract.tx
            .complete({
              gasLimit: api.api.registry.createType('WeightV2', {
                refTime: new BN(1_290_000_000_000),
                proofSize: new BN(5_000_000_000_000),
              }),
              storageDepositLimit: null,
            },
              auctionId,
              revealedBids
            ).signAndSend(signer.address, (result: SubmittableResult) => {
              // Log the transaction status
              console.log('Transaction status:', result.status.type);
              if (result.status.isInBlock || result.status.isFinalized) {
                console.log(`Transaction included in block hash ${result.status.asInBlock}`);
                resolve(result);
              }
            });
        } catch (error) {
          // Reject the promise if any error arises
          console.log(error);
          reject(error);
        }
      });
    };

    return await sendContractTx(this.contract).then(() => Promise.resolve(true)).catch(() => {
      console.log("Error sending transaction");
      return Promise.resolve(false);
    });

  }

  /// fetch ciphertext from currently loaded auction contract and decrypt each
  /// returns an array of (AccountId, Proposal)
  private async revealBids(signer: any, auctionId: string, deadline: number): Promise<any> {
    let api = await this.getEtfApi(signer.signer);
    // fetch ciphertexts from the appropriate auction contract and decrypt them
    const storageDepositLimit = null;
    const { result, output } = await this.contract.query.getEncryptedBids(
      signer.address,
      {
        gasLimit: api.api.registry.createType('WeightV2', {
          refTime: this.MAX_CALL_WEIGHT,
          proofSize: this.PROOFSIZE,
        }),
        storageDepositLimit,
      },
      auctionId,
    );
    if (!result.err) {
      let revealedBids = [];
      let cts = output.toHuman().Ok.Ok;
      for (const c of cts) {
        let bidder = c[0];
        let proposal = api.createType('Proposal', c[1]);
        let plaintext = await api.decrypt(
          proposal.ciphertext,
          proposal.nonce,
          [proposal.capsule],
          [deadline],
        );
        let bid = Number.parseInt(String.fromCharCode(...plaintext));
        let revealedBid = {
          bidder: api.createType('AccountId', bidder),
          bid: bid,
        };
        revealedBids.push(revealedBid);
      }
      return Promise.resolve(revealedBids);
    }
    return Promise.resolve([]);
  }

  async getWinner(signer: any, auctionId: string): Promise<any> {
    let api = await this.getEtfApi(signer.signer);
    const storageDepositLimit = null;
    const { result } =
      await this.contract.query.getWinner(
        signer.address,
        {
          gasLimit: api.api.registry.createType('WeightV2', {
            refTime: this.MAX_CALL_WEIGHT,
            proofSize: this.PROOFSIZE,
          }),
          storageDepositLimit,
        },
        auctionId,
      );
    return Promise.resolve(api.api.createType('AuctionResult', result)?.toHuman() || undefined);
  }

  async getBalance(): Promise<any> {
    let api = await this.getEtfApi();
    const { data: balance } = await api.api.query.system.account(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
    return Promise.resolve(balance.free.toHuman() || undefined);
  }

  async claim(signer: any, auctionId: string): Promise<boolean> {
    let api = await this.getEtfApi(signer.signer);
    // call get winner
    let result = await this.getWinner(signer, auctionId);
    // if you're the winner, send the debt
    let value = signer.address === result.winner ? result.debt : 0
    async function sendContractTx(contract: any): Promise<SubmittableResult> {
      return new Promise(async (resolve, reject) => {
        try {
          await contract.tx
            .claim({
              gasLimit: api.api.registry.createType('WeightV2', {
                refTime: new BN(1_290_000_000_000),
                proofSize: new BN(5_000_000_000_000),
              }),
              storageDepositLimit: null,
              value,
            },
              auctionId,
            ).signAndSend(signer.address, (result: SubmittableResult) => {
              // Log the transaction status
              console.log('Transaction status:', result.status.type);
              if (result.status.isInBlock || result.status.isFinalized) {
                console.log(`Transaction included in block hash ${result.status.asInBlock}`);
                resolve(result);
              }
            });

        } catch (error) {
          // Reject the promise if any error arises
          console.log(error);
          reject(error);
        }
      });
    };
    return await sendContractTx(this.contract).then(() => Promise.resolve(true)).catch(() => {
      console.log("Error sending transaction");
      return Promise.resolve(false);
    });
  }

  async getPublishedAuctions(signer: any): Promise<Auction[]> {
    let api = await this.getEtfApi();
    const storageDepositLimit = null
    const { output } = await this.contract.query.getAuctions(
      signer.address,
      {
        gasLimit: api.api.registry.createType('WeightV2', {
          refTime: this.MAX_CALL_WEIGHT,
          proofSize: this.PROOFSIZE,
        }),
        storageDepositLimit,
      }
    );
    let auctions = (output?.toHuman()?.Ok?.Ok || []).map((value: any) => {
      let deadlineSlot = parseInt(value.deadline?.replace(/,/g, "") || 0);
      return new Auction(
        value.auctionId,
        value.name,
        parseInt(value.assetId?.replace(/,/g, "") || 0),
        value.deposit,
        parseInt(value.published?.replace(/,/g, "") || 0),
        this.estimateTime(parseInt(api.getLatestSlot()), deadlineSlot),
        deadlineSlot,
        value.owner,
        parseInt(value.status),
        parseInt(value.bids)
      )
    });

    return Promise.resolve(auctions);
  }

  async getMyAuctions(owner: any): Promise<Auction[]> {
    let api = await this.getEtfApi(owner);
    const storageDepositLimit = null
    const { output } = await this.contract.query.getAuctionsByOwner(
      owner.address,
      {
        gasLimit: api.api.registry.createType('WeightV2', {
          refTime: this.MAX_CALL_WEIGHT,
          proofSize: this.PROOFSIZE,
        }),
        storageDepositLimit,
      },
      owner.address
    );
    let auctions = (output?.toHuman()?.Ok?.Ok || []).map((value: any) => {
      let deadlineSlot = parseInt(value.deadline?.replace(/,/g, "") || 0);
      let auction = new Auction(
        value.auctionId,
        value.name,
        parseInt(value.assetId?.replace(/,/g, "") || 0),
        value.deposit,
        parseInt(value.published?.replace(/,/g, "") || 0),
        this.estimateTime(parseInt(api.getLatestSlot()), deadlineSlot),
        deadlineSlot,
        value.owner,
        parseInt(value.status),
        parseInt(value.bids)
      );
      //this is not the most efficient way to do this, but it works for now to ilustrate de use case.
      //auction.winner = auction.status === AuctionStatus.Completed && await this.getWinner(owner, auction.id);
      return auction
    });
    return Promise.resolve(auctions);
  }

  async getMyBids(bidder: any): Promise<Auction[]> {
    let api = await this.getEtfApi();
    const storageDepositLimit = null
    const { output } = await this.contract.query.getAuctionsByBidder(
      bidder.address,
      {
        gasLimit: api.api.registry.createType('WeightV2', {
          refTime: this.MAX_CALL_WEIGHT,
          proofSize: this.PROOFSIZE,
        }),
        storageDepositLimit,
      },
      bidder.address
    );
    let auctions = (output?.toHuman()?.Ok?.Ok || []).map((value: any) => {
      let deadlineSlot = parseInt(value.deadline?.replace(/,/g, "") || 0);
      return new Auction(
        value.auctionId,
        value.name,
        parseInt(value.assetId?.replace(/,/g, "") || 0),
        value.deposit,
        parseInt(value.published?.replace(/,/g, "") || 0),
        this.estimateTime(parseInt(api.getLatestSlot()), deadlineSlot),
        deadlineSlot,
        value.owner,
        parseInt(value.status),
        parseInt(value.bids)
      )
    });
    return Promise.resolve(auctions);
  }

  // precision at seconds instead of ms since our target TIME is measured in seconds
  private estimateTime(currentSlot: number, deadline: number): Date {
    // get number of slots left
    const slotsRemaining = deadline - currentSlot
    // convert to time (s)
    let secondsRemaining = slotsRemaining * this.TIME
    // get deadline as a number of seconds from now
    let t = new Date()
    t.setSeconds(t.getSeconds() + secondsRemaining)
    return t
  }

}
