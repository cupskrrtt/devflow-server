import { SignInObject, SignUpObject } from "@/models/user";
import { AuthService } from "@/services/auth";
import Elysia from "elysia";
import { ControllerResponse } from "types/response.types";

export const AuthController = new Elysia({ prefix: "/auth" })
	.use(AuthService)
	.post(
		"/signin",
		async (ctx): Promise<ControllerResponse> => {
			const data = await ctx.signIn(ctx.body);

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
			const data = await ctx.signUp(ctx.body);

			ctx.set.status = data.status;

			return {
				type: data.type,
				message: data.message,
				data: data.data,
			};
		},
		{
			body: SignUpObject,
		},
	);
