// app/api/test/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	return NextResponse.json({ message: "GET request successful 🎉" });
}

export async function POST(request: NextRequest) {
	const body = await request.json();
	return NextResponse.json({
		message: "POST request successful 🎉",
		data: body,
	});
}
