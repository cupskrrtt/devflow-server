import { RefreshObject, SignInObject, SignUpObject } from "@/models/auth";
import { AuthService } from "@/services/auth";
import Elysia from "elysia";
import { ControllerResponse } from "types/response.types";

export const AuthController = new Elysia({ prefix: "/auth" })
	.use(AuthService)
	.get("/github/signin", async (ctx) => {
		const data = await ctx.signIn();
		ctx.set.status = data.status;

		return ctx.redirect(data.message);
	})
	.get("/github/callback", async (ctx) => {
		const data = await ctx.callbackService({
			url: ctx.request.url,
		});
		ctx.set.status = data.status;
		return {
			type: data.type,
			message: data.message,
			data: data.data,
		};
	})
	.post(
		"/refresh",
		async (ctx): Promise<ControllerResponse> => {
			const data = await ctx.refresh(ctx.body);

			ctx.set.status = data.status;

			return {
				type: data.type,
				message: data.message,
				data: data.data,
			};
		},
		{
			body: RefreshObject,
		},
	);
