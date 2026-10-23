import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const votes = sqliteTable("votes", {visitor: text("visitor").primaryKey(), idea: text("idea").notNull(), updatedAt: integer("updated_at").notNull()});
export const submissions = sqliteTable("submissions", {id:text("id").primaryKey(),visitor:text("visitor").notNull(),title:text("title").notNull(),audience:text("audience").notNull(),problem:text("problem").notNull(),approach:text("approach").notNull(),createdAt:integer("created_at").notNull(),status:text("status").notNull().default("pending")},table=>[index("submission_visitor_time").on(table.visitor,table.createdAt)]);

export const contributions=sqliteTable("contributions",{id:text("id").primaryKey(),visitor:text("visitor").notNull(),idea:text("idea").notNull(),kind:text("kind").notNull(),description:text("description").notNull(),details:text("details").notNull().default(""),contact:text("contact").notNull().default(""),createdAt:integer("created_at").notNull(),status:text("status").notNull().default("pending")},table=>[index("contribution_visitor_time").on(table.visitor,table.createdAt),index("contribution_idea_status").on(table.idea,table.status)]);
export const researchReports=sqliteTable("research_reports",{subject:text("subject").primaryKey(),snapshot:text("snapshot").notNull(),sources:text("sources").notNull(),version:text("version").notNull(),createdAt:integer("created_at").notNull(),trigger:text("trigger").notNull()});
export const notificationOutbox=sqliteTable("notification_outbox",{id:text("id").primaryKey(),kind:text("kind").notNull(),status:text("status").notNull().default("pending"),attempts:integer("attempts").notNull().default(0),createdAt:integer("created_at").notNull(),attemptedAt:integer("attempted_at"),providerId:text("provider_id"),error:text("error")});
export const moderationEvents=sqliteTable("moderation_events",{id:text("id").primaryKey(),subject:text("subject").notNull(),status:text("status").notNull(),createdAt:integer("created_at").notNull()});

export const interests=sqliteTable("interests",{id:text("id").primaryKey(),visitor:text("visitor").notNull(),name:text("name").notNull().default(""),email:text("email").notNull(),interests:text("interests").notNull(),note:text("note").notNull().default(""),consentVersion:text("consent_version").notNull(),createdAt:integer("created_at").notNull(),status:text("status").notNull().default("new")},table=>[index("interest_visitor_time").on(table.visitor,table.createdAt)]);

export const projectProgress=sqliteTable("project_progress",{idea:text("idea").primaryKey(),status:text("status").notNull().default("idea"),demoUrl:text("demo_url").notNull().default(""),updatedAt:integer("updated_at").notNull()});

export const projectProfiles=sqliteTable('project_profiles',{
 idea:text('idea').primaryKey(),maintainerName:text('maintainer_name').notNull().default(''),maintainerUrl:text('maintainer_url').notNull().default(''),
 worksNow:text('works_now').notNull().default(''),helpNeeded:text('help_needed').notNull().default(''),sourceUrl:text('source_url').notNull().default(''),
 maintainerConsent:integer('maintainer_consent').notNull().default(0),updatedAt:integer('updated_at').notNull(),
});

export const participationFollowups=sqliteTable('participation_followups',{
 subject:text('subject').primaryKey(),state:text('state').notNull().default('new'),owner:text('owner').notNull().default('Site owner'),
 notes:text('notes').notNull().default(''),matchedIdea:text('matched_idea').notNull().default(''),updatedAt:integer('updated_at').notNull(),revision:integer('revision').notNull().default(1),
});
