import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { UserSkill, ThinkingSkill, UserActivity, WeeklyActivity } from "@/lib/types";

// Register all Chart.js components
Chart.register(...registerables);

export default function Analytics() {
  // Time period selection
  const [timePeriod, setTimePeriod] = useState("all");
  
  // Get user skills
  const { data: userSkills, isLoading: isLoadingSkills } = useQuery<(UserSkill & { skill: ThinkingSkill })[]>({
    queryKey: ["/api/user-skills"],
  });

  // Get weekly activity
  const { data: weeklyActivity, isLoading: isLoadingWeekly } = useQuery<WeeklyActivity[]>({
    queryKey: ["/api/weekly-activity"],
  });

  // Get user activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery<UserActivity[]>({
    queryKey: ["/api/user-activities"],
  });

  // Chart refs
  const progressChartRef = useRef<HTMLCanvasElement>(null);
  const progressChartInstance = useRef<Chart | null>(null);
  
  const activityChartRef = useRef<HTMLCanvasElement>(null);
  const activityChartInstance = useRef<Chart | null>(null);
  
  const timeSpentChartRef = useRef<HTMLCanvasElement>(null);
  const timeSpentChartInstance = useRef<Chart | null>(null);
  
  const accuracyChartRef = useRef<HTMLCanvasElement>(null);
  const accuracyChartInstance = useRef<Chart | null>(null);

  // Calculate stats
  const calculateStats = () => {
    if (!userSkills || !activities || !weeklyActivity) {
      return {
        totalExercises: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        exercisesThisWeek: 0
      };
    }

    const exercisesWithScores = activities.filter(a => a.score !== undefined && a.score !== null);
    const totalExercises = exercisesWithScores.length;
    const averageScore = totalExercises > 0 
      ? Math.round(exercisesWithScores.reduce((sum, a) => sum + (a.score || 0), 0) / totalExercises) 
      : 0;
    
    const totalTimeSpent = weeklyActivity.reduce((sum, day) => sum + day.minutesSpent, 0);
    
    // Calculate exercises completed this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const exercisesThisWeek = activities.filter(a => {
      const activityDate = new Date(a.createdAt);
      return activityDate >= startOfWeek && a.activityType === 'exercise';
    }).length;

    return {
      totalExercises,
      averageScore,
      totalTimeSpent,
      exercisesThisWeek
    };
  };

  const stats = calculateStats();

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Initialize progress chart
  useEffect(() => {
    if (!progressChartRef.current || !userSkills || userSkills.length === 0) return;

    if (progressChartInstance.current) {
      progressChartInstance.current.destroy();
    }

    // Sort skills by progress for better visualization
    const sortedSkills = [...userSkills].sort((a, b) => b.progress - a.progress);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: sortedSkills.map(skill => skill.skill?.name || `Skill ${skill.skillId}`),
        datasets: [{
          label: 'Progress',
          data: sortedSkills.map(skill => skill.progress),
          backgroundColor: sortedSkills.map(skill => skill.skill?.color || '#4361ee'),
          borderWidth: 0,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Progress (%)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    progressChartInstance.current = new Chart(progressChartRef.current, config);

    // Clean up on unmount
    return () => {
      if (progressChartInstance.current) {
        progressChartInstance.current.destroy();
      }
    };
  }, [userSkills]);

  // Initialize activity chart
  useEffect(() => {
    if (!activityChartRef.current || !activities || activities.length === 0) return;

    if (activityChartInstance.current) {
      activityChartInstance.current.destroy();
    }

    // Get the last 30 days
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Count activities per day
    const activitiesByDay: Record<string, number> = {};
    last30Days.forEach(day => {
      activitiesByDay[day] = 0;
    });

    activities.forEach(activity => {
      const date = new Date(activity.createdAt).toISOString().split('T')[0];
      if (activitiesByDay[date] !== undefined) {
        activitiesByDay[date]++;
      }
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: last30Days.map(day => {
          const date = new Date(day);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
          label: 'Activities',
          data: Object.values(activitiesByDay),
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Activities'
            },
            ticks: {
              stepSize: 1
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    activityChartInstance.current = new Chart(activityChartRef.current, config);

    // Clean up on unmount
    return () => {
      if (activityChartInstance.current) {
        activityChartInstance.current.destroy();
      }
    };
  }, [activities]);

  // Initialize time spent chart
  useEffect(() => {
    if (!timeSpentChartRef.current || !weeklyActivity || weeklyActivity.length === 0) return;

    if (timeSpentChartInstance.current) {
      timeSpentChartInstance.current.destroy();
    }

    // Sort days in order
    const dayOrder = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7 };
    const sortedActivity = [...weeklyActivity].sort((a, b) => 
      dayOrder[a.dayOfWeek as keyof typeof dayOrder] - dayOrder[b.dayOfWeek as keyof typeof dayOrder]
    );

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: sortedActivity.map(day => day.dayOfWeek),
        datasets: [{
          label: 'Minutes',
          data: sortedActivity.map(day => day.minutesSpent),
          backgroundColor: '#06d6a0',
          borderRadius: 4,
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Minutes'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    timeSpentChartInstance.current = new Chart(timeSpentChartRef.current, config);

    // Clean up on unmount
    return () => {
      if (timeSpentChartInstance.current) {
        timeSpentChartInstance.current.destroy();
      }
    };
  }, [weeklyActivity]);

  // Initialize accuracy chart
  useEffect(() => {
    if (!accuracyChartRef.current || !activities || activities.length === 0) return;

    if (accuracyChartInstance.current) {
      accuracyChartInstance.current.destroy();
    }

    // Group activities by skill type and calculate average score
    interface SkillScore {
      skillId: number;
      skillName: string;
      totalScore: number;
      count: number;
      color: string;
    }

    const skillScores: Record<number, SkillScore> = {};
    
    activities.forEach(activity => {
      if (activity.skillId && activity.score !== undefined && activity.score !== null) {
        if (!skillScores[activity.skillId]) {
          const skillName = activity.skill?.name || `Skill ${activity.skillId}`;
          const skillColor = activity.skill?.color || '#4361ee';
          
          skillScores[activity.skillId] = {
            skillId: activity.skillId,
            skillName,
            totalScore: 0,
            count: 0,
            color: skillColor
          };
        }
        
        skillScores[activity.skillId].totalScore += activity.score;
        skillScores[activity.skillId].count++;
      }
    });

    const skillAverages = Object.values(skillScores)
      .map(skill => ({
        skillName: skill.skillName,
        averageScore: Math.round(skill.totalScore / skill.count),
        color: skill.color
      }))
      .filter(skill => !isNaN(skill.averageScore));

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: skillAverages.map(skill => skill.skillName),
        datasets: [{
          data: skillAverages.map(skill => skill.averageScore),
          backgroundColor: skillAverages.map(skill => skill.color),
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 15,
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed}% accuracy`;
              }
            }
          }
        }
      }
    };

    accuracyChartInstance.current = new Chart(accuracyChartRef.current, config);

    // Clean up on unmount
    return () => {
      if (accuracyChartInstance.current) {
        accuracyChartInstance.current.destroy();
      }
    };
  }, [activities]);

  // Handle time period change
  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value);
    // In a real application, we would update the queries with a date filter
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading mb-2">Analytics</h2>
          <p className="text-gray-600">
            Track your progress and see how your thinking skills are improving over time.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary bg-opacity-10 text-primary mr-4">
                <i className="ri-brain-line text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Exercises</p>
                <h4 className="text-2xl font-bold">{stats.totalExercises}</h4>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <i className="ri-percent-line text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <h4 className="text-2xl font-bold">{stats.averageScore}%</h4>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <i className="ri-time-line text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Time Spent</p>
                <h4 className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</h4>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <i className="ri-calendar-check-line text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <h4 className="text-2xl font-bold">{stats.exercisesThisWeek} exercises</h4>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Skill Progress Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-heading mb-4">Skill Progress</h3>
            <div className="h-80">
              {isLoadingSkills ? (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <canvas ref={progressChartRef} />
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Activity Trend Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-heading mb-4">Activity Trend</h3>
            <div className="h-80">
              {isLoadingActivities ? (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <canvas ref={activityChartRef} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Time Distribution */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-heading mb-4">Weekly Time Distribution</h3>
            <div className="h-80">
              {isLoadingWeekly ? (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <canvas ref={timeSpentChartRef} />
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Accuracy by Skill Type */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-heading mb-4">Accuracy by Skill Type</h3>
            <div className="h-80">
              {isLoadingActivities ? (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <canvas ref={accuracyChartRef} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
