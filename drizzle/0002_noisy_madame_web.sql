CREATE TABLE `interests` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`email` text NOT NULL,
	`interests` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `interest_visitor_time` ON `interests` (`visitor`,`created_at`);