import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { nonceCollection } from "@/utils/db.connect";

export async function POST(request: NextRequest) {
	try {
		if (!request.body) {
			return NextResponse.json({ error: "No data provided" }, { status: 400 });
		}
		const body = await request.json();

		const { wallet, action } = body;

		const rewardMapping: Record<string, number> = {
			ttt_w: 500_000_000,
			ttt_ws2: 750_000_000,
			ttt_ws3: 1_000_000_000,
			ttt_ws4: 2_000_000_000,
			ttt_ws5: 3_000_000_000,
		};

		if (!wallet || !(action in rewardMapping))
			return NextResponse.json({ error: "Invalid data" }, { status: 400 });

		const rewardAmount = rewardMapping[action];

		const payload = {
			wallet,
			rewardMap: action,
			rewardAmount,
			nonce: Math.random().toString(36).substring(2, 10),
		};

		await nonceCollection.insertOne({
			wallet: wallet,
			amount: rewardAmount,
			nonce: payload.nonce,
			createdat: new Date(),
		});

		if (!process.env.JWT_SECRET) {
			throw new Error("JWT_SECRET is not defined in the environment variables.");
		}

		const token = jwt.sign(payload, process.env.JWT_SECRET!);

		return NextResponse.json({ token }, { status: 200 });
	} catch (error) {
		console.error("Get recipe error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
