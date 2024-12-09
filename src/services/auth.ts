import { db } from "@/database/db";
import { user } from "@/database/schema/user";
import { github } from "@/lib/oauth";
import jwt from "@elysiajs/jwt";
import { generateState } from "arctic";
import { DrizzleError, eq, or } from "drizzle-orm";
import Elysia, { redirect } from "elysia";
import {
	SignUpDto,
	SignInDto,
	RefreshDto,
	CallbackDto,
} from "types/auth.types";
import { HttpStatus, ServiceResponse } from "types/response.types";

/*Create a hybrid approach to auth using jwt*/

export const AuthService = new Elysia({ name: "Auth.Service" })
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

		async callbackService(data: CallbackDto): Promise<ServiceResponse> {
			const url = new URL(data.url);
			const code = url.searchParams.get("code");
			const state = url.searchParams.get("state");

			return {
				status: HttpStatus.OK,
				type: "SUCCESS",
				message: "Callback successfull",
			};
		},

		/* Sign In Services
		 * Sign in the user by checking if the user is available
		 * and compare the password
		 */
		async signIn(): Promise<ServiceResponse> {
			const state = generateState();
			const url = github.createAuthorizationURL(state, []);

			return {
				status: HttpStatus.TemporaryRedirect,
				type: "SUCCESS",
				message: String(url),
			};
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
