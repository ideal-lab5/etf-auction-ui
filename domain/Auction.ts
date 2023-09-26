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
     id: string
     title: string
     bids: number
     units: number
     minBid: number
     minBidUnit: string
     publishedAt: Date
     deadline: Date
     owner: string
     status: AuctionStatus

    constructor(
      id: string,
      title: string,
      bids: number,
      units: number,
      minBid: number,
      minBidUnit: string,
      publishedAt: Date,
      deadline: Date,
      owner: string,
      status: AuctionStatus
    ) {
      this.id = id
      this.title = title
      this.bids = bids
      this.units = units
      this.minBid = minBid
      this.minBidUnit = minBidUnit
      this.publishedAt = publishedAt
      this.deadline = deadline
      this.owner = owner
      this.status = status
    }
  }
  