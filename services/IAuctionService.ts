export interface IAuctionService {
  getAuctionDetails: (auctionId: string) => void;
  getBids: (auctionId: string) => void;
}
