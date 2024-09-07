import { Keypair, PublicKey, Transaction, Connection } from "@solana/web3.js";
import { fromWeb3JsKeypair, toWeb3JsInstruction, toWeb3JsTransaction } from "@metaplex-foundation/umi-web3js-adapters";
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { keypairIdentity, generateSigner, Umi } from '@metaplex-foundation/umi';
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import { none } from '@metaplex-foundation/umi';
import bs58 from "bs58";
import { publicKey } from '@metaplex-foundation/umi';

export function createUmiInstance(keypair: Keypair): Umi {
  return createUmi(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
    .use(mplTokenMetadata())
    .use(keypairIdentity(fromWeb3JsKeypair(keypair)));
}

export async function createNftBuilder(umi: Umi, toPubkey: PublicKey) {
  return mintV1(umi, {
    leafOwner: publicKey(toPubkey),
    merkleTree: publicKey("Eue3Ne7kSPxNAUX6aFMzHeNhjuzJn8ehnYWsoQkYAcju"),
    metadata: {
      name: 'My Compressed NFT',
      uri: 'https://example.com/my-cnft.json',
      sellerFeeBasisPoints: 500,
      collection: none(),
      creators: [
        { address: publicKey(toPubkey), verified: false, share: 100 },
      ],
    },
  });
}

export async function mintNFT(accountPubkey: PublicKey, connection: Connection) {
  const keypair = Keypair.fromSecretKey(
    bs58.decode(
      "ugvDsV7MmAkexcKFrsy2dUoA9uMfX5FNXMbaNPDBUhVMffRb2CgPk1cz4ResrVBgYp1Z7TPdZYKgvrMRDnXs9sA"
    )
  );
  console.log("keypair", keypair.publicKey);
  const umi = createUmiInstance(keypair);
  const mint = generateSigner(umi);
  console.log("mint", mint);

  console.log("accountPubkey", accountPubkey);
  const builder = await createNftBuilder(umi, accountPubkey);
  // const builderTransaction = await builder.buildAndSign(umi);

  const isx = await builder.getInstructions().map(toWeb3JsInstruction);

  // const web3JsTransaction = toWeb3JsTransaction(builderTransaction);

  // Không thể trực tiếp gán feePayer và recentBlockhash cho VersionedTransaction
  // Thay vào đó, chúng ta cần tạo một Transaction mới với các thông tin này
  // web3JsTransaction.feePayer = accountPubkey;
  const transaction = new Transaction().add(...isx);

  transaction.feePayer = accountPubkey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return { transaction, mint, keypair };
}