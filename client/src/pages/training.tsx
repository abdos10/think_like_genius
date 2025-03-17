import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillCard } from "@/components/dashboard/skill-card";
import { UserSkill, ThinkingSkill, Exercise } from "@/lib/types";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Training() {
  const { toast } = useToast();
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get user skills
  const { data: userSkills, isLoading: isLoadingSkills } = useQuery<(UserSkill & { skill: ThinkingSkill })[]>({
    queryKey: ["/api/user-skills"],
  });

  // Get exercises
  const { data: exercises, isLoading: isLoadingExercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises", { skillId: selectedSkill }],
    enabled: selectedSkill !== null,
  });

  const handleSkillSelect = (skillId: number) => {
    setSelectedSkill(skillId);
  };

  const handleGenerateExercise = async () => {
    if (!selectedSkill) return;
    
    const skill = userSkills?.find(us => us.skillId === selectedSkill)?.skill;
    if (!skill) return;
    
    setIsGenerating(true);
    
    try {
      const response = await apiRequest("POST", "/api/generate-exercise", {
        thinkingType: skill.name.split(' ')[0]
      });
      
      const exercise = await response.json();
      
      toast({
        title: "Exercise Generated",
        description: `"${exercise.title}" has been created for you.`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate exercise. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSkillColor = (skillId: number): string => {
    const skill = userSkills?.find(us => us.skillId === skillId)?.skill;
    return skill?.color || "#4361ee";
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading mb-2">Training</h2>
        <p className="text-gray-600">
          Select a thinking skill to practice and improve your abilities.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Skills sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-4">Thinking Skills</h3>
              
              {isLoadingSkills ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {userSkills?.map(userSkill => (
                    <button
                      key={userSkill.id}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedSkill === userSkill.skillId
                          ? "bg-primary bg-opacity-10 text-primary"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleSkillSelect(userSkill.skillId)}
                      style={selectedSkill === userSkill.skillId ? { 
                        backgroundColor: `${userSkill.skill.color}10`,
                        color: userSkill.skill.color
                      } : {}}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: userSkill.skill.color }}
                        ></div>
                        <span>{userSkill.skill.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  className="w-full"
                  disabled={!selectedSkill || isGenerating}
                  onClick={handleGenerateExercise}
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    "Generate New Exercise"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Exercises content */}
        <div className="lg:col-span-3">
          {selectedSkill ? (
            <>
              <h3 className="text-xl font-bold mb-4" style={{ color: getSkillColor(selectedSkill) }}>
                {userSkills?.find(us => us.skillId === selectedSkill)?.skill.name} Exercises
              </h3>
              
              {isLoadingExercises ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : exercises && exercises.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {exercises.map(exercise => (
                    <Card key={exercise.id}>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${getSkillColor(exercise.skillId)}10`,
                              color: getSkillColor(exercise.skillId)
                            }}
                          >
                            {exercise.difficulty}
                          </span>
                          <span className="text-sm text-gray-500">{exercise.duration} min</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1">{exercise.title}</h4>
                        <p className="text-gray-600 mb-3 text-sm">{exercise.description}</p>
                        <Button className="w-full">Start Exercise</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="py-8">
                      <h4 className="font-medium text-gray-700 mb-2">No exercises available</h4>
                      <p className="text-gray-500 mb-4">
                        Generate a new exercise or select a different skill.
                      </p>
                      <Button onClick={handleGenerateExercise} disabled={isGenerating}>
                        {isGenerating ? "Generating..." : "Generate Exercise"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="py-8">
                  <h4 className="font-medium text-gray-700 mb-2">Select a thinking skill</h4>
                  <p className="text-gray-500">
                    Choose a thinking skill from the left to view available exercises.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
