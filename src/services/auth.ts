import { db } from "@/database/db";
import { user } from "@/database/schema/user";
import jwt from "@elysiajs/jwt";
import { DrizzleError, eq, or } from "drizzle-orm";
import Elysia from "elysia";
import { SignUpDto, SignInDto } from "types/auth.types";
import { HttpStatus, ServiceResponse } from "types/response.types";

//TODO: find a way to make the service more readable

export const AuthService = new Elysia({ name: "Auth.Service" })
	.use(
		jwt({
			name: "jwt",
			secret: process.env.JWT_SECRET!,
			exp: "15m",
		}),
	)
	.decorate("db", db)
	.derive({ as: "scoped" }, (ctx) => ({
		/* Sign Up
		 * Sign up the user by checking if the requested data available or not
		 */
		async signUp(data: SignUpDto): Promise<ServiceResponse> {
			try {
				/*Check for existing user*/
				const isAvailable = await ctx.db
					.select()
					.from(user)
					.where(
						or(eq(user.email, data.email), eq(user.username, data.username)),
					)
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

				/*Create user*/
				const hashedPassword = await Bun.password.hash(data.password);
				await ctx.db.insert(user).values({
					email: data.email,
					username: data.username,
					password: hashedPassword,
				});

				/*Generate token*/
				const token = await ctx.jwt.sign({
					sub: data.email,
					iss: "devflow",
					iat: Date.now(),
				});

				return {
					status: HttpStatus.Created,
					type: "SUCCESS",
					message: "User created successfully",
					data: token,
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
		},

		/* Sign In Services
		 * Sign in the user by checking if the user is available
		 * and compare the password
		 */
		async signIn(data: SignInDto): Promise<ServiceResponse> {
			try {
				/*Get user data*/
				const userData = await ctx.db
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

				/*Compare password*/
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

				/*Generate token*/
				const token = await ctx.jwt.sign({
					sub: data.email,
					iss: "devflow",
					iat: Date.now(),
				});

				return {
					status: HttpStatus.OK,
					type: "SUCCESS",
					message: "User successfully logged in",
					data: token,
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
		},
	}));
