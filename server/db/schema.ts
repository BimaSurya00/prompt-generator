import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'

export const topics = sqliteTable('topics', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const ideas = sqliteTable('ideas', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  selected: integer('selected').default(0),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  angleCategory: text('angle_category'),
  hookLine: text('hook_line'),
  oneLineConcept: text('one_line_concept'),
  targetEmotion: text('target_emotion'),
  selfScore: text('self_score'),
  totalScore: real('total_score'),
}, (t) => [
  index('idx_ideas_topic_id').on(t.topicId),
])

export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(),
  ideaId: text('idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  variant: text('variant').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  templateUsed: text('template_used'),
}, (t) => [
  index('idx_prompts_idea_id').on(t.ideaId),
])

export const usageLogs = sqliteTable('usage_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  endpoint: text('endpoint').notNull(),
  model: text('model').notNull(),
  promptTokens: integer('prompt_tokens').default(0),
  completionTokens: integer('completion_tokens').default(0),
  totalTokens: integer('total_tokens').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
}, (t) => [
  index('idx_usage_logs_created_at').on(t.createdAt),
])

export const activityPrompts = sqliteTable('activity_prompts', {
  id: text('id').primaryKey(),
  character: text('character').notNull(),
  activities: text('activities').notNull(),
  model: text('model').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
}, (t) => [
  index('idx_activity_prompts_created_at').on(t.createdAt),
])