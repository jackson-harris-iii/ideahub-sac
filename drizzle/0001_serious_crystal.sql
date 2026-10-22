CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor` text NOT NULL,
	`idea` text NOT NULL,
	`kind` text NOT NULL,
	`description` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`contact` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contribution_visitor_time` ON `contributions` (`visitor`,`created_at`);--> statement-breakpoint
CREATE INDEX `contribution_idea_status` ON `contributions` (`idea`,`status`);--> statement-breakpoint
CREATE TABLE `moderation_events` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notification_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`attempted_at` integer,
	`provider_id` text,
	`error` text
);
--> statement-breakpoint
CREATE TABLE `research_reports` (
	`subject` text PRIMARY KEY NOT NULL,
	`snapshot` text NOT NULL,
	`sources` text NOT NULL,
	`version` text NOT NULL,
	`created_at` integer NOT NULL,
	`trigger` text NOT NULL
);
