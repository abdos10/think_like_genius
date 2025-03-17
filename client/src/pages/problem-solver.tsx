import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ProblemForm } from "@/components/problem-solver/problem-form";
import { UserProblem, User } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ProblemSolver() {
  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/users/current"],
  });

  // Get user problems
  const { data: problems, isLoading } = useQuery<UserProblem[]>({
    queryKey: ["/api/problems"],
    enabled: !!currentUser,
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading mb-2">Problem Solver</h2>
        <p className="text-gray-600">
          Get step-by-step thinking processes for any problem you're facing.
        </p>
      </div>
      
      <Tabs defaultValue="solver">
        <TabsList className="mb-6">
          <TabsTrigger value="solver">Problem Solver</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="solver">
          {currentUser && <ProblemForm userId={currentUser.id} />}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Your Problem History</h3>
              
              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : problems && problems.length > 0 ? (
                <div className="space-y-4">
                  {problems.map(problem => (
                    <Card key={problem.id} className="overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary mb-2">
                              {problem.problemType}
                            </span>
                            <h4 className="font-medium text-lg mb-1">
                              {problem.description.length > 75 
                                ? problem.description.substring(0, 75) + '...' 
                                : problem.description}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Created on {formatDate(problem.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {problem.thinkingProcess && (
                        <div className="p-4">
                          <h5 className="font-medium mb-3">Thinking Process</h5>
                          <Accordion type="single" collapsible className="w-full">
                            {problem.thinkingProcess.steps.map((step, index) => (
                              <AccordionItem key={index} value={`step-${index}`}>
                                <AccordionTrigger className="hover:no-underline">
                                  <span className="font-medium">
                                    {index + 1}. {step.title}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-700">
                                  {step.content}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>You haven't submitted any problems yet.</p>
                  <p className="text-sm mt-1">Use the Problem Solver to get thinking processes for your problems.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
