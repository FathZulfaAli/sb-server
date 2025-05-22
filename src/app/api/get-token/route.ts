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

		const { wallet, action, matchPlayed, matchWin, winStreak } = body;

		const reward = winRewardCounter(matchWin, winStreak);

		const payload = {
			wallet,
			rewardMap: action,
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

		const userdata = await usersData.findOne({ wallet });

		let highestWinStreak;

		if (winStreak > userdata?.ttt.highestWinStreak) {
			highestWinStreak = winStreak;
		} else {
			highestWinStreak = userdata?.ttt.highestWinStreak;
		}

		await usersData.updateOne(
			{ wallet: wallet },
			{
				$set: {
					ttt: {
						matchPlayed: matchPlayed + userdata?.ttt.matchPlayed,
						matchWin: matchWin + userdata?.ttt.matchWin,
						highestWinStreak: highestWinStreak,
					},
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
