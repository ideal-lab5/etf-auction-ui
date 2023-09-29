export enum AuctionStatus {
    Created = 0,
    Published = 1,
    Completed = 2,
    Canceled = 3,
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
     publishedAt: Date;
     deadline: number;
     owner: string;
     status: AuctionStatus;

    constructor(
      id: string,
      title: string,
      assetId: number,
      deposit: number,
      publishedAt: Date,
      deadline: number,
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
      this.owner = owner;
      this.status = status;
    }

  }
  