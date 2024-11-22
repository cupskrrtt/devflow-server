import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { CreateUserDTO } from "../schema/user";
import { AuthService } from "./services/auth";

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
			body: t.Omit(CreateUserDTO, [
				"id",
				"githubId",
				"githubUsername",
				"avatarUrl",
				"createdAt",
				"updatedAt",
			]),
		},
	)
	.listen(3001);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
