import { IGenericRepository } from "./IGenericRepository";
import { injectable } from "tsyringe";

import { CarReader } from '@ipld/car'
import { encode } from 'multiformats/block'
import * as cbor from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
import { Web3Storage } from 'web3.storage'

const WEB3STORAGE_TOKEN = process.env.WEB3STORAGE_TOKEN;

@injectable()
export class GenericRepository implements IGenericRepository {

  storage: Web3Storage;

  constructor() {
    this.storage = new Web3Storage({ token: WEB3STORAGE_TOKEN });
  }

  async insertEntity(entity: any) {
    // encode the value into an IPLD block and store with Web3.Storage
    const block = await this.encodeCborBlock(entity);
    const car = await this.makeCar(block.cid, [block]);
    // upload to Web3.Storage using putCar
    console.log('🤖 Storing simple CBOR object...');
    const cid = await this.storage.putCar(car);
    return cid.toString();
  }

  async retrieve(cid: string) {
    const res = await this.storage.get(cid)
    console.log(`Got a response! [${res.status}] ${res.statusText}`)
    if (!res.ok) {
      throw new Error(`failed to get ${cid}`)
    }

    return res;
  }

  async listUploads () {
    const uploads = [];
    for await (const upload of this.storage.list()) {
      uploads.push({
        cid: upload.cid,
        name: upload.name,
        created: upload.created,
        dagSize: upload.dagSize
      });
    }
    return uploads;
  }

  private async encodeCborBlock(value: any) {
    return encode({ value, codec: cbor, hasher: sha256 });
  }

  async makeCar(rootCID: any, ipldBlocks: any) {
    return new CarReader(1, [rootCID], ipldBlocks);
  }


}
