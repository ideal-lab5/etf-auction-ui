import { Auction, AuctionStatus } from "../domain/Auction";
import { IAuctionService } from "./IAuctionService";
import { singleton } from "tsyringe";
import { ContractPromise, CodePromise } from '@polkadot/api-contract';
import { blake2AsHex, cryptoWaitReady } from '@polkadot/util-crypto';
import { SHA3 } from 'sha3';
import { BN, BN_ONE } from "@polkadot/util";
import contractMetadata from '../assets/proxy/tlock_proxy.json';
import contractData from '../assets/proxy/tlock_proxy.contract.json';
import { CONTRACT_ADDRESS, NODE_DETAILS } from "./constants";
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

  constructor() {
    //TODO: remove mock implementation
    console.log("Starting AuctionService");

    this.mockAuctions = [
      new Auction(
        "1",
        "Auction 1",
        1,
        10,
        new Date(),
        new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3).getTime(),
        "user1",
        AuctionStatus.Published,
      ),
      new Auction(
        "2",
        "Auction 2",
        2,
        10,
        new Date(),
        new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 2).getTime(),
        "user2",
        AuctionStatus.Published,
      ),
      new Auction(
        "3",
        "Auction 4",
        3,
        10,
        new Date(),
        new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 10).getTime(),
        "user3",
        AuctionStatus.Completed,
      ),
    ];
  }

  async getEtfApi(): Promise<any> {
    if (!this.api) {
      await cryptoWaitReady()
      const etfjs = await import('@ideallabs/etf.js');
      let api = new etfjs.Etf(NODE_DETAILS.url, NODE_DETAILS.port);
      await api.init(JSON.stringify(chainSpec));
      this.api = api;
      //Loading proxy contract
      this.contract = new ContractPromise(this.api.api, contractMetadata, CONTRACT_ADDRESS);
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
    let api = await this.getEtfApi();
    let result = await this.contract.tx
      .newAuction({
        gasLimit: api.api.registry.createType('WeightV2', {
          refTime: this.MAX_CALL_WEIGHT2,
          proofSize: this.PROOFSIZE,
        }),
        storageDepositLimit: null,
      },
        title,
        assetId,
        deadline,
        deposit,
      ).signAndSend(signer, result => {
        if (result.status.isInBlock) {
          console.log(result.toHuman().Ok)
          console.log('auction created');
        } else if (result.status.isFinalized) {
          console.log('finalized');
        }
      });

    //TODO remove mock implementation
    let auction = new Auction(
      this.mockAuctions.length.toString(), //id based on the length of the list ... it should be deployed contract id
      title,
      assetId,
      deposit,
      new Date(),
      deadline,
      signer,
      AuctionStatus.Published,
    )

    this.mockAuctions.push(auction);

    return Promise.resolve(auction);
  }

  async bid(signer: any, auctionId: string, amount: number): Promise<any> {
    let api = await this.getEtfApi();
    let amountString = amount.toString();
    const hasher = new SHA3(256)
    hasher.update(amountString);
    const hash = hasher.digest();
    // the seed shouldn't be reused
    let timelockedBid = api.encrypt(amountString, 1, this.getSlots(), "testing234");
    // now we want to call the publish function of the contract
    const value = 1000000;
    // call the publish function of the contract
    let result = await this.contract.tx
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
      ).signAndSend(signer, result => {
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

  async completeAuction(signer: any, auctionId: string): Promise<Auction> {
    let api = await this.getEtfApi();
    let secrets = await api.secrets(this.getSlots());
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
      ).signAndSend(signer, result => {
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
    const { result, output } = await this.contract.query.get_auctions(
      signer.address,
      {
        gasLimit: api.registry.createType('WeightV2', {
          refTime: this.MAX_CALL_WEIGHT,
          proofSize: this.PROOFSIZE,
        }),
        storageDepositLimit,
      }
    );

    console.log(result.toHuman())
    //TODO process response and return Auction[]
    return Promise.resolve(this.mockAuctions);
  }

  async getMyAuctions(owner: any): Promise<Auction[]> {
    let api = await this.getEtfApi();
    const storageDepositLimit = null
    const { result, output } = await this.contract.query.get_auctions_by_owner(
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

    console.log(result.toHuman())

    //TODO process response and return Auction[]
    return Promise.resolve(this.mockAuctions.filter(auction => auction.owner === owner));
  }

  getMyBids(bidder: any): Promise<Auction[]> {
    return Promise.resolve([]);
  }

  private getSlots(): [] {
    return [];
  }
}
