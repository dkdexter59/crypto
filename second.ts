import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js"
import * as anchor from '@project-serum/anchor'

export function loadWalletKey(keypairFile: string): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
}

const INITIALIZE = false;

async function main() {
    console.log("Let's name some tokens");

    const myKeypair = loadWalletKey("Dc5gWv6zEVfeFF44XFyrtRGvyqTt1NPeZT3FGWNWUmCn.json")
    console.log(myKeypair.publicKey.toBase58())
    const mint = new web3.PublicKey("Dbfcjo6PaeMbKhdGsDAa54r2kyEff66koZ7fXosCHpJv")


    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());

    const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);


    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: myKeypair.publicKey,
        payer: myKeypair.publicKey,
        updateAuthority: myKeypair.publicKey,
    }


    const dataV2 = {
        name: "Gizmooooo Coin",
        symbol: "$GIZMOOOOO",
        uri: "https://5ccwmdhforuyru3bwywsd2ilylllfwizxryzdjcvlyteshacee.arweave.net/6IVmDOV0aYjTYbYtIekLwtay2Rm8cZ-GkVV4mSRwCIY",
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,

    }



    let ix;
    if (INITIALIZE) {
        const args = {
            createMetadataAccountArgsV2: {
                data: dataV2,
                isMutable: true
            }
        };
        ix = mpl.createCreateMetadataAccountV2Instruction(accounts, args);
    } else {
        const args = {
            updateMetadataAccountArgsV2: {
                data: dataV2,
                isMutable: true,
                updateAuthority: myKeypair.publicKey,
                primarySaleHappened: true
            }
        };
        ix = mpl.createUpdateMetadataAccountV2Instruction(accounts, args)
    }




    const tx = new web3.Transaction();
    tx.add(ix);
    const connection = new web3.Connection("https://api.devnet.solana.com");
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [myKeypair]);
    console.log(txid);



}

main()