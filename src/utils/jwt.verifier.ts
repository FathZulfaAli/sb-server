import jwt from "jsonwebtoken";

export async function jwtVerifier(token: string) {
	const decode = jwt.verify(token, process.env.JWT_SECRET!);
	return decode;
}
