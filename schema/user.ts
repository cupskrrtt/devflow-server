import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-typebox";
import { t } from "elysia";

export const user = pgTable("user", {
	id: uuid()
		.primaryKey()
		.$defaultFn(() => sql`uuid_generate_v4()`),
	email: text().notNull(),
	username: text(),
	password: text(),
	githubId: text(),
	githubUsername: text(),
	avatarUrl: text(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp().defaultNow().notNull(),
});

const _createUser = createInsertSchema(user, {
	email: t.String({ format: "email" }),
	avatarUrl: t.String({ format: "uri" }),
});

export const createUserWithPassword = t.Omit(_createUser, [
	"id",
	"githubId",
	"githubUsername",
	"avatarUrl",
	"createdAt",
	"updatedAt",
]);

export const updateUser = t.Omit(_createUser, [
	"id",
	"githubId",
	"githubUsername",
	"createdAt",
	"updatedAt",
]);

export type createUserWithPasswordDto = typeof createUserWithPassword.static;
export type UpdateUserDTO = typeof updateUser.static;
