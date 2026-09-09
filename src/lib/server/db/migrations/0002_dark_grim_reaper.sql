ALTER TABLE `services` ADD `widget_size` text DEFAULT '1x1' NOT NULL;--> statement-breakpoint
ALTER TABLE `services` ADD `require_auth_for_widget` integer DEFAULT false NOT NULL;