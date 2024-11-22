import { db } from "@/database/db";
import { user } from "schema/user";

export class AuthService {
	private readonly secretKey = process.env.JWT_SECRET;
	async login(data: any) {
		try {
			//await db.select().from(user);
			//console.log(a);
			await db.insert(user).values(data);
		} catch (err) {
			console.log(err);
		}
	}
}
