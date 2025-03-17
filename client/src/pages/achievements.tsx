import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { Achievement } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Achievements() {
  const [achievementFilter, setAchievementFilter] = useState("all");
  
  // Get achievements
  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/user-achievements"],
  });

  // Filter achievements
  const filteredAchievements = achievements?.filter(achievement => {
    if (achievementFilter === "all") return true;
    if (achievementFilter === "unlocked") return achievement.unlocked;
    if (achievementFilter === "locked") return !achievement.unlocked;
    return true;
  });

  // Calculate achievement stats
  const calculateStats = () => {
    if (!achievements) {
      return {
        total: 0,
        unlocked: 0,
        percentage: 0
      };
    }

    const total = achievements.length;
    const unlocked = achievements.filter(a => a.unlocked).length;
    const percentage = Math.round((unlocked / total) * 100) || 0;

    return {
      total,
      unlocked,
      percentage
    };
  };

  const stats = calculateStats();

  // Group achievements by category (based on icon)
  const groupedAchievements = () => {
    const grouped: Record<string, Achievement[]> = {};
    
    filteredAchievements?.forEach(achievement => {
      // Extract category from icon (assuming icon contains category information)
      let category = "General";
      
      if (achievement.icon.includes("award")) {
        category = "Mastery";
      } else if (achievement.icon.includes("rocket")) {
        category = "Progress";
      } else if (achievement.icon.includes("timer")) {
        category = "Consistency";
      } else if (achievement.icon.includes("lightbulb")) {
        category = "Creativity";
      }
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push(achievement);
    });
    
    return grouped;
  };

  const achievementGroups = groupedAchievements();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading mb-2">Achievements</h2>
        <p className="text-gray-600">
          Track your progress and earn badges for improving your thinking skills.
        </p>
      </div>
      
      {/* Achievement Progress */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold mb-4">Your Achievement Progress</h3>
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <ProgressCircle 
                    progress={stats.percentage} 
                    size={80} 
                    strokeWidth={8} 
                    circleClassName="text-primary" 
                    textClassName="text-lg"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Achievements Unlocked</p>
                  <p className="text-2xl font-bold">{stats.unlocked} / {stats.total}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                Keep completing exercises and improving your thinking skills to unlock more achievements.
              </p>
              
              {/* Most recent achievement */}
              {achievements && achievements.filter(a => a.unlocked).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Most Recent Achievement</p>
                  {(() => {
                    const mostRecent = achievements?.find(a => a.unlocked);
                    return (
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 text-primary flex items-center justify-center mr-3">
                          <i className={cn(
                            mostRecent?.icon || "ri-award-line",
                            "text-xl"
                          )}></i>
                        </div>
                        <div>
                          <p className="font-medium">
                            {mostRecent?.name || "Achievement"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {mostRecent?.description || "Complete challenges to earn achievements"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Achievement Benefits</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex">
                    <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary w-6 h-6 mr-2">✓</span>
                    <span>Track your learning progress</span>
                  </li>
                  <li className="flex">
                    <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary w-6 h-6 mr-2">✓</span>
                    <span>Stay motivated with clear goals</span>
                  </li>
                  <li className="flex">
                    <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary w-6 h-6 mr-2">✓</span>
                    <span>Measure skill development</span>
                  </li>
                  <li className="flex">
                    <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary w-6 h-6 mr-2">✓</span>
                    <span>Showcase your thinking abilities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Achievement List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Achievement Gallery</h3>
            <Tabs defaultValue="all" value={achievementFilter} onValueChange={setAchievementFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
                <TabsTrigger value="locked">Locked</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredAchievements && filteredAchievements.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(achievementGroups).map(([category, achievements]) => (
                <div key={category}>
                  <h4 className="text-md font-bold mb-3 text-gray-800">{category} Achievements</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {achievements.map(achievement => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <i className="ri-trophy-line text-5xl mb-3 block"></i>
              <p>No achievements found with the current filter.</p>
              <p className="text-sm mt-1">Try a different filter or keep practicing to unlock achievements.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
