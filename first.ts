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



async function main() {
    console.log("Let's name some tokens");

    const myKeypair = loadWalletKey("GmP636mF3GPHx5Wum7UscqJXatNXC742B7hyDDncEXxR.json")
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
        name: "Lord Dexter Token",
        symbol: "$LDEX",
        uri: "https://gateway.pinata.cloud/ipfs/QmYUbTrhfCPPSbeZgdj1RWX5b5gMtQ8hQe6EtSSSt9FmKn?_gl=1*18pyw3y*rs_ga*NTM0MTQ1ODMtYTA5Zi00NzgzLWFkNWUtM2VmYjZkNTE5NmRj*rs_ga_5RMPXG14TE*MTY4MTA2NDA2Ny4xLjEuMTY4MTA2NDE2Ni4yMi4wLjA.",
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    }

    const args = {
        createMetadataAccountArgsV2: {
            data: dataV2,
            isMutable: true
        }
    };

    const ix = mpl.createCreateMetadataAccountV2Instruction(accounts, args);
    const tx = new web3.Transaction();
    tx.add(ix);
    const connection = new web3.Connection("https://api.mainnet.solana.com");
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [myKeypair]);
    console.log(txid);



}

main()