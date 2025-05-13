import { nonceCollection } from "@/utils/db.connect";
import { jwtVerifier } from "@/utils/jwt.verifier";
import { txExecutor } from "@/utils/tx.executor";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		let body;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
		}

		const { playerPubKey, token } = body;

		if (!playerPubKey || !token)
			return NextResponse.json({ error: "Invalid data" }, { status: 400 });

		const decoded = await jwtVerifier(token);

		if (typeof decoded === "string")
			return NextResponse.json({ error: "Invalid token" }, { status: 400 });

		if (decoded.wallet !== playerPubKey)
			return NextResponse.json({ error: "Invalid wallet" }, { status: 400 });

		const nonce = await nonceCollection.findOne({ wallet: decoded.wallet });

		if (!nonce) return NextResponse.json({ error: "No no no" }, { status: 400 });

		if (nonce.nonce !== decoded.nonce)
			return NextResponse.json(
				{ error: "no no no this token has beed used" },
				{ status: 400 }
			);

		console.log("Nonce:", nonce);

		if (nonce.status === "completed")
			return NextResponse.json({ error: "No no no invalid token" }, { status: 400 });

		const tx = await txExecutor(decoded.wallet, decoded.rewardAmount);

		await nonceCollection.updateOne(
			{ nonce: decoded.nonce },
			{ $set: { status: "completed", link: tx.explorerLink } }
		);

		return NextResponse.json({ link: tx.explorerLink }, { status: 200 });
	} catch (error) {
		console.error("Reward error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
