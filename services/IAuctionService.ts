import { AnyCnameRecord } from "dns";
import { Auction } from "../domain/Auction";
export interface IAuctionService {
  getPublishedAuctions: (signer: any) => Promise<Auction[]>;
  getMyAuctions: (owner: any) => Promise<Auction[]>;
  getMyBids: (bidder: any) => Promise<Auction[]>;
  newAuction: (signer: any, title: string, assetId: number, deadline: number, deposit: number) => Promise<any>;
  cancelAuction: (signer: any, auctionId: string) => Promise<any>;
  completeAuction: (signer: any, auctionId: string, deadline: number) => Promise<any>;
  getEtfApi: () => Promise<any>;
  bid: (signer: any, auctionId: string, deadline: number, amount: number) => Promise<any>;
}
