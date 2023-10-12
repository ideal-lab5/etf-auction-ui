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