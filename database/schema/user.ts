import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: uuid()
		.primaryKey()
		.$defaultFn(() => sql`uuid_generate_v4()`)
		.notNull(),
	email: text().unique().notNull(),
	username: text().unique(),
	password: text(),
	githubId: text(),
	githubUsername: text(),
	avatarUrl: text(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp().defaultNow().notNull(),
});
