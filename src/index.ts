import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { AuthService } from "./services/auth";
import { createUserWithPassword, updateUser } from "schema/user";

const app = new Elysia()
	.decorate("auth", new AuthService())
	.use(
		cors({
			origin: ["http://localhost:3000"],
		}),
	)
	.use(swagger())
	.get("/", (ctx) => {
		return ctx.redirect("/swagger");
	})
	.post(
		"/",
		(ctx) => {
			ctx.auth.login(ctx.body);
		},
		{
			body: createUserWithPassword,
		},
	)
	.patch(
		"/",
		(ctx) => {
			ctx.auth.update(ctx.body);
		},
		{
			body: updateUser,
		},
	)
	.listen(3001);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
