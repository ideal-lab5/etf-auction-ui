import { Auction, AuctionStatus } from "../domain/Auction";
import { IAuctionService } from "./IAuctionService";
import { singleton } from "tsyringe";
import { ContractPromise } from '@polkadot/api-contract';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { BN, BN_ONE } from "@polkadot/util";
import chainSpec from "../assets/etfTestSpecRaw.json";
import abi from '../assets/proxy/tlock_proxy.json';
import { SubmittableResult } from "@polkadot/api";

@singleton()
export class AuctionService implements IAuctionService {
  private api: any;
  private contract: any;
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
    // ensure params are defined
    if (process.env.NEXT_PUBLIC_NODE_DETAILS === undefined) {
      console.error("Provide a valid value for NEXT_PUBLIC_NODE_DETAILS");
      return Promise.resolve(null);
    }

    if (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS === undefined) {
      console.error("Provide a valid value for NEXT_PUBLIC_CONTRACT_ADDRESS");
      return Promise.resolve(null);
    }

    if (!this.api) {

      try {
        await cryptoWaitReady()
        const etfjs = await import('@ideallabs/etf.js');
        let api = new etfjs.Etf(process.env.NEXT_PUBLIC_NODE_DETAILS, true);
        console.log("Connecting to ETF chain");
        await api.init(JSON.stringify(chainSpec), this.CUSTOM_TYPES);
        this.api = api;
        //Loading proxy contract
        this.contract = new ContractPromise(this.api.api, abi, process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
      } catch (_e) {
        // TODO: next will try to fetch the wasm blob but it doesn't need to
        // since the transitive dependency is built with the desired wasm already 
        // so we can ignore this error for now (no impact to functionality)
        // but shall be addressed in the future
      }
    }
    if (signer) {
      this.api.api.setSigner(signer);
    }
    return Promise.resolve(this.api);
  }

  async cancelAuction(signer: any, auctionId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async newAuction(
    signer: any,
    title: string,
    deadline: number,
    deposit: number
  ): Promise<boolean> {
    let api = await this.getEtfApi(signer.signer)
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
              title.padEnd(48, '1'),
              deadline,
              deposit,
            ).signAndSend(signer.address, (result: any) => {
              console.log('Transaction status:', result.status.type);
              if (result.status.isInBlock || result.status.isFinalized) {
                console.log(`Transaction included in block hash ${result.status.asInBlock}`);
                let eventValue;
                result.contractEvents.forEach(e => {
                  if (e["event"]["identifier"] == "AuctionCreated") {
                    eventValue = e["args"][0];
                    console.log("Extracted:", JSON.stringify(eventValue));
                  }
                });
                resolve(eventValue);
              }
              
            });
        } catch (error) {
          // Reject the promise if any error arises
          console.log(error);
          reject(error);
        }
      });
    };

    return await sendContractTx(this.contract, this).then((auctionId: any) => {
      if (auctionId) {
        console.log(`Scheduling complete for auction ${auctionId}`);
        return this.scheduleComplete(signer, auctionId, deadline + 2).then(() => {
          return Promise.resolve(true);
        });
      } else
        return Promise.resolve(true);

    }).catch((error) => {
      console.log("Error sending transaction", error);
      return Promise.resolve(false);
    });
  }

  private async scheduleReveal(signer: any, auctionId: string, amount: number, deadline: number): Promise<any> {
    let api = await this.getEtfApi(signer.signer);
    // the call to delay
    let contractInnerCall = this.contract.tx.revealBid({
      gasLimit: api.api.registry.createType('WeightV2', {
        refTime: this.MAX_CALL_WEIGHT2,
        proofSize: this.PROOFSIZE,
      }),
      storageDepositLimit: null,
    },
      auctionId,
      {
        bidder: api.createType('AccountId', signer.address),
        bid: amount,
      }
    )
    // prepare delayed call
    let outerCall = api.delay(contractInnerCall, 127, deadline);
    await outerCall.call.signAndSend(signer.address, result => {
      if (result.status.isInBlock) {
        console.log('in block')
      }
    });
  }

  async bid(signer: any, auctionId: string, deadline: number, amount: number): Promise<boolean> {
    let api = await this.getEtfApi(signer.signer);
    // now we want to call the publish function of the contract
    const value = 1000000; // value to lock when bidding
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
              auctionId
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

    return await sendContractTx(this.contract, this).then(() => {
      // schedule reveal
      return this.scheduleReveal(signer, auctionId, amount, deadline).then(() => {
        return Promise.resolve(true);
      });
    }).catch((error) => {
      console.log("Error sending transaction", error);
      return Promise.resolve(false);
    });
  }

  private async scheduleComplete(signer: any, auctionId: string, deadline: number): Promise<any> {
    let api = await this.getEtfApi(signer.signer);
    // the call to delay
    let contractInnerCall = this.contract.tx.complete({
      gasLimit: api.api.registry.createType('WeightV2', {
        refTime: new BN(1_290_000_000_000),
        proofSize: new BN(5_000_000_000_000),
      }),
      storageDepositLimit: null,
    },
      auctionId
    );
    // prepare delayed call
    let outerCall = api.delay(contractInnerCall, 127, deadline);
    await outerCall.call.signAndSend(signer.address, result => {
      if (result.status.isInBlock) {
        console.log('in block')
      }
    });
  }

  async completeAuction(signer: any, auctionId: string, deadline: number): Promise<boolean> {
    let api = await this.getEtfApi(signer.signer);
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
              auctionId
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

  async getWinner(signer: any, auctionId: string): Promise<any> {
    let api = await this.getEtfApi(signer.signer);
    const storageDepositLimit = null;
    const { result, output } =
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
    return Promise.resolve(output.toHuman().Ok.Ok);
  }

  async getBalance(): Promise<any> {
    let api = await this.getEtfApi();
    if (api === undefined) {
      return Promise.resolve(0);
    }
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
    const auctionsData = output?.toHuman()?.Ok?.Ok || [];
    const promises = auctionsData.map(async (value: any) => {
      const winner = await this.getWinner(signer, value.auctionId);
      let deadlineSlot = parseInt(value.deadline?.replace(/,/g, "") || 0);
      let auction = new Auction(
        value.auctionId,
        value.name,
        parseInt(value.assetId?.replace(/,/g, "") || 0),
        value.deposit,
        parseInt(value.published?.replace(/,/g, "") || 0),
        value.deadline,
        deadlineSlot,
        value.owner,
        parseInt(value.status),
        parseInt(value.bids)
      );
      auction.winner = winner === undefined ? '' : auction.status === AuctionStatus.Completed && winner.winner;
      return auction;
    });

    const auctions = await Promise.all(promises);
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
        value.deadline,
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
    const auctionsData = output?.toHuman()?.Ok?.Ok || [];
    const promises = auctionsData.map(async (value: any) => {
      const winner = await this.getWinner(bidder, value.auctionId);
      let deadlineSlot = parseInt(value.deadline?.replace(/,/g, "") || 0);
      let auction = new Auction(
        value.auctionId,
        value.name,
        parseInt(value.assetId?.replace(/,/g, "") || 0),
        value.deposit,
        parseInt(value.published?.replace(/,/g, "") || 0),
        value.deadline,
        deadlineSlot,
        value.owner,
        parseInt(value.status),
        parseInt(value.bids)
      );
      auction.winner = auction.status === AuctionStatus.Completed && winner.winner;
      return auction;
    });

    const auctions = await Promise.all(promises);
    return Promise.resolve(auctions);
  }
}
