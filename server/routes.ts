import express, { type Express, Router } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserProblemSchema, 
  insertUserSchema, 
  insertUserActivitySchema,
  insertUserSkillSchema 
} from "@shared/schema";
import { 
  generateThinkingProcess, 
  evaluateThinkingProcess,
  generateExercise, 
  reverseEngineerThinking,
  verifyThinkingProcess
} from "./openai";

// Helper function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return "An unexpected error occurred";
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();

  // Auth routes
  apiRouter.post("/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Initialize user skills
      const skills = await storage.getSkills();
      for (const skill of skills) {
        await storage.createUserSkill({
          userId: user.id,
          skillId: skill.id,
          progress: 0,
          level: 'Beginner'
        });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  apiRouter.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // User routes
  apiRouter.get("/users/current", async (req, res) => {
    try {
      // For demo purposes, return the first user
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // Skills routes
  apiRouter.get("/skills", async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  apiRouter.get("/skills/:id", async (req, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const skill = await storage.getSkill(skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(skill);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // User skills routes
  apiRouter.get("/user-skills", async (req, res) => {
    try {
      // For demo purposes, get skills for user 1
      const userId = 1;
      const userSkills = await storage.getUserSkills(userId);
      
      // Get the skill details for each user skill
      const userSkillsWithDetails = await Promise.all(
        userSkills.map(async (userSkill) => {
          const skill = await storage.getSkill(userSkill.skillId);
          return {
            ...userSkill,
            skill
          };
        })
      );
      
      res.json(userSkillsWithDetails);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  apiRouter.put("/user-skills/:id", async (req, res) => {
    try {
      const userSkillId = parseInt(req.params.id);
      const updateSchema = z.object({
        progress: z.number().min(0).max(100).optional(),
        level: z.string().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      const updatedUserSkill = await storage.updateUserSkill(userSkillId, validatedData);
      
      if (!updatedUserSkill) {
        return res.status(404).json({ message: "User skill not found" });
      }
      
      res.json(updatedUserSkill);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // Exercises routes
  apiRouter.get("/exercises", async (req, res) => {
    try {
      const skillId = req.query.skillId ? parseInt(req.query.skillId as string) : undefined;
      
      let exercises;
      if (skillId) {
        exercises = await storage.getExercisesBySkill(skillId);
      } else {
        exercises = await storage.getExercises();
      }
      
      res.json(exercises);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  apiRouter.get("/exercises/:id", async (req, res) => {
    try {
      const exerciseId = parseInt(req.params.id);
      const exercise = await storage.getExercise(exerciseId);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // User activities routes
  apiRouter.get("/user-activities", async (req, res) => {
    try {
      // For demo purposes, get activities for user 1
      const userId = 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const activities = await storage.getUserActivities(userId, limit);
      
      // Get the skill details for each activity
      const activitiesWithDetails = await Promise.all(
        activities.map(async (activity) => {
          const skill = activity.skillId ? await storage.getSkill(activity.skillId) : null;
          const exercise = activity.exerciseId ? await storage.getExercise(activity.exerciseId) : null;
          
          return {
            ...activity,
            skill,
            exercise
          };
        })
      );
      
      res.json(activitiesWithDetails);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  apiRouter.post("/user-activities", async (req, res) => {
    try {
      const activityData = insertUserActivitySchema.parse(req.body);
      const newActivity = await storage.createUserActivity(activityData);
      res.status(201).json(newActivity);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // Problem solver routes
  apiRouter.post("/problems", async (req, res) => {
    try {
      const problemData = insertUserProblemSchema.parse(req.body);
      const newProblem = await storage.createUserProblem(problemData);
      res.status(201).json(newProblem);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  apiRouter.get("/problems", async (req, res) => {
    try {
      // For demo purposes, get problems for user 1
      const userId = 1;
      const problems = await storage.getUserProblems(userId);
      res.json(problems);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  apiRouter.get("/problems/:id", async (req, res) => {
    try {
      const problemId = parseInt(req.params.id);
      const problem = await storage.getUserProblem(problemId);
      
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      
      res.json(problem);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  apiRouter.post("/problems/:id/thinking-process", async (req, res) => {
    try {
      const problemId = parseInt(req.params.id);
      const problem = await storage.getUserProblem(problemId);
      
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      
      const thinkingProcess = await generateThinkingProcess(
        problem.problemType,
        problem.description
      );
      
      const updatedProblem = await storage.updateUserProblemThinkingProcess(
        problemId,
        thinkingProcess
      );
      
      res.json(updatedProblem);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // Thinking process evaluation
  apiRouter.post("/evaluate-thinking", async (req, res) => {
    try {
      const schema = z.object({
        problemType: z.string(),
        description: z.string(),
        thinkingProcess: z.string(),
        expectedOutcome: z.string()
      });
      
      const { problemType, description, thinkingProcess, expectedOutcome } = schema.parse(req.body);
      
      const evaluation = await evaluateThinkingProcess(
        problemType,
        description,
        thinkingProcess,
        expectedOutcome
      );
      
      // Save the activity for history tracking
      // For demo purposes, use user 1
      const userId = 1;
      
      await storage.createUserActivity({
        userId,
        activityType: "thinking_evaluation",
        title: `Evaluated ${problemType}: ${description.substring(0, 30)}...`,
        description: description,
        score: evaluation.score,
        skillId: null,
        exerciseId: null
      });
      
      res.json(evaluation);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // Generate exercise
  apiRouter.post("/generate-exercise", async (req, res) => {
    try {
      const schema = z.object({
        thinkingType: z.enum(["Critical", "Creative", "Strategic", "Analytical"])
      });
      
      const { thinkingType } = schema.parse(req.body);
      const exercise = await generateExercise(thinkingType);
      
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // Reverse engineer thinking
  apiRouter.post("/reverse-engineer", async (req, res) => {
    try {
      const schema = z.object({
        problemType: z.string(),
        problem: z.string(),
        solution: z.string().optional()
      });
      
      const { problemType, problem, solution } = schema.parse(req.body);
      const result = await reverseEngineerThinking(problemType, problem, solution || "");
      
      // Save the activity for history tracking
      // For demo purposes, use user 1
      const userId = 1;
      
      await storage.createUserActivity({
        userId,
        activityType: "reverse_engineering",
        title: `Idea Journey ${problemType}: ${problem.substring(0, 30)}...`,
        description: problem,
        score: null,
        skillId: null,
        exerciseId: null
      });
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // Verify thinking process
  apiRouter.post("/verify-thinking", async (req, res) => {
    try {
      const schema = z.object({
        problem: z.string(),
        thinkingProcess: z.string(),
        conclusion: z.string()
      });
      
      const { problem, thinkingProcess, conclusion } = schema.parse(req.body);
      const result = await verifyThinkingProcess(problem, thinkingProcess, conclusion);
      
      // Save the activity for history tracking
      // For demo purposes, use user 1
      const userId = 1;
      
      await storage.createUserActivity({
        userId,
        activityType: "thinking_verification",
        title: `Verified Thinking: ${problem.substring(0, 30)}...`,
        description: problem,
        score: Math.round(result.confidence * 100),
        skillId: null,
        exerciseId: null
      });
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // Get thinking process history
  apiRouter.get("/thinking-history", async (req, res) => {
    try {
      // For demo purposes, get history for user 1
      const userId = 1;
      const activityType = req.query.type as string;
      
      if (!activityType || !["thinking_evaluation", "reverse_engineering", "thinking_verification"].includes(activityType)) {
        return res.status(400).json({ message: "Invalid activity type" });
      }
      
      // Get the activities for the specific thinking process type
      const activities = await storage.getUserActivities(userId);
      const filteredActivities = activities
        .filter(activity => activity.activityType === activityType)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(filteredActivities);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // Weekly activity routes
  apiRouter.get("/weekly-activity", async (req, res) => {
    try {
      // For demo purposes, get weekly activity for user 1
      const userId = 1;
      
      // Get current week start date (Monday)
      const now = new Date();
      const weekStartDate = new Date(now);
      weekStartDate.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      weekStartDate.setHours(0, 0, 0, 0);
      
      const weeklyActivity = await storage.getWeeklyActivity(userId, weekStartDate);
      
      res.json(weeklyActivity);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  // Achievements routes
  apiRouter.get("/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  apiRouter.get("/user-achievements", async (req, res) => {
    try {
      // For demo purposes, get achievements for user 1
      const userId = 1;
      const userAchievements = await storage.getUserAchievements(userId);
      
      // Get the achievement details for each user achievement
      const achievementsWithDetails = await Promise.all(
        userAchievements.map(async (userAchievement) => {
          const achievement = await storage.getAchievement(userAchievement.achievementId);
          return {
            ...userAchievement,
            achievement
          };
        })
      );
      
      // Get all achievements for reference
      const allAchievements = await storage.getAchievements();
      
      // Mark which achievements are unlocked
      const result = allAchievements.map(achievement => {
        const userAchievement = achievementsWithDetails.find(
          ua => ua.achievementId === achievement.id
        );
        
        return {
          ...achievement,
          unlocked: !!userAchievement,
          unlockedAt: userAchievement?.unlockedAt || null
        };
      });
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
