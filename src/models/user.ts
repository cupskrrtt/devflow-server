import { t } from "elysia";

export const SignUpObject = t.Object({
	email: t.String({ format: "email" }),
	username: t.String(),
	password: t.String({ minLength: 8 }),
});

export const SignInObject = t.Object({
	email: t.String({ format: "email" }),
	password: t.String(),
});

export const UpdateUserObject = t.Object({
	email: t.Optional(t.String({ format: "email" })),
	username: t.Optional(t.String()),
	password: t.Optional(t.String()),
	avatarUrl: t.Optional(t.String({ format: "uri" })),
});
