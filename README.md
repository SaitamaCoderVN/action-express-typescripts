# Solana NFT Minting Action

This project is an Express TypeScript application that allows users to mint NFTs on the Solana network through a simple API.

## Features

- Minting Compressed NFTs on Solana
- RESTful API to interact with the application
- Integration with Solana Actions to create seamless user experiences

## Installation

1. Clone repository:
   ```
   git clone [url_of_repository]
   cd [project_directory_name]
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the necessary environment variables:
   ```
   SOLANA_RPC_URL=https://api.devnet.solana.com
   SOLANA_NETWORK=devnet
   PORT=8080
   BASE_URL=http://localhost:8080
   ICON_URL=[url_of_icon_if_any]
   ```

## Running the application

1. To run in development environment:
   ```
   npm run dev
   ```

2. To build and run in production environment:
   ```
   npm run build
   npm start
   ```

## Using the API

### Get Actions information

- GET `/actions.json`

### Get Actions information

- GET `/api/actions/mint-nft-dispenser`

### Mint NFT

- POST `/api/actions/mint-nft-dispenser`
  Body:
  ```json
  {
    "account": "địa_chỉ_ví_solana"
  }
  ```

## Project structure

- `index.ts`: Main application file
- `mint-cNFT.ts`: Contains logic to mint compressed NFTs
- `tsconfig.json`: TypeScript configuration file
- `package.json`: Manages dependencies and scripts

## Contributing

All contributions are welcome. Please create an issue or pull request to contribute.

## License

ISC
