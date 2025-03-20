import {
  users, type User, type InsertUser,
  thinkingSkills, type ThinkingSkill, type InsertThinkingSkill,
  userSkills, type UserSkill, type InsertUserSkill,
  exercises, type Exercise, type InsertExercise,
  userActivities, type UserActivity, type InsertUserActivity,
  userProblems, type UserProblem, type InsertUserProblem,
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  weeklyActivity, type WeeklyActivity, type InsertWeeklyActivity
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Skills
  getSkills(): Promise<ThinkingSkill[]>;
  getSkill(id: number): Promise<ThinkingSkill | undefined>;
  createSkill(skill: InsertThinkingSkill): Promise<ThinkingSkill>;

  // User Skills
  getUserSkills(userId: number): Promise<UserSkill[]>;
  getUserSkill(userId: number, skillId: number): Promise<UserSkill | undefined>;
  createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;
  updateUserSkill(id: number, userSkill: Partial<UserSkill>): Promise<UserSkill | undefined>;

  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  getExercisesBySkill(skillId: number): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;

  // User Activities
  getUserActivities(userId: number, limit?: number): Promise<UserActivity[]>;
  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;

  // User Problems
  getUserProblems(userId: number): Promise<UserProblem[]>;
  getUserProblem(id: number): Promise<UserProblem | undefined>;
  createUserProblem(problem: InsertUserProblem): Promise<UserProblem>;
  updateUserProblemThinkingProcess(id: number, thinkingProcess: any): Promise<UserProblem | undefined>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  // User Achievements
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;

  // Weekly Activity
  getWeeklyActivity(userId: number, weekStartDate: Date): Promise<WeeklyActivity[]>;
  createWeeklyActivity(activity: InsertWeeklyActivity): Promise<WeeklyActivity>;
  updateWeeklyActivity(id: number, minutesSpent: number): Promise<WeeklyActivity | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, ThinkingSkill>;
  private userSkills: Map<number, UserSkill>;
  private exercises: Map<number, Exercise>;
  private userActivities: Map<number, UserActivity>;
  private userProblems: Map<number, UserProblem>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private weeklyActivities: Map<number, WeeklyActivity>;
  
  private currentUserId: number;
  private currentSkillId: number;
  private currentUserSkillId: number;
  private currentExerciseId: number;
  private currentUserActivityId: number;
  private currentUserProblemId: number;
  private currentAchievementId: number;
  private currentUserAchievementId: number;
  private currentWeeklyActivityId: number;

  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.userSkills = new Map();
    this.exercises = new Map();
    this.userActivities = new Map();
    this.userProblems = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.weeklyActivities = new Map();
    
    this.currentUserId = 1;
    this.currentSkillId = 1;
    this.currentUserSkillId = 1;
    this.currentExerciseId = 1;
    this.currentUserActivityId = 1;
    this.currentUserProblemId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;
    this.currentWeeklyActivityId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create default user
    const user: User = {
      id: this.currentUserId++,
      username: 'Abdo',
      password: 'password',
      displayName: 'Sabbagh',
      level: 'Intermediate Thinker'
    };
    this.users.set(user.id, user);

    // Create thinking skills
    const criticalSkill: ThinkingSkill = {
      id: this.currentSkillId++,
      name: 'Critical Thinking',
      description: 'Analyze and evaluate information to form a judgment',
      color: '#ef476f' // critical
    };
    this.skills.set(criticalSkill.id, criticalSkill);

    const creativeSkill: ThinkingSkill = {
      id: this.currentSkillId++,
      name: 'Creative Thinking',
      description: 'Generate innovative ideas and solutions',
      color: '#06d6a0' // creative
    };
    this.skills.set(creativeSkill.id, creativeSkill);

    const strategicSkill: ThinkingSkill = {
      id: this.currentSkillId++,
      name: 'Strategic Thinking',
      description: 'Plan and make decisions for long-term success',
      color: '#118ab2' // strategic
    };
    this.skills.set(strategicSkill.id, strategicSkill);

    const analyticalSkill: ThinkingSkill = {
      id: this.currentSkillId++,
      name: 'Analytical Thinking',
      description: 'Break complex problems into parts to find solutions',
      color: '#ffd166' // analytical
    };
    this.skills.set(analyticalSkill.id, analyticalSkill);

    // Create user skills
    const criticalUserSkill: UserSkill = {
      id: this.currentUserSkillId++,
      userId: user.id,
      skillId: criticalSkill.id,
      progress: 85,
      level: 'Advanced',
      lastUpdated: new Date()
    };
    this.userSkills.set(criticalUserSkill.id, criticalUserSkill);

    const creativeUserSkill: UserSkill = {
      id: this.currentUserSkillId++,
      userId: user.id,
      skillId: creativeSkill.id,
      progress: 65,
      level: 'Intermediate',
      lastUpdated: new Date()
    };
    this.userSkills.set(creativeUserSkill.id, creativeUserSkill);

    const strategicUserSkill: UserSkill = {
      id: this.currentUserSkillId++,
      userId: user.id,
      skillId: strategicSkill.id,
      progress: 60,
      level: 'Intermediate',
      lastUpdated: new Date()
    };
    this.userSkills.set(strategicUserSkill.id, strategicUserSkill);

    const analyticalUserSkill: UserSkill = {
      id: this.currentUserSkillId++,
      userId: user.id,
      skillId: analyticalSkill.id,
      progress: 80,
      level: 'Advanced',
      lastUpdated: new Date()
    };
    this.userSkills.set(analyticalUserSkill.id, analyticalUserSkill);

    // Create exercises
    const exercises: Partial<Exercise>[] = [
      {
        title: 'Logical Fallacies Challenge',
        description: 'Identify common logical fallacies in arguments',
        skillId: criticalSkill.id,
        duration: 20,
        difficulty: 'Intermediate'
      },
      {
        title: 'Lateral Thinking Puzzles',
        description: 'Solve problems using indirect and creative approaches',
        skillId: creativeSkill.id,
        duration: 25,
        difficulty: 'Intermediate'
      },
      {
        title: 'Market Entry Strategy',
        description: 'Develop a strategic plan for a company entering a new market',
        skillId: strategicSkill.id,
        duration: 30,
        difficulty: 'Advanced'
      },
      {
        title: 'Data Pattern Recognition',
        description: 'Identify patterns and trends in datasets',
        skillId: analyticalSkill.id,
        duration: 15,
        difficulty: 'Beginner'
      },
      {
        title: 'Divergent Thinking Challenge',
        description: 'Generate multiple solutions to everyday problems',
        skillId: creativeSkill.id,
        duration: 20,
        difficulty: 'Intermediate'
      }
    ];

    exercises.forEach(ex => {
      const exercise: Exercise = {
        id: this.currentExerciseId++,
        ...ex as Omit<Exercise, 'id'>
      };
      this.exercises.set(exercise.id, exercise);
    });

    // Create user activities
    const activities: Partial<UserActivity>[] = [
      {
        userId: user.id,
        activityType: 'exercise',
        skillId: criticalSkill.id,
        exerciseId: 1,
        title: 'Completed Critical Thinking Exercise',
        description: 'Logical Fallacies Challenge - Score: 92%',
        score: 92,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        userId: user.id,
        activityType: 'exercise',
        skillId: creativeSkill.id,
        exerciseId: 2,
        title: 'Started Creative Thinking Session',
        description: 'Lateral Thinking Puzzles - In progress',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      },
      {
        userId: user.id,
        activityType: 'problem',
        skillId: strategicSkill.id,
        title: 'Solved Business Problem',
        description: 'Market Entry Strategy - Score: 78%',
        score: 78,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    activities.forEach(act => {
      const activity: UserActivity = {
        id: this.currentUserActivityId++,
        ...act as Omit<UserActivity, 'id'>
      };
      this.userActivities.set(activity.id, activity);
    });

    // Create achievements
    const achievementsList: Partial<Achievement>[] = [
      {
        name: 'Critical Thinker',
        description: 'Complete 10 critical thinking exercises',
        icon: 'ri-award-line',
        condition: 'exercises.critical >= 10'
      },
      {
        name: 'Strategic Master',
        description: '75% accuracy in strategic exercises',
        icon: 'ri-rocket-line',
        condition: 'accuracy.strategic >= 75'
      },
      {
        name: 'Consistency',
        description: 'Practice for 5 consecutive days',
        icon: 'ri-timer-line',
        condition: 'streak >= 5'
      },
      {
        name: 'Idea Generator',
        description: 'Create 50 unique ideas in exercises',
        icon: 'ri-lightbulb-line',
        condition: 'ideas >= 50'
      }
    ];

    achievementsList.forEach(ach => {
      const achievement: Achievement = {
        id: this.currentAchievementId++,
        ...ach as Omit<Achievement, 'id'>
      };
      this.achievements.set(achievement.id, achievement);
    });

    // Unlock two achievements for the user
    const userAchievements: Partial<UserAchievement>[] = [
      {
        userId: user.id,
        achievementId: 1,
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: user.id,
        achievementId: 3,
        unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    userAchievements.forEach(uAch => {
      const userAchievement: UserAchievement = {
        id: this.currentUserAchievementId++,
        ...uAch as Omit<UserAchievement, 'id'>
      };
      this.userAchievements.set(userAchievement.id, userAchievement);
    });

    // Create weekly activity data
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Start from Monday
    weekStart.setHours(0, 0, 0, 0);

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const minutesSpentByDay = [30, 45, 60, 35, 50, 40, 45];

    daysOfWeek.forEach((day, index) => {
      const weeklyAct: WeeklyActivity = {
        id: this.currentWeeklyActivityId++,
        userId: user.id,
        dayOfWeek: day,
        minutesSpent: minutesSpentByDay[index],
        weekStartDate: weekStart
      };
      this.weeklyActivities.set(weeklyAct.id, weeklyAct);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, level: 'Beginner Thinker' };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Skills methods
  async getSkills(): Promise<ThinkingSkill[]> {
    return Array.from(this.skills.values());
  }

  async getSkill(id: number): Promise<ThinkingSkill | undefined> {
    return this.skills.get(id);
  }

  async createSkill(skill: InsertThinkingSkill): Promise<ThinkingSkill> {
    const id = this.currentSkillId++;
    const newSkill: ThinkingSkill = { ...skill, id };
    this.skills.set(id, newSkill);
    return newSkill;
  }

  // User Skills methods
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return Array.from(this.userSkills.values()).filter(
      (userSkill) => userSkill.userId === userId
    );
  }

  async getUserSkill(userId: number, skillId: number): Promise<UserSkill | undefined> {
    return Array.from(this.userSkills.values()).find(
      (userSkill) => userSkill.userId === userId && userSkill.skillId === skillId
    );
  }

  async createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
    const id = this.currentUserSkillId++;
    const newUserSkill: UserSkill = { 
      ...userSkill, 
      id, 
      progress: userSkill.progress ?? 0, 
      level: userSkill.level ?? 'beginner', 
      lastUpdated: new Date()
    };
    this.userSkills.set(id, newUserSkill);
    return newUserSkill;
  }

  async updateUserSkill(id: number, userSkillData: Partial<UserSkill>): Promise<UserSkill | undefined> {
    const userSkill = this.userSkills.get(id);
    if (!userSkill) return undefined;
    
    const updatedUserSkill: UserSkill = { 
      ...userSkill, 
      ...userSkillData,
      progress: userSkillData.progress ?? userSkill.progress,
      level: userSkillData.level ?? userSkill.level,
      lastUpdated: new Date()
    };
    this.userSkills.set(id, updatedUserSkill);
    return updatedUserSkill;
  }

  // Exercises methods
  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async getExercisesBySkill(skillId: number): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.skillId === skillId
    );
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = this.currentExerciseId++;
    const newExercise: Exercise = { 
      ...exercise, 
      id, 
      difficulty: exercise.difficulty ?? 'medium' 
    };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  // User Activities methods
  async getUserActivities(userId: number, limit?: number): Promise<UserActivity[]> {
    const activities = Array.from(this.userActivities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }

  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const id = this.currentUserActivityId++;
    const newActivity: UserActivity = { 
      ...activity, 
      id, 
      score: activity.score ?? null,
      skillId: activity.skillId ?? null,
      exerciseId: activity.exerciseId ?? null,
      createdAt: new Date() 
    };
    this.userActivities.set(id, newActivity);
    return newActivity;
  }

  // User Problems methods
  async getUserProblems(userId: number): Promise<UserProblem[]> {
    return Array.from(this.userProblems.values())
      .filter((problem) => problem.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserProblem(id: number): Promise<UserProblem | undefined> {
    return this.userProblems.get(id);
  }

  async createUserProblem(problem: InsertUserProblem): Promise<UserProblem> {
    const id = this.currentUserProblemId++;
    const newProblem: UserProblem = { 
      ...problem, 
      id, 
      thinkingProcess: null,
      createdAt: new Date() 
    };
    this.userProblems.set(id, newProblem);
    return newProblem;
  }

  async updateUserProblemThinkingProcess(id: number, thinkingProcess: any): Promise<UserProblem | undefined> {
    const problem = this.userProblems.get(id);
    if (!problem) return undefined;
    
    const updatedProblem: UserProblem = { 
      ...problem, 
      thinkingProcess
    };
    this.userProblems.set(id, updatedProblem);
    return updatedProblem;
  }

  // Achievements methods
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentAchievementId++;
    const newAchievement: Achievement = { ...achievement, id };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  // User Achievements methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(
      (userAchievement) => userAchievement.userId === userId
    );
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.currentUserAchievementId++;
    const newUserAchievement: UserAchievement = { 
      ...userAchievement, 
      id, 
      unlockedAt: new Date() 
    };
    this.userAchievements.set(id, newUserAchievement);
    return newUserAchievement;
  }

  // Weekly Activity methods
  async getWeeklyActivity(userId: number, weekStartDate: Date): Promise<WeeklyActivity[]> {
    return Array.from(this.weeklyActivities.values()).filter(
      (activity) => 
        activity.userId === userId && 
        activity.weekStartDate.getTime() === weekStartDate.getTime()
    );
  }

  async createWeeklyActivity(activity: InsertWeeklyActivity): Promise<WeeklyActivity> {
    const id = this.currentWeeklyActivityId++;
    const newActivity: WeeklyActivity = { ...activity, id };
    this.weeklyActivities.set(id, newActivity);
    return newActivity;
  }

  async updateWeeklyActivity(id: number, minutesSpent: number): Promise<WeeklyActivity | undefined> {
    const activity = this.weeklyActivities.get(id);
    if (!activity) return undefined;
    
    const updatedActivity: WeeklyActivity = { 
      ...activity, 
      minutesSpent
    };
    this.weeklyActivities.set(id, updatedActivity);
    return updatedActivity;
  }
}

export const storage = new MemStorage();
