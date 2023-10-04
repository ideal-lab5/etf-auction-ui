import { Auction, AuctionStatus } from "../domain/Auction";
import { IAuctionService } from "./IAuctionService";
import { singleton } from "tsyringe";
import contractMetadata from '../assets/proxy/tlock_proxy.json';
import contractData from '../assets/proxy/tlock_proxy.contract.json';

@singleton()
export class AuctionService implements IAuctionService {
  //mock attribute representing the list of auctions
  private mockAuctions: Auction[];
  private api: any;

  constructor() {
    //TODO: implement startup logic
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
        new Date( new Date().getTime() + 1000 * 60 * 60 * 24 * 2).getTime(),
        "user2",
        AuctionStatus.Published,
      ),
      new Auction(
        "3",
        "Auction 4",
        3,
        10,
        new Date(),
        new Date( new Date().getTime() - 1000 * 60 * 60 * 24 * 10).getTime(),
        "user3",
        AuctionStatus.Completed,
      ),
    ];
  }
  async cancelAuction (signer: any, auctionId: string): Promise<Auction> {
      let auction = this.mockAuctions.find(auction => auction.id === auctionId && auction.owner === signer);
      if(auction){
        auction.status = AuctionStatus.Canceled;
      }
      return Promise.resolve(auction);
  }
  async newAuction(signer: any, title: string, assetId: number, deadline: number, deposit: number): Promise<Auction> {

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
  async completeAuction(signer: any, auctionId: string): Promise<Auction> {
    let auction = this.mockAuctions.find(auction => auction.id === auctionId);
    if(auction){
     auction.status = AuctionStatus.Completed;
    }
    return Promise.resolve(auction);
  }
  getPublishedAuctions(): Auction[] {
    return this.mockAuctions
  }

  getMyAuctions(owner: any): Auction[] {
    return this.mockAuctions.filter(auction => auction.owner === owner);
  }
  getMyBids(bidder: any): Auction[] {
    return [];
  }
}
