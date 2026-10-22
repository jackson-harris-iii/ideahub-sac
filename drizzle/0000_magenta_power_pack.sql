CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor` text NOT NULL,
	`title` text NOT NULL,
	`audience` text NOT NULL,
	`problem` text NOT NULL,
	`approach` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `submission_visitor_time` ON `submissions` (`visitor`,`created_at`);--> statement-breakpoint
CREATE TABLE `votes` (
	`visitor` text PRIMARY KEY NOT NULL,
	`idea` text NOT NULL,
	`updated_at` integer NOT NULL
);
