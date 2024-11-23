import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { authRoute } from "@/routes/auth";

const app = new Elysia()
	.use(
		cors({
			origin: ["http://localhost:3000"],
		}),
	)
	.use(swagger())
	.get("/", (ctx) => {
		return ctx.redirect("/swagger");
	})
	.use(authRoute)
	.listen(3001);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
