import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-typebox";
import { t } from "elysia";

export const user = pgTable("user", {
	id: uuid()
		.primaryKey()
		.$defaultFn(() => createId()),
	email: text().notNull(),
	username: text(),
	password: text(),
	githubId: text(),
	githubUsername: text(),
	avatarUrl: text(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp(),
});

export const CreateUserDTO = createInsertSchema(user, {
	email: t.String({ format: "email" }),
	username: t.String(),
	password: t.String(),
	githubId: t.String(),
	githubUsername: t.String(),
	avatarUrl: t.String({ format: "uri" }),
});
