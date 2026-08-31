CREATE TABLE IF NOT EXISTS `activity_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`character` text NOT NULL,
	`activities` text NOT NULL,
	`model` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_activity_prompts_created_at` ON `activity_prompts` (`created_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`content` text NOT NULL,
	`selected` integer DEFAULT 0,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')),
	`angle_category` text,
	`hook_line` text,
	`one_line_concept` text,
	`target_emotion` text,
	`self_score` text,
	`total_score` real,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_ideas_topic_id` ON `ideas` (`topic_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`idea_id` text NOT NULL,
	`variant` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`template_used` text,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_prompts_idea_id` ON `prompts` (`idea_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `usage_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`endpoint` text NOT NULL,
	`model` text NOT NULL,
	`prompt_tokens` integer DEFAULT 0,
	`completion_tokens` integer DEFAULT 0,
	`total_tokens` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_usage_logs_created_at` ON `usage_logs` (`created_at`);