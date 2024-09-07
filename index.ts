import dotenv from 'dotenv';
import express, { Request, Response } from "express";
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { createPostResponse, actionCorsMiddleware } from "@solana/actions";
import { mintNFT } from './mint-cNFT';

dotenv.config();

const DEFAULT_SOL_ADDRESS = Keypair.generate().publicKey;
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 
  clusterApiUrl(process.env.SOLANA_NETWORK as "mainnet-beta" | "testnet" | "devnet" | undefined || "devnet"),
  "confirmed"
);
console.log(connection);
const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const app = express();
app.use(express.json());
app.use(actionCorsMiddleware({}));

app.get("/actions.json", getActionsJson);
app.get("/api/actions/mint-nft-dispenser", getTransferSol);
app.post("/api/actions/mint-nft-dispenser", postTransferSol);

function getActionsJson(req: Request, res: Response): void {
  res.json({
    rules: [
      { pathPattern: "/*", apiPath: "/api/actions/*" },
      { pathPattern: "/api/actions/**", apiPath: "/api/actions/**" },
    ],
  });
}

async function getTransferSol(req: Request, res: Response): Promise<void> {
  try {
    const { toPubkey } = validatedQueryParams(req.query);
    const baseHref = `${BASE_URL}/api/actions/mint-nft-dispenser?to=${toPubkey.toBase58()}`;

    res.json({
      title: "Actions Example - Transfer Native SOL",
      icon: process.env.ICON_URL,
      description: "Transfer SOL to another Solana wallet",
      links: {
        actions: [
          { label: "Mint NFT", href: baseHref },
        ],
      },
    });
  } catch (err) {
    handleError(res, err);
  }
}

async function postTransferSol(req: Request, res: Response): Promise<void> {
  try {
    const { account } = req.body;
    if (!account) throw new Error('Invalid "account" provided');

    const accountPubkey = new PublicKey(account);
    console.log(accountPubkey);
    const { transaction, mint, keypair } = await mintNFT(accountPubkey, connection);
    const payload = await createResponsePayload(transaction as unknown as Transaction, mint, keypair);

    res.json(payload);
  } catch (err) {
    handleError(res, err, 400);
  }
}

async function createResponsePayload(transaction: Transaction, mint: any, keypair: Keypair): Promise<any> {
  return createPostResponse({
    fields: { transaction, message: "Claim Success" },
    signers: [keypair],
  });
}

function validatedQueryParams(query: any): { toPubkey: PublicKey } {
  let toPubkey = DEFAULT_SOL_ADDRESS;
  if (query.to) {
    try {
      toPubkey = new PublicKey(query.to);
    } catch (err) {
      throw new Error("Invalid input query parameter: to");
    }
  }
  return { toPubkey };
}

function handleError(res: Response, err: unknown, status: number = 500): void {
  const message = err instanceof Error ? err.message : 'An unknown error occurred';
  res.status(status).json({ error: message });
}

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app;
