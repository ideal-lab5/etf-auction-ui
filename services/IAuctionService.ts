import { Auction } from "../domain/Auction";

export interface IAuctionService {
  getPublishedAuctions: () => Auction[];
}
