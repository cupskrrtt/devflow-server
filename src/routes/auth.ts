import { SignInObject, SignUpObject } from "@/models/user";
import { AuthService } from "@/services/auth";
import Elysia from "elysia";
import { ControllerResponse } from "types/response.types";

//TODO: find out how to implement jwt is it using jwt package or elysia/jwt

export const authRoute = new Elysia({ prefix: "/auth" })
	.decorate("auth", new AuthService())
	.post(
		"/signin",
		async (ctx): Promise<ControllerResponse> => {
			const data = await ctx.auth.signIn(ctx.body);

			ctx.set.status = data.status;

			return {
				type: data.type,
				message: data.message,
				data: data.data,
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
