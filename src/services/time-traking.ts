import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

export const TimeTrackingService = new Elysia({
	name: "TimeTracking.Service",
})
	.use(
		jwt({
			name: "jwt",
			secret: process.env.JWT_SECRET!,
		}),
	)
	.derive({ as: "scoped" }, (ctx) => ({
		async startTime(userId: string) {},
	}));
