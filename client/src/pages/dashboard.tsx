import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SkillsChart } from "@/components/dashboard/skills-chart";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { SkillCard } from "@/components/dashboard/skill-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RecommendedExercise } from "@/components/dashboard/recommended-exercise";
import { ProblemForm } from "@/components/problem-solver/problem-form";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { User, UserSkill, WeeklyActivity, UserActivity, Exercise, Achievement, ThinkingSkill } from "@/lib/types";

export default function Dashboard() {
  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/users/current"],
  });

  // Get user skills
  const { data: userSkills, isLoading: isLoadingSkills } = useQuery<(UserSkill & { skill: ThinkingSkill })[]>({
    queryKey: ["/api/user-skills"],
    enabled: !!currentUser,
  });

  // Get weekly activity
  const { data: weeklyActivity, isLoading: isLoadingWeekly } = useQuery<WeeklyActivity[]>({
    queryKey: ["/api/weekly-activity"],
    enabled: !!currentUser,
  });

  // Get recent activities
  const { data: recentActivities, isLoading: isLoadingActivities } = useQuery<UserActivity[]>({
    queryKey: ["/api/user-activities", { limit: 3 }],
    enabled: !!currentUser,
  });

  // Get exercises
  const { data: exercises, isLoading: isLoadingExercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
    enabled: !!currentUser,
  });

  // Get achievements
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery<Achievement[]>({
    queryKey: ["/api/user-achievements"],
    enabled: !!currentUser,
  });

  // Create a map of skills by ID for easier lookup
  const skillsMap = userSkills?.reduce((map, userSkill) => {
    if (userSkill.skill) {
      map[userSkill.skillId] = {
        name: userSkill.skill.name,
        color: userSkill.skill.color
      };
    }
    return map;
  }, {} as Record<number, { name: string, color: string }>) || {};

  return (
    <div className="p-4 md:p-6">
      {/* Welcome & Stats */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading mb-2">
          Welcome back, {currentUser?.displayName?.split(' ')[0] || 'User'}!
        </h2>
        <p className="text-gray-600">
          Continue your thinking journey. You've completed <span className="font-medium text-primary">12 exercises</span> this week.
        </p>
      </div>
      
      {/* Skills Overview & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Skills Radar Chart */}
        <SkillsChart 
          userSkills={userSkills || []}
          isLoading={isLoadingSkills}
        />
        
        {/* Weekly Progress */}
        <WeeklyChart 
          weeklyActivity={weeklyActivity || []}
          isLoading={isLoadingWeekly}
        />
      </div>
      
      {/* Thinking Skills Cards */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-heading">Your Thinking Skills</h3>
          <a href="/training" className="text-primary font-medium text-sm flex items-center">
            View All 
            <i className="ri-arrow-right-line ml-1"></i>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingSkills ? (
            <div className="col-span-full py-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            userSkills?.map(userSkill => (
              <SkillCard key={userSkill.id} userSkill={userSkill} />
            ))
          )}
        </div>
      </div>
      
      {/* Recent Activities & Recommended Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activities */}
        <RecentActivity 
          activities={recentActivities || []}
          isLoading={isLoadingActivities}
        />
        
        {/* Recommended Exercises */}
        <RecommendedExercise 
          exercises={exercises?.slice(0, 2) || []}
          skills={skillsMap}
          isLoading={isLoadingExercises}
        />
      </div>
      
      {/* Problem Solver Preview */}
      {currentUser && (
        <ProblemForm userId={currentUser.id} />
      )}
      
      {/* Achievement Preview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold font-heading">Recent Achievements</h3>
          <a href="/achievements" className="text-primary text-sm">View All</a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingAchievements ? (
            <div className="col-span-full py-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            achievements?.slice(0, 4).map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
