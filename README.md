# Wrapped Token && Oracle Web3 Bot

A simplified Oracle Web3 project, developed to monitor prices on the Polygon (Amoy) blockchain and update data in an Oracle through a backend bot.

## Goals

- Deepen understanding of Oracles in blockchain
- Implement a backend bot that monitors prices on Polygon and updates an Oracle with this data

## Features

- Monitor asset prices on the Polygon (Amoy) blockchain
- Automatically update data in the Oracle as prices change

## Stack

### Blockchain
- Hardhat
- Solidity
- Ethers
- Chai & Mocha
- Polygon blockchain (Amoy testnet)

### Backend
- Node.js
- Binance Api
- Alchemy 
- Ethers.js

## How to use

### backend .env suggestion

```bash
ORACLE_CONTRACT=0xE8f52bbeAfB7F42B7272A12B35A2deEC8a902aFB
REBASE_CONTRACT=0xBE096Ec5B017a31175513a2F2E7635fd36E3AB98
WALLET=*****
PRIVATE_KEY=*****
MAX_INTERVAL=3600000
MIN_INTERVAL=60000
PRICE_TRIGGER=0.5
NETWORK=polygon-amoy.g.alchemy.com
ALCHEMY_API_KEY=*****
```

### blockchain .env suggestion

```bash
SECRET=*****
API_KEY=*****
RPC_URL=https://rpc-amoy.polygon.technology/
CHAIN_ID=80002
```

- Clone the repo
``` bash
git clone https://github.com/JoaoVFerreira/wrappedToken.git
```

- Requires an account on a wallet client like Metamask or others...
- Adding **POL(POLYGON)** through a faucet. [POL Faucet](https://faucet.polygon.technology/)
- Need to create an account and switch to Polygon Amoy test net, as it's the testnet blockchain where the smart contract is deployed.
- Use suggested **env.**
- Run npm install and npm run start to start the bot and monitor price changes.

## License
This project is available under the **MIT License**