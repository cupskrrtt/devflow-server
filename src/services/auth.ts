import { db } from "@/database/db";
import { user } from "@/database/schema/user";
import jwt from "@elysiajs/jwt";
import { DrizzleError, eq, or } from "drizzle-orm";
import Elysia from "elysia";
import { SignUpDto, SignInDto, RefreshDto } from "types/auth.types";
import { HttpStatus, ServiceResponse } from "types/response.types";

/*Create a hybrid approach to auth using jwt*/

export const AuthService = new Elysia({ name: "Auth.Service" })
	.use(
		jwt({
			name: "accessToken",
			secret: process.env.JWT_SECRET!,
			exp: "15m",
			iat: Date.now(),
			alg: "RS512",
		}),
	)
	.use(
		jwt({
			name: "refreshToken",
			secret: process.env.JWT_REFRESH_SECRET!,
			exp: "7d",
			iat: Date.now(),
			alg: "RS512",
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
					.select({
						email: user.email,
						username: user.username,
					})
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
				const userData = await ctx.db
					.insert(user)
					.values({
						email: data.email,
						username: data.username,
						password: hashedPassword,
					})
					.returning({ id: user.id });

				/*Generate token*/
				const accessToken = await ctx.accessToken.sign({
					sub: userData[0].id,
					iss: "devflow",
					iat: Math.floor(Date.now() / 1000),
					jti: Bun.randomUUIDv7("base64", Date.now()),
					type: "access",
				});

				const refreshToken = await ctx.refreshToken.sign({
					sub: userData[0].id,
					iss: "devflow",
					iat: Math.floor(Date.now() / 1000),
					jti: Bun.randomUUIDv7("base64", Date.now()),
					type: "refresh",
				});

				return {
					status: HttpStatus.Created,
					type: "SUCCESS",
					message: "User created successfully",
					data: {
						accessToken,
						refreshToken,
					},
				};
			} catch (error) {
				console.error(error);
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
					.select({ id: user.id, password: user.password })
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
				const accessToken = await ctx.accessToken.sign({
					sub: userData.id,
					iss: "devflow",
					iat: Math.floor(Date.now() / 1000),
					type: "access",
				});

				const refreshToken = await ctx.refreshToken.sign({
					sub: userData.id,
					iss: "devflow",
					iat: Math.floor(Date.now() / 1000),
					type: "refresh",
				});

				return {
					status: HttpStatus.OK,
					type: "SUCCESS",
					message: "User successfully logged in",
					data: {
						accessToken,
						refreshToken,
					},
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

		/* Refresh token service
		 * Refresh the access token by using the refresh token
		 */
		async refresh(data: RefreshDto): Promise<ServiceResponse> {
			const token = await ctx.refreshToken.verify(data.refreshToken);

			if (!token) {
				return {
					status: HttpStatus.Unauthorized,
					type: "ERROR",
					message: "Invalid Token",
				};
			}

			/*Generate token*/
			const accessToken = await ctx.accessToken.sign({
				sub: token.sub as string,
				iss: "devflow/auth",
				iat: Math.floor(Date.now() / 1000),
				type: "access",
			});

			const refreshToken = await ctx.refreshToken.sign({
				sub: token.sub as string,
				iss: "devflow/auth",
				iat: Math.floor(Date.now() / 1000),
				type: "refresh",
			});

			return {
				status: HttpStatus.OK,
				type: "SUCCESS",
				message: "Token refreshed successfully",
				data: {
					accessToken,
					refreshToken,
				},
			};
		},
	}));
