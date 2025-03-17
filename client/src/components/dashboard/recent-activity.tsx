import { Card, CardContent } from "@/components/ui/card";
import { UserActivity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  activities: UserActivity[];
  isLoading: boolean;
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  // Format timestamp to relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  // Get icon and background color based on activity type and skill
  const getActivityStyle = (activity: UserActivity) => {
    if (!activity.skill) {
      return {
        icon: "ri-star-line",
        bgColor: "bg-primary bg-opacity-10",
        textColor: "text-primary"
      };
    }
    
    const iconMap: Record<string, string> = {
      "Critical Thinking": "ri-brain-line",
      "Creative Thinking": "ri-lightbulb-line",
      "Strategic Thinking": "ri-question-answer-line",
      "Analytical Thinking": "ri-bar-chart-line"
    };
    
    return {
      icon: iconMap[activity.skill.name] || "ri-brain-line",
      bgColor: `bg-opacity-10`,
      textColor: ""
    };
  };

  const renderActivityItem = (activity: UserActivity, index: number) => {
    const style = getActivityStyle(activity);
    
    return (
      <div key={activity.id || index} className="flex items-start p-3 rounded-lg hover:bg-gray-50">
        <div 
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3", 
            style.bgColor
          )}
          style={activity.skill ? { backgroundColor: `${activity.skill.color}10`, color: activity.skill.color } : {}}
        >
          <i className={style.icon}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{activity.title}</p>
          <p className="text-xs text-gray-500">{activity.description}</p>
        </div>
        <div className="text-xs text-gray-400">{getRelativeTime(activity.createdAt)}</div>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold font-heading">Recent Activities</h3>
          <a href="#" className="text-primary text-sm">View All</a>
        </div>
        
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>No recent activities found.</p>
            <p className="text-sm mt-1">Complete exercises to see your activity here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map(renderActivityItem)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
