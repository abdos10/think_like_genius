import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ThinkingProcess() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("evaluate");

  // Evaluate thinking section
  const [evaluateForm, setEvaluateForm] = useState({
    problemType: "Business Problem",
    description: "",
    thinkingProcess: "",
    expectedOutcome: ""
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Reverse engineering section
  const [reverseForm, setReverseForm] = useState({
    problem: "",
    solution: ""
  });
  const [isReversing, setIsReversing] = useState(false);
  const [reverseResult, setReverseResult] = useState<any>(null);

  // Verification section
  const [verifyForm, setVerifyForm] = useState({
    problem: "",
    thinkingProcess: "",
    conclusion: ""
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // Handle evaluate form changes
  const handleEvaluateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEvaluateForm({
      ...evaluateForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle reverse form changes
  const handleReverseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReverseForm({
      ...reverseForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle verify form changes
  const handleVerifyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVerifyForm({
      ...verifyForm,
      [e.target.name]: e.target.value
    });
  };

  // Submit evaluation form
  const handleEvaluateSubmit = async () => {
    if (!evaluateForm.description || !evaluateForm.thinkingProcess || !evaluateForm.expectedOutcome) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to evaluate your thinking process.",
        variant: "destructive"
      });
      return;
    }

    setIsEvaluating(true);
    try {
      const response = await apiRequest("POST", "/api/evaluate-thinking", evaluateForm);
      const result = await response.json();
      setEvaluationResult(result);
      toast({
        title: "Evaluation Complete",
        description: `Your thinking process scored ${result.score}/100.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate thinking process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Submit reverse engineering form
  const handleReverseSubmit = async () => {
    if (!reverseForm.problem || !reverseForm.solution) {
      toast({
        title: "Missing Information",
        description: "Please provide both a problem and solution to reverse-engineer the thinking process.",
        variant: "destructive"
      });
      return;
    }

    setIsReversing(true);
    try {
      const response = await apiRequest("POST", "/api/reverse-engineer", reverseForm);
      const result = await response.json();
      setReverseResult(result);
      toast({
        title: "Analysis Complete",
        description: "The thinking process has been reverse-engineered."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reverse-engineer thinking process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsReversing(false);
    }
  };

  // Submit verification form
  const handleVerifySubmit = async () => {
    if (!verifyForm.problem || !verifyForm.thinkingProcess || !verifyForm.conclusion) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to verify your thinking process.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await apiRequest("POST", "/api/verify-thinking", verifyForm);
      const result = await response.json();
      setVerifyResult(result);
      toast({
        title: "Verification Complete",
        description: result.isValid 
          ? "Your thinking process is valid." 
          : "Your thinking process has some logical gaps."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify thinking process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading mb-2">Thinking Process</h2>
        <p className="text-gray-600">
          Evaluate, reverse-engineer, and verify thinking processes to build your skills.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
          <TabsTrigger value="reverse">Reverse Engineer</TabsTrigger>
          <TabsTrigger value="verify">Verify</TabsTrigger>
        </TabsList>
        
        {/* Evaluate Thinking Tab */}
        <TabsContent value="evaluate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Evaluate Thinking Process</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem Type</label>
                    <select 
                      name="problemType"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      value={evaluateForm.problemType}
                      onChange={handleEvaluateChange}
                    >
                      <option>Business Problem</option>
                      <option>Real-life Scenario</option>
                      <option>Coding Challenge</option>
                      <option>Mathematical Problem</option>
                      <option>Design Challenge</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
                    <Textarea 
                      name="description"
                      placeholder="Describe the problem..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      rows={3}
                      value={evaluateForm.description}
                      onChange={handleEvaluateChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Thinking Process</label>
                    <Textarea 
                      name="thinkingProcess"
                      placeholder="Explain your step-by-step thinking process..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      rows={5}
                      value={evaluateForm.thinkingProcess}
                      onChange={handleEvaluateChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Outcome</label>
                    <Textarea 
                      name="expectedOutcome"
                      placeholder="What conclusion or result did you reach?"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      rows={2}
                      value={evaluateForm.expectedOutcome}
                      onChange={handleEvaluateChange}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleEvaluateSubmit}
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                        Evaluating...
                      </>
                    ) : (
                      "Evaluate My Thinking"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Results */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Evaluation Results</h3>
                
                {evaluationResult ? (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Score</span>
                        <span className="text-xl font-bold" style={{color: evaluationResult.score > 70 ? '#4361ee' : (evaluationResult.score > 40 ? '#ffd166' : '#ef476f')}}>
                          {evaluationResult.score}/100
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{
                            width: `${evaluationResult.score}%`,
                            backgroundColor: evaluationResult.score > 70 ? '#4361ee' : (evaluationResult.score > 40 ? '#ffd166' : '#ef476f')
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Feedback</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{evaluationResult.feedback}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                        <ul className="space-y-1 text-sm">
                          {evaluationResult.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block mr-2 mt-0.5 text-green-600">✓</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-red-500">Weaknesses</h4>
                        <ul className="space-y-1 text-sm">
                          {evaluationResult.weaknesses.map((weakness: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block mr-2 mt-0.5 text-red-500">✗</span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-primary">Improvement Suggestions</h4>
                      <ul className="space-y-1 text-sm">
                        {evaluationResult.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block mr-2 mt-0.5 text-primary">→</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <i className="ri-file-list-3-line text-5xl mb-3 block"></i>
                    <p>Submit your thinking process to see an evaluation here.</p>
                    <p className="text-sm mt-1">You'll receive a detailed breakdown of strengths and areas for improvement.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Reverse Engineering Tab */}
        <TabsContent value="reverse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Reverse Engineer Thinking</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem</label>
                    <Textarea 
                      name="problem"
                      placeholder="Describe the initial problem..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      rows={3}
                      value={reverseForm.problem}
                      onChange={handleReverseChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
                    <Textarea 
                      name="solution"
                      placeholder="Describe the final solution or outcome..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      rows={5}
                      value={reverseForm.solution}
                      onChange={handleReverseChange}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleReverseSubmit}
                    disabled={isReversing}
                  >
                    {isReversing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                        Analyzing...
                      </>
                    ) : (
                      "Reverse Engineer Thinking"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Results */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Reverse Engineering Results</h3>
                
                {reverseResult ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3 text-primary">Thinking Process</h4>
                      <div className="space-y-3">
                        {reverseResult.process.map((step: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="font-medium mb-1">Step {index + 1}: {step.step}</div>
                            <div className="text-sm text-gray-700">{step.reasoning}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-primary">Key Principles</h4>
                      <ul className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg">
                        {reverseResult.principles.map((principle: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block mr-2 mt-0.5 text-primary">•</span>
                            {principle}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-primary">Insights</h4>
                      <ul className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg">
                        {reverseResult.insights.map((insight: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block mr-2 mt-0.5 text-primary">💡</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <i className="ri-arrow-left-right-line text-5xl mb-3 block"></i>
                    <p>Submit a problem and solution to reverse-engineer the thinking process.</p>
                    <p className="text-sm mt-1">Learn how to get from problem to solution systematically.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Verification Tab */}
        <TabsContent value="verify">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Verify Thinking Process</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
                    <Textarea 
                      name="problem"
                      placeholder="State the problem clearly..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      rows={2}
                      value={verifyForm.problem}
                      onChange={handleVerifyChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thinking Process</label>
                    <Textarea 
                      name="thinkingProcess"
                      placeholder="Describe your thinking process steps..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      rows={5}
                      value={verifyForm.thinkingProcess}
                      onChange={handleVerifyChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conclusion</label>
                    <Textarea 
                      name="conclusion"
                      placeholder="What conclusion did you reach?"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      rows={2}
                      value={verifyForm.conclusion}
                      onChange={handleVerifyChange}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleVerifySubmit}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                        Verifying...
                      </>
                    ) : (
                      "Verify Thinking Process"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Results */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Verification Results</h3>
                
                {verifyResult ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Logical Validity</span>
                        <span 
                          className={`py-1 px-3 rounded-full text-sm font-medium ${
                            verifyResult.isValid 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {verifyResult.isValid ? "Valid" : "Has Gaps"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Confidence Score:</span>
                        <span className="font-bold">{Math.round(verifyResult.confidence * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{
                            width: `${verifyResult.confidence * 100}%`,
                            backgroundColor: verifyResult.isValid ? '#10b981' : '#ef476f'
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-red-500">
                        Logical Gaps {verifyResult.gaps.length === 0 && "(None Found)"}
                      </h4>
                      {verifyResult.gaps.length > 0 && (
                        <ul className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg">
                          {verifyResult.gaps.map((gap: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block mr-2 mt-0.5 text-red-500">⚠</span>
                              {gap}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-primary">Alternative Conclusions</h4>
                      <ul className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                        {verifyResult.alternatives.map((alternative: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block mr-2 mt-0.5 text-primary">→</span>
                            {alternative}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <i className="ri-checkbox-circle-line text-5xl mb-3 block"></i>
                    <p>Submit your thinking process and conclusion to verify logical consistency.</p>
                    <p className="text-sm mt-1">Find out if your reasoning leads to your stated conclusion.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
