import { db } from "@/database/db";
import { user } from "@/database/schema/user";
import { DrizzleError, eq, or } from "drizzle-orm";
import { SignUpDto, SignInDto } from "types/auth.types";
import { HttpStatus, ServiceResponse } from "types/response.types";

export class AuthService {
	async signIn(data: SignInDto): Promise<ServiceResponse> {
		try {
			const userData = await db
				.select()
				.from(user)
				.where(eq(user.email, data.email))
				.limit(1)
				.then((rows) => rows[0]);

			if (!userData) {
				return {
					status: HttpStatus.Unauthorized,
					type: "ERROR",
					message: "Invalid Credentials",
				};
			}

			const comparePassword = await Bun.password.verify(
				data.password,
				userData.password as string,
			);

			if (!comparePassword) {
				return {
					status: HttpStatus.Unauthorized,
					type: "ERROR",
					message: "Invalid Credentials",
				};
			}

			return {
				status: HttpStatus.OK,
				type: "SUCCESS",
				message: "User successfully logged in",
			};
		} catch (err) {
			if (err instanceof DrizzleError) {
				return {
					status: HttpStatus.InternalServerError,
					type: "ERROR",
					message: "Database error occured",
				};
			}
			return {
				status: HttpStatus.InternalServerError,
				type: "ERROR",
				message: "Uh oh an error occured",
			};
		}
	}
	async signUp(data: SignUpDto): Promise<ServiceResponse> {
		try {
			const isAvailable = await db
				.select()
				.from(user)
				.where(or(eq(user.email, data.email), eq(user.username, data.username)))
				.then((rows) => rows[0]);

			if (isAvailable) {
				if (isAvailable.username === data.username) {
					return {
						status: HttpStatus.Conflict,
						type: "ERROR",
						message: "Username already registered",
					};
				}

				if (isAvailable.email === data.email) {
					return {
						status: HttpStatus.Conflict,
						type: "ERROR",
						message: "Email already registered",
					};
				}
			}

			const hashedPassword = await Bun.password.hash(data.password);

			await db.insert(user).values({
				email: data.email,
				username: data.username,
				password: hashedPassword,
			});

			return {
				status: HttpStatus.Created,
				type: "SUCCESS",
				message: "User created successfully",
			};
		} catch (error) {
			if (error instanceof DrizzleError) {
				return {
					status: HttpStatus.InternalServerError,
					type: "ERROR",
					message: "Database error occured",
				};
			}
			return {
				status: HttpStatus.InternalServerError,
				type: "ERROR",
				message: "Uh oh an error occured",
			};
		}
	}
}
