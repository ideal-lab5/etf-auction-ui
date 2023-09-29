import { Auction } from "../domain/Auction";

export interface IAuctionService {
  getPublishedAuctions: () => Auction[];
  getMyAuctions: (owner: any) => Auction[];
  getMyBids: (bidder: any) => Auction[];
  newAuction: (signer: any, title: string, assetId:number, deadline: number, deposit: number) => Promise<Auction>;
  cancelAuction: (signer: any, auctionId: string) => Promise<Auction>;
  completeAuction: (signer: any, auctionId: string) => Promise<Auction>;
}
