import { SignInObject, SignUpObject } from "@/models/user";
import { AuthService, AuthServiceE } from "@/services/auth";
import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import { ControllerResponse } from "types/response.types";

export const authRoute = new Elysia({ prefix: "/auth" })
	.use(
		jwt({
			name: "jwt",
			secret: process.env.JWT_SECRET!,
			exp: "15m",
		}),
	)
	//.decorate("auth", new AuthService(db))
	.use(AuthServiceE)
	.post(
		"/signin",
		async (ctx): Promise<ControllerResponse> => {
			const data = await ctx.auth.signIn(ctx.body);

			ctx.set.status = data.status;

			const token = await ctx.jwt.sign({
				sub: ctx.body.email,
				iss: "devflow",
				iat: Date.now(),
			});

			return {
				type: data.type,
				message: data.message,
				data: token,
			};
		},
		{
			body: SignInObject,
		},
	)
	.post(
		"/signup",
		async (ctx): Promise<ControllerResponse> => {
			const data = await ctx.auth.signUp(ctx.body);

			const token = await ctx.jwt.sign({
				sub: ctx.body.email,
				iss: "devflow",
				iat: Date.now(),
			});

			ctx.set.status = data.status;

			return {
				type: data.type,
				message: data.message,
				data: token,
			};
		},
		{
			body: SignUpObject,
		},
	)
	.get("/user", (ctx) => ctx.Auth.getUser(), {});
