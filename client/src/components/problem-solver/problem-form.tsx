import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProblemFormProps {
  userId: number;
}

export function ProblemForm({ userId }: ProblemFormProps) {
  const { toast } = useToast();
  const [problemType, setProblemType] = useState("Business Problem");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please describe your problem",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First create the problem
      const response = await apiRequest("POST", "/api/problems", {
        userId,
        problemType,
        description
      });
      
      const problem = await response.json();
      
      // Then generate the thinking process
      await apiRequest("POST", `/api/problems/${problem.id}/thinking-process`, {});
      
      // Invalidate the problems cache
      queryClient.invalidateQueries({ queryKey: ["/api/problems"] });
      
      toast({
        title: "Success",
        description: "Your Idea Journey has been generated",
      });
      
      // Reset form
      setDescription("");
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold font-heading">Problem Solver</h3>
          <a href="#" className="text-primary text-sm flex items-center">
            See History
            <i className="ri-arrow-right-line ml-1"></i>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Problem Type</label>
              <select 
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
              >
                <option>Business Problem</option>
                <option>Real-life Scenario</option>
                <option>Coding Challenge</option>
                <option>Mathematical Problem</option>
                <option>Design Challenge</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe Your Problem</label>
              <textarea 
                placeholder="Describe the problem you need help thinking through..." 
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                className="bg-primary text-white hover:bg-opacity-90" 
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Generating...
                  </>
                ) : (
                  "Generate Idea Journey"
                )}
              </Button>
              <Button variant="outline">
                Upload File
              </Button>
            </div>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="font-medium text-gray-700 mb-3">How It Works</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex">
                <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary w-6 h-6 mr-2">1</span>
                <span>Select the type of problem you're facing</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary w-6 h-6 mr-2">2</span>
                <span>Describe your problem in detail</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary w-6 h-6 mr-2">3</span>
                <span>Get step-by-step Idea Journey</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary w-6 h-6 mr-2">4</span>
                <span>Learn and apply the approach to future problems</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
