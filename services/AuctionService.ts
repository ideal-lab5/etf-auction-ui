import { Auction, AuctionStatus } from "../domain/Auction";
import { IAuctionService } from "./IAuctionService";
import { singleton } from "tsyringe";
import { ContractPromise } from '@polkadot/api-contract';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { SHA3 } from 'sha3';
import { BN, BN_ONE } from "@polkadot/util";
import contractMetadata from '../assets/proxy/tlock_proxy.json';
import chainSpec from "../assets/etfTestSpecRaw.json";

@singleton()
export class AuctionService implements IAuctionService {
  //mock attribute representing the list of auctions
  private mockAuctions: Auction[];
  private api: any;
  private contract: any;
  private readonly MAX_CALL_WEIGHT2 = new BN(1_000_000_000_000).isub(BN_ONE);
  private readonly MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
  private readonly PROOFSIZE = new BN(1_000_000_000);
  private readonly SHARES = 1;
  private readonly THRESHOLD = 1;
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
    //TODO: remove mock implementation
    console.log("Starting AuctionService");
    this.mockAuctions = [];
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
    }
    if (signer) {
      this.api.api.setSigner(signer);
    }
    return Promise.resolve(this.api);
  }

  async cancelAuction(signer: any, auctionId: string): Promise<Auction> {
    let auction = this.mockAuctions.find(auction => auction.id === auctionId && auction.owner === signer);
    if (auction) {
      auction.status = AuctionStatus.Canceled;
    }
    return Promise.resolve(auction);
  }

  async newAuction(signer: any, title: string, assetId: number, deadline: number, deposit: number): Promise<Auction> {
    let api = await this.getEtfApi(signer.signer);
    let dateInSeconds = new Date(new Date().getDate() + deadline).getTime() / 1000;
    let distance = this.calculateEstimatedDistance(dateInSeconds, this.SHARES, this.THRESHOLD, this.TIME);
    console.log("distance:", distance);
    const etfjs = await import('@ideallabs/etf.js');
    const slotScheduler = new etfjs.DistanceBasedSlotScheduler();
    let slotSchedule = slotScheduler.generateSchedule({
      slotAmount: this.SHARES,
      currentSlot: parseInt(api.latestSlot.slot.replaceAll(",", "")),
      distance
    });
    console.log("slotSchedule:", slotSchedule);
    let { output } = await this.contract.tx
      .newAuction({
        gasLimit: api.api.registry.createType('WeightV2', {
          refTime: this.MAX_CALL_WEIGHT2,
          proofSize: this.PROOFSIZE,
        }),
        storageDepositLimit: null,
      },
        title,
        assetId,
        slotSchedule[0],
        deposit,
      ).signAndSend(signer.address, result => {
        if (result.status.isInBlock) {
          console.log(result.toHuman().Ok)
          console.log('auction created');
        } else if (result.status.isFinalized) {
          console.log('finalized');
        }
      });
    console.log('auction created', output?.toHuman()?.Ok.Ok);
    let auction = new Auction(
      output?.toHuman()?.Ok.Ok, //id of deployed contract id
      title,
      assetId,
      deposit,
      new Date(),
      slotSchedule[0],
      signer,
      AuctionStatus.Published,
    )
    return Promise.resolve(auction);
  }

  async bid(signer: any, auctionId: string, deadline: number, amount: number): Promise<any> {
    let api = await this.getEtfApi(signer.signer);
    let amountString = amount.toString();
    const hasher = new SHA3(256)
    hasher.update(amountString);
    const hash = hasher.digest();
    // the seed shouldn't be reused
    let timelockedBid = api.encrypt(amountString, 1, [deadline], "testing234");
    // now we want to call the publish function of the contract
    const value = 1000000;
    // call the publish function of the contract
    let { output } = await this.contract.tx
      .bid({
        gasLimit: api.api.registry.createType('WeightV2', {
          refTime: this.MAX_CALL_WEIGHT2,
          proofSize: this.PROOFSIZE,
        }),
        storageDepositLimit: null,
        value: value,
      },
        auctionId,
        timelockedBid.ct.aes_ct.ciphertext,
        timelockedBid.ct.aes_ct.nonce,
        timelockedBid.ct.etf_ct[0],
        Array.from(hash),
      ).signAndSend(signer.address, result => {
        if (result.status.isInBlock) {
          console.log('in a block');
          console.log(result.toHuman().Ok);
        } else if (result.status.isFinalized) {
          console.log('finalized');
        }
      });

    // TODO remove mock implementation
    let auction = this.mockAuctions.find(auction => auction.id === auctionId);
    return Promise.resolve(auction);
  }

  async completeAuction(signer: any, auctionId: string, deadline: number): Promise<Auction> {
    let api = await this.getEtfApi(signer.signer);
    let secrets = await api.secrets([deadline]);
    // P \in G2
    let ibePubkey = Array.from(api.ibePubkey);
    console.log(ibePubkey)
    console.log(Array.from(secrets[0]));
    // fetch ciphertexts from the appropriate auction contract and decrypt them
    let result = await this.contract.tx
      .complete({
        gasLimit: api.api.registry.createType('WeightV2', {
          refTime: new BN(1_290_000_000_000),
          proofSize: new BN(5_000_000_000_000),
        }),
        storageDepositLimit: null,
      },
        auctionId, //ibePubkey
        Array.from(secrets[0])
      ).signAndSend(signer.address, result => {
        if (result.isErr) {
          const errorMsg = result.toJSON();
          console.log(errorMsg)
        }
        if (result.status.isInBlock) {
          console.log('in a block');
          console.log(result.toHuman());
        } else if (result.status.isFinalized) {
          console.log('finalized');
        }
      });

    //TODO remove mock implementation
    let auction = this.mockAuctions.find(auction => auction.id === auctionId);
    if (auction) {
      auction.status = AuctionStatus.Completed;
    }
    return Promise.resolve(auction);

  }
  async getPublishedAuctions(signer: any): Promise<Auction[]> {
    let api = await this.getEtfApi();
    const storageDepositLimit = null
    const { output } = await this.contract.query.getAuctions(
      signer.address,
      {
        gasLimit: api.registry.createType('WeightV2', {
          refTime: this.MAX_CALL_WEIGHT,
          proofSize: this.PROOFSIZE,
        }),
        storageDepositLimit,
      }
    );
    console.log(output?.toHuman()?.Ok.Ok);
    let auctions = (output?.toHuman()?.Ok?.Ok || []).map((value) => {
      return new Auction(
        value.auctionId,
        value.name,
        value.assetId,
        value.deposit,
        value.published, //published date is not currently part of auction's storage
        parseInt(value.deadline),
        value.owner,
        parseInt(value.status),
      )
    });

    return Promise.resolve(auctions);
  }

  async getMyAuctions(owner: any): Promise<Auction[]> {
    let api = await this.getEtfApi();
    const storageDepositLimit = null
    const { output } = await this.contract.query.getAuctionsByOwner(
      owner.address,
      {
        gasLimit: api.registry.createType('WeightV2', {
          refTime: this.MAX_CALL_WEIGHT,
          proofSize: this.PROOFSIZE,
        }),
        storageDepositLimit,
      },
      owner.address
    );
    console.log(output?.toHuman()?.Ok.Ok);
    let auctions = (output?.toHuman()?.Ok?.Ok || []).map((value) => {
      return new Auction(
        value.auctionId,
        value.name,
        value.assetId,
        value.deposit,
        value.published, //published date is not currently part of auction's storage
        parseInt(value.deadline),
        value.owner,
        parseInt(value.status),
      )
    });

    return Promise.resolve(auctions);
  }

  getMyBids(bidder: any): Promise<Auction[]> {
    return Promise.resolve([]);
  }

  // takes a time in seconds to get the distance value representing it
  private calculateEstimatedDistance(timeInSeconds: number, shares: number, threshold: number, TARGET: number): number {
    if (threshold === 0 || shares - threshold < 0) {
      throw new Error("Invalid threshold");
    }
    const probabilities = []
    const p = threshold / shares // Probability of finding a winning share in a slot
    for (let i = 0; i <= threshold; i++) {
      probabilities[i] =
        this.binomialCoefficient(shares, i) *
        Math.pow(p, i) *
        Math.pow(1 - p, shares - i)
    }
    let estimatedTime = 0
    for (let i = 1; i <= threshold; i++) {
      estimatedTime += i * probabilities[i]
    }

    // getting distance based on timeInSeconds
    return Math.abs(timeInSeconds / (estimatedTime * TARGET));
  }
  // Helper function to calculate binomial coefficient
  private binomialCoefficient(n, k): number {
    if (k === 0 || k === n) {
      return 1
    }
    let result = 1
    for (let i = 1; i <= k; i++) {
      result *= (n - i + 1) / i
    }
    return result
  }
}
