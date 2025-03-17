export interface User {
  id: number;
  username: string;
  displayName: string;
  level: string;
}

export interface ThinkingSkill {
  id: number;
  name: string;
  description: string;
  color: string;
}

export interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  progress: number;
  level: string;
  lastUpdated: string;
  skill?: ThinkingSkill;
}

export interface Exercise {
  id: number;
  title: string;
  description: string;
  skillId: number;
  duration: number;
  difficulty: string;
}

export interface UserActivity {
  id: number;
  userId: number;
  activityType: string;
  skillId?: number;
  exerciseId?: number;
  title: string;
  description: string;
  score?: number;
  createdAt: string;
  skill?: ThinkingSkill;
  exercise?: Exercise;
}

export interface WeeklyActivity {
  id: number;
  userId: number;
  dayOfWeek: string;
  minutesSpent: number;
  weekStartDate: string;
}

export interface UserProblem {
  id: number;
  userId: number;
  problemType: string;
  description: string;
  thinkingProcess: ThinkingProcess | null;
  createdAt: string;
}

export interface ThinkingProcess {
  steps: Array<{
    title: string;
    content: string;
  }>;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlocked?: boolean;
  unlockedAt?: string | null;
}

export interface ThinkingEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export interface GeneratedExercise {
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  instructions: string;
  evaluation: string;
}
