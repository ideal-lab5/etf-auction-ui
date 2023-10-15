export enum AuctionStatus {
  Published = 0,
  Completed = 1,
  Canceled = 2,
}

/** 
 * This is the Auction domain class. It is used to represent an auction.
*/
export class Auction {
  id: string;
  title: string;
  assetId: number;
  deposit: number;
  bids: number;
  units: number;
  minBid: number;
  minBidUnit: string;
  publishedAt: any;
  deadline: number;
  deadlineSlot: number;
  owner: string;
  status: AuctionStatus;
  winner: string;

  constructor(
    id: string,
    title: string,
    assetId: number,
    deposit: number,
    publishedAt: any,
    deadline: number,
    deadlineSlot: number,
    owner: string,
    status: AuctionStatus
  ) {
    this.id = id;
    this.title = title;
    this.assetId = assetId;
    this.deposit = deposit;
    this.bids = 0;
    this.units = 0;
    this.minBid = 0;
    this.minBidUnit = "";
    this.publishedAt = publishedAt;
    this.deadline = deadline;
    this.deadlineSlot = deadlineSlot;
    this.owner = owner;
    this.status = status;
    this.winner = undefined;
  }

}
