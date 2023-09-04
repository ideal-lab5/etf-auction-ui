import { IAuctionService } from "./IAuctionService";
import { injectable } from "tsyringe";

@injectable()
export class AuctionService implements IAuctionService {
  // init
  constructor() {
    //TODO: implement startup logic
  }

  async getAuctionDetails(auctionId: string) {
    return {};
  }

  async getBids(auctionId: string) {
    return {};
  }

}
