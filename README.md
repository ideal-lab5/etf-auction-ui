# ETF Sealed Auction dapp

## .env
```
NEXT_PUBLIC_CONTRACT_ADDRESS: the address of the proxy contract
NEXT_PUBLIC_NODE_DETAILS: fully qualified url of the node
```
## Start with
```bash
npm install
```
## How to run
```bash
npm run dev
```

## Docker

The dapp can be run from the docker build as well. 

### Run

``` bash
# fetch the docker image
docker pull ideallabs/etf-auction-ui
# run
docker run -p 3000:3000 --rm ideallabs/etf-auction-ui
```

### Build

To build the docker image, from the root, execute:

``` bash
docker-compose build
```

## As a static site

This project can also be run as a static site, which can then be hosted in IPFS, for example.

In order to use as a static site, generate the `out` directory by running:

``` bash
npm run export
```

The static site is generated in the generated directory. Not that this will run a custom scripte, `replacer.js`, which handles replacing file paths in the generated build. See this [open issue](https://github.com/vercel/next.js/issues/8158) on the next.js github for more insights into this.
