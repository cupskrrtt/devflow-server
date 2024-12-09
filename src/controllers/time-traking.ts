import Elysia from "elysia";
import { TimeTrackingService } from "@/services/time-traking";

export const TimeTrackingController = new Elysia({ prefix: "/time" }).use(
	TimeTrackingService,
);
