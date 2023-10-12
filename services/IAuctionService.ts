import { Auction } from "../domain/Auction";
export interface IAuctionService {
  getPublishedAuctions: (signer: any) => Promise<Auction[]>;
  getMyAuctions: (owner: any) => Promise<Auction[]>;
  getMyBids: (bidder: any) => Promise<Auction[]>;
  newAuction: (signer: any, title: string, assetId: number, deadline: number, deposit: number) => Promise<boolean>;
  cancelAuction: (signer: any, auctionId: string) => Promise<boolean>;
  completeAuction: (signer: any, auctionId: string, deadline: number) => Promise<boolean>;
  getEtfApi: () => Promise<any>;
  bid: (signer: any, auctionId: string, deadline: number, amount: number) => Promise<boolean>;
  getWinner: (signer: any, auctionId: string) => Promise<any>;
  claim: (signer: any, auctionId: string) => Promise<boolean>;
}
