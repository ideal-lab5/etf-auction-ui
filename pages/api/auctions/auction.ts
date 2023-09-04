import Cors from "cors";
import { container } from "tsyringe";
import { GenericRepository } from "../../../repositories/GenericRepository";
import { IGenericRepository } from "../../../repositories/IGenericRepository";

// Initializing the cors middleware
const cors = Cors({
  methods: ["POST", "HEAD"]
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  //check the expected method
  if (req.method === "POST") { // or GET, PUT, DELETE ...

    try {
      const instance = container.resolve(GenericRepository) as IGenericRepository;
      const cid = await instance.insertEntity(req.body);
      return res.status(200).json({
        auctionCID: cid
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  if (req.method === "GET") { // or GET, PUT, DELETE ...

    try {
      const instance = container.resolve(GenericRepository) as IGenericRepository;
      const auctionCID = req.query.cid;
      let result = [];
      if (auctionCID) result.push( await instance.retrieve(req.query.cid) );
      else result = await instance.listUploads();
      
      return res.status(200).json({
        auctions: result
      });

    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  return res.status(404).json({
    error: {
      code: "not_found",
      message: "The requested endpoint was not found or doesn't support this method."
    }
  });

}

export default handler;