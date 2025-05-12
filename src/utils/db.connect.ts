import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri!, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

export async function dbconnect() {
	try {
		await client.connect();
		console.log("Database connection is secure");
	} catch (error) {
		console.log(error);
	}
}

const db = client.db("gallant-database");
export const nonceCollection = db.collection("used-nonce");
export const usersData = db.collection("registered-user");
