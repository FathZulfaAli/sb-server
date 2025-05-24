import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { nonceCollection, usersData } from "@/utils/db.connect";
import { winRewardCounter } from "@/utils/win.counter";

export async function POST(request: NextRequest) {
	try {
		let body;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
		}

		const { wallet, game, matchPlayed, matchWin, winStreak } = body;

		const reward = winRewardCounter(matchWin, winStreak);

		const payload = {
			wallet,
			reward,
			nonce: Math.random().toString(36).substring(2, 10),
		};

		await nonceCollection.insertOne({
			wallet: wallet,
			amount: reward,
			nonce: payload.nonce,
			status: "pending",
			createdat: new Date(),
		});

		await usersData.updateOne(
			{ wallet },
			{
				$set: { updatedAt: new Date() },
				$inc: {
					[`${game}.matchPlayed`]: matchPlayed,
					[`${game}.matchWin`]: matchWin,
					totalNblrMinted: reward,
				},
				$max: {
					[`${game}.highestWinStreak`]: winStreak,
				},
			}
		);

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
