import { t } from "elysia";

export const UpdateUserObject = t.Object({
	email: t.Optional(t.String({ format: "email" })),
	username: t.Optional(t.String()),
	password: t.Optional(t.String()),
	avatarUrl: t.Optional(t.String({ format: "uri" })),
});
