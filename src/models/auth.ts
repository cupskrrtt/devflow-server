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

export const RefreshObject = t.Object({
	refreshToken: t.String(),
});
