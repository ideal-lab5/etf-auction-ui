import { Auction, AuctionStatus } from "../domain/Auction";
import { IAuctionService } from "./IAuctionService";
import { injectable } from "tsyringe";

@injectable()
export class AuctionService implements IAuctionService {
  // init
  constructor() {
    //TODO: implement startup logic
  }

  getPublishedAuctions(): Auction[] {
    return [
      new Auction(
        "1",
        "Auction 1",
        5,
        1,
        1,
        "DOT",
        new Date(),
        new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3),
        "user1",
        AuctionStatus.Published,
      ),
      new Auction(
        "2",
        "Auction 2",
        3,
        1,
        1,
        "DOT",
        new Date(),
        new Date( new Date().getTime() + 1000 * 60 * 60 * 24 * 2),
        "user2",
        AuctionStatus.Published,
      ),
      new Auction(
        "3",
        "Auction 4",
        10,
        1,
        1,
        "DOT",
        new Date(),
        new Date( new Date().getTime() - 1000 * 60 * 60 * 24 * 10),
        "user3",
        AuctionStatus.Completed,
      ),
    ];
  }

}
