import { SignInObject, SignUpObject } from "@/models/user";
import { AuthService } from "@/services/auth";
import Elysia from "elysia";

export const authRoute = new Elysia({ prefix: "/auth" })
	.decorate("auth", new AuthService())
	.post(
		"/signin",
		async (ctx) => {
			const loginUser = await ctx.auth.signIn(ctx.body);
			if (loginUser.type === "ERROR") {
				return {
					type: loginUser.type,
					message: loginUser.message,
				};
			}
			return {
				type: loginUser.type,
				message: loginUser.message,
				data: loginUser.data,
			};
		},
		{
			body: SignInObject,
		},
	)
	.post(
		"/signup",
		async (ctx) => {
			const data = await ctx.auth.signUp(ctx.body);

			ctx.set.status = data.status;

			return {
				type: data?.type,
				message: data?.message,
			};
		},
		{
			body: SignUpObject,
		},
	);
