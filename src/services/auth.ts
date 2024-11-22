import { db } from "@/database/db";
import { eq, sql } from "drizzle-orm";
import { createUserWithPasswordDto, UpdateUserDTO, user } from "schema/user";

export class AuthService {
	private readonly secretKey = process.env.JWT_SECRET;
	async login(data: createUserWithPasswordDto) {
		try {
			await db.insert(user).values(data);
		} catch (err) {
			console.log(err);
		}
		return {
			type: "SUCCESS",
			message: "User created successfully",
		};
	}
	async update(data: UpdateUserDTO) {
		try {
			await db
				.update(user)
				.set({
					updatedAt: sql`NOW()`,
					...data,
				})
				.where(eq(user.id, "bbe56954-164f-4d63-8b9a-a2c8574096bb"));
		} catch (error) {
			console.log(error);
		}
		return {
			type: "SUCCESS",
			message: "User created successfully",
		};
	}
}
