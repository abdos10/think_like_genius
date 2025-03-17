import { UserSkill } from "@/lib/types";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { cn } from "@/lib/utils";

interface SkillCardProps {
  userSkill: UserSkill;
}

export function SkillCard({ userSkill }: SkillCardProps) {
  const { skill, progress, level } = userSkill;
  
  if (!skill) return null;
  
  // Apply color styles based on skill type
  const getBgColor = (color: string) => {
    return { backgroundColor: `${color}10` };
  };
  
  const getTextColor = (color: string) => {
    return { color: color };
  };
  
  const getBorderStyle = (color: string) => {
    return { borderColor: color };
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm overflow-hidden border-t-4" 
      style={getBorderStyle(skill.color)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-bold font-heading text-gray-800">{skill.name}</h4>
            <p className="text-sm text-gray-500">{level} Level</p>
          </div>
          <div className="relative h-12 w-12">
            <ProgressCircle 
              progress={progress} 
              circleClassName={cn("text-gray-300", getTextColor(skill.color).color)} 
            />
          </div>
        </div>
        <div className="mt-3">
          <a 
            href="#" 
            className="px-4 py-2 rounded-lg text-sm font-medium inline-block"
            style={{ ...getBgColor(skill.color), ...getTextColor(skill.color) }}
          >
            Continue Training
          </a>
        </div>
      </div>
    </div>
  );
}
