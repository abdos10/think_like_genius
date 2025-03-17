import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  level: text("level").notNull().default("Beginner Thinker"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

// Thinking skills
export const thinkingSkills = pgTable("thinking_skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
});

export const insertThinkingSkillSchema = createInsertSchema(thinkingSkills);

// User skills progress
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skillId: integer("skill_id").notNull(),
  progress: integer("progress").notNull().default(0), // 0-100
  level: text("level").notNull().default("Beginner"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertUserSkillSchema = createInsertSchema(userSkills).pick({
  userId: true,
  skillId: true,
  progress: true,
  level: true,
});

// Exercises
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  skillId: integer("skill_id").notNull(),
  duration: integer("duration").notNull(), // in minutes
  difficulty: text("difficulty").notNull().default("Beginner"),
});

export const insertExerciseSchema = createInsertSchema(exercises);

// User activity
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(), // exercise, problem, etc.
  skillId: integer("skill_id"),
  exerciseId: integer("exercise_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  score: integer("score"), // percentage score if applicable
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserActivitySchema = createInsertSchema(userActivities).pick({
  userId: true,
  activityType: true,
  skillId: true,
  exerciseId: true,
  title: true,
  description: true,
  score: true,
});

// User problems
export const userProblems = pgTable("user_problems", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  problemType: text("problem_type").notNull(),
  description: text("description").notNull(),
  thinkingProcess: json("thinking_process"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserProblemSchema = createInsertSchema(userProblems).pick({
  userId: true,
  problemType: true,
  description: true,
});

// Achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Icon class name
  condition: text("condition").notNull(), // JSON string describing unlock condition
});

export const insertAchievementSchema = createInsertSchema(achievements);

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
});

// Weekly activity tracking
export const weeklyActivity = pgTable("weekly_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dayOfWeek: text("day_of_week").notNull(), // Mon, Tue, Wed, etc.
  minutesSpent: integer("minutes_spent").notNull().default(0),
  weekStartDate: timestamp("week_start_date").notNull(),
});

export const insertWeeklyActivitySchema = createInsertSchema(weeklyActivity).pick({
  userId: true,
  dayOfWeek: true,
  minutesSpent: true,
  weekStartDate: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ThinkingSkill = typeof thinkingSkills.$inferSelect;
export type InsertThinkingSkill = z.infer<typeof insertThinkingSkillSchema>;

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

export type UserProblem = typeof userProblems.$inferSelect;
export type InsertUserProblem = z.infer<typeof insertUserProblemSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type WeeklyActivity = typeof weeklyActivity.$inferSelect;
export type InsertWeeklyActivity = z.infer<typeof insertWeeklyActivitySchema>;
