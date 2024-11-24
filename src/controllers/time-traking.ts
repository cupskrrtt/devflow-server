import Elysia from "elysia";
import { TimeTrackingService } from "@/services/time-tracking";

export const TimeTrackingController = new Elysia({ prefix: "/time" }).use(
	TimeTrackingService,
);
