import { Card, CardContent } from "@/components/ui/card";
import { Exercise } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecommendedExerciseProps {
  exercises: Exercise[];
  skills: Record<number, { name: string, color: string }>;
  isLoading: boolean;
  onStartExercise?: (exerciseId: number) => void;
}

export function RecommendedExercise({ 
  exercises, 
  skills,
  isLoading,
  onStartExercise 
}: RecommendedExerciseProps) {

  const handleStartClick = (exerciseId: number) => {
    if (onStartExercise) {
      onStartExercise(exerciseId);
    }
  };

  const renderExerciseItem = (exercise: Exercise) => {
    const skill = skills[exercise.skillId];
    
    return (
      <div key={exercise.id} className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${skill?.color}10`,
                color: skill?.color
              }}
            >
              {skill?.name || 'Thinking Skill'}
            </span>
            <span className="text-xs text-gray-500">{exercise.duration} min</span>
          </div>
          <h4 className="font-medium mb-1">{exercise.title}</h4>
          <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
          <button 
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            onClick={() => handleStartClick(exercise.id)}
          >
            Start Exercise
          </button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold font-heading">Recommended For You</h3>
          <a href="#" className="text-primary text-sm">View All</a>
        </div>
        
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : exercises.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>No recommended exercises found.</p>
            <p className="text-sm mt-1">Complete your profile to get personalized recommendations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.slice(0, 2).map(renderExerciseItem)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
