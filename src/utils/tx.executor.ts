import {
	address,
	createSolanaClient,
	getExplorerLink,
	getSignatureFromTransaction,
	signTransactionMessageWithSigners,
} from "gill";
import { loadKeypairSignerFromEnvironment } from "gill/node";
import { buildTransferTokensTransaction, TOKEN_PROGRAM_ADDRESS } from "gill/programs/token";

export async function txExecutor(destination: string, amount: number) {
	const signer = await loadKeypairSignerFromEnvironment("SIGNER");

	const { rpc, sendAndConfirmTransaction } = createSolanaClient({
		urlOrMoniker: "devnet",
	});

	const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

	const mint = address("AEebqYuDhemMLP16MaLNEJSTFvCSzaiijTbQidFGs9m1");
	const tokenProgram = TOKEN_PROGRAM_ADDRESS;

	const tx = await buildTransferTokensTransaction({
		feePayer: signer,
		version: "legacy",
		latestBlockhash,
		amount: amount,
		authority: signer,
		destination: address(destination),
		mint,
		tokenProgram,
	});

	const signedTransaction = await signTransactionMessageWithSigners(tx);

	const explolerLink = getExplorerLink({
		cluster: "devnet",
		transaction: getSignatureFromTransaction(signedTransaction),
	});

	const confirmation = await sendAndConfirmTransaction(signedTransaction);

	return { signedTransaction, explolerLink, confirmation };
}
