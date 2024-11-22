CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"password" text,
	"githubId" text,
	"githubUsername" text,
	"avatarUrl" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp
);
