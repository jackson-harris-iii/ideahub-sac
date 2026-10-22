CREATE TABLE `project_progress` (
	`idea` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'idea' NOT NULL,
	`demo_url` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL
);
