import { usersData } from "@/utils/db.connect";
import { NextRequest, NextResponse } from "next/server";

export default async function POST(request: NextRequest) {
	try {
		let body;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
		}

		const { wallet } = body;

		if (!wallet) {
			return NextResponse.json({ error: "Invalid tata" }, { status: 400 });
		}

		const userdata = await usersData.findOne({ wallet });

		if (userdata) {
			return NextResponse.json(userdata, { status: 200 });
		}

		await usersData.insertOne({
			wallet,
			ttt: {
				matchPlayed: 0,
				matchWin: 0,
				highestWinStreak: 0,
			},
			totalNblrMinted: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return NextResponse.json("User registered successfully", { status: 201 });
	} catch (error) {
		console.error("Login e error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
