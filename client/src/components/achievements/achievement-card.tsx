import { Achievement } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { name, description, icon, unlocked } = achievement;
  
  return (
    <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg">
      <div 
        className={cn(
          "w-16 h-16 mb-3 flex items-center justify-center rounded-full",
          unlocked 
            ? "bg-primary bg-opacity-10 text-primary" 
            : "bg-gray-200 text-gray-400"
        )}
      >
        <i className={cn(icon, "text-3xl")}></i>
      </div>
      <h4 className={cn(
        "font-medium text-center",
        !unlocked && "text-gray-400"
      )}>
        {name}
      </h4>
      <p className="text-xs text-gray-500 text-center">{description}</p>
    </div>
  );
}
