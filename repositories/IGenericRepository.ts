import { CIDString, Web3Response } from "web3.storage";

export interface IGenericRepository {
    insertEntity(entity: any): Promise<string>;
    retrieve(cid: string): Promise<Web3Response>;
    listUploads (): any;
}
