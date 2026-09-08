CREATE TYPE "public"."auth_token_type" AS ENUM('email_verification', 'password_reset');--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"type" "auth_token_type" NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"theme" varchar(50) DEFAULT 'system' NOT NULL,
	"color_theme" varchar(50) DEFAULT 'default' NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"number_format" varchar(50) DEFAULT 'en-IN' NOT NULL,
	"date_format" varchar(50) DEFAULT 'DD/MM/YYYY' NOT NULL,
	"timezone" varchar(100) DEFAULT 'Asia/Kolkata' NOT NULL,
	"notify_security_alerts" boolean DEFAULT true NOT NULL,
	"notify_account_activity" boolean DEFAULT true NOT NULL,
	"notify_monthly_summary" boolean DEFAULT false NOT NULL,
	"notify_budget_approaching" boolean DEFAULT true NOT NULL,
	"notify_budget_exceeded" boolean DEFAULT true NOT NULL,
	"notify_high_spending" boolean DEFAULT false NOT NULL,
	"notify_product_updates" boolean DEFAULT false NOT NULL,
	"notify_new_features" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;