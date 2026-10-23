CREATE TABLE `participation_followups` (
	`subject` text PRIMARY KEY NOT NULL,
	`state` text DEFAULT 'new' NOT NULL,
	`owner` text DEFAULT 'Site owner' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`matched_idea` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_profiles` (
	`idea` text PRIMARY KEY NOT NULL,
	`maintainer_name` text DEFAULT '' NOT NULL,
	`maintainer_url` text DEFAULT '' NOT NULL,
	`works_now` text DEFAULT '' NOT NULL,
	`help_needed` text DEFAULT '' NOT NULL,
	`source_url` text DEFAULT '' NOT NULL,
	`maintainer_consent` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
