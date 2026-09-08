CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `services` ADD `size` text DEFAULT '1x1' NOT NULL;--> statement-breakpoint
ALTER TABLE `services` ADD `is_widget` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `services` ADD `require_auth` integer DEFAULT false NOT NULL;