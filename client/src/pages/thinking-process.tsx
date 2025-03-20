import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Type for activity history
interface ActivityHistory {
  id: number;
  title: string;
  description: string;
  score: number | null;
  createdAt: string;
}

export default function ThinkingProcess() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("evaluate");
  
  // History states
  const [evaluateHistory, setEvaluateHistory] = useState<ActivityHistory[]>([]);
  const [reverseHistory, setReverseHistory] = useState<ActivityHistory[]>([]);
  const [verifyHistory, setVerifyHistory] = useState<ActivityHistory[]>([]);

  // Evaluate thinking section
  const [evaluateForm, setEvaluateForm] = useState({
    problemType: "Business Problem",
    customProblemType: "",
    description: "",
    thinkingProcess: "",
    expectedOutcome: ""
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Reverse engineering section
  const [reverseForm, setReverseForm] = useState({
    problemType: "Business Problem",
    customProblemType: "",
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

  // Fetch history data when the tab changes
  useEffect(() => {
    fetchHistory(activeTab);
  }, [activeTab]);

  // Function to fetch history based on the active tab
  const fetchHistory = async (tab: string) => {
    let activityType = "";
    
    switch (tab) {
      case "evaluate":
        activityType = "thinking_evaluation";
        break;
      case "reverse":
        activityType = "reverse_engineering";
        break;
      case "verify":
        activityType = "thinking_verification";
        break;
      default:
        return;
    }
    
    try {
      const response = await apiRequest("GET", `/api/thinking-history?type=${activityType}`);
      const data = await response.json();
      
      if (tab === "evaluate") {
        setEvaluateHistory(data);
      } else if (tab === "reverse") {
        setReverseHistory(data);
      } else if (tab === "verify") {
        setVerifyHistory(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Handle evaluate form changes
  const handleEvaluateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEvaluateForm({
      ...evaluateForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle reverse form changes
  const handleReverseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    // If "Other" is selected but no custom type is provided
    if (evaluateForm.problemType === "Other" && !evaluateForm.customProblemType) {
      toast({
        title: "Missing Information",
        description: "Please specify the custom problem type.",
        variant: "destructive"
      });
      return;
    }

    setIsEvaluating(true);
    try {
      // Use the custom problem type if "Other" is selected
      const formData = {
        ...evaluateForm,
        problemType: evaluateForm.problemType === "Other" ? evaluateForm.customProblemType : evaluateForm.problemType
      };
      
      const response = await apiRequest("POST", "/api/evaluate-thinking", formData);
      const result = await response.json();
      setEvaluationResult(result);
      toast({
        title: "Evaluation Complete",
        description: `Your thinking process scored ${result.score}/100.`
      });
      // Refresh history
      fetchHistory("evaluate");
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
    if (!reverseForm.problem) {
      toast({
        title: "Missing Information",
        description: "Please provide a problem description to reverse-engineer the thinking process.",
        variant: "destructive"
      });
      return;
    }
    
    // If "Other" is selected but no custom type is provided
    if (reverseForm.problemType === "Other" && !reverseForm.customProblemType) {
      toast({
        title: "Missing Information",
        description: "Please specify the custom problem type.",
        variant: "destructive"
      });
      return;
    }

    setIsReversing(true);
    try {
      // Use the custom problem type if "Other" is selected
      const formData = {
        ...reverseForm,
        problemType: reverseForm.problemType === "Other" ? reverseForm.customProblemType : reverseForm.problemType
      };
      
      const response = await apiRequest("POST", "/api/reverse-engineer", formData);
      const result = await response.json();
      setReverseResult(result);
      toast({
        title: "Analysis Complete",
        description: "The thinking process has been reverse-engineered."
      });
      // Refresh history
      fetchHistory("reverse");
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
      // Refresh history
      fetchHistory("verify");
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // History item component
  const HistoryItem = ({ item }: { item: ActivityHistory }) => (
    <div className="border rounded-lg p-4 mb-2 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{item.title}</h4>
        <div className="text-xs text-gray-500">{formatDate(item.createdAt)}</div>
      </div>
      
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
      
      {item.score !== null && (
        <div className="mt-2 flex items-center">
          <span className="text-xs font-medium mr-1">Score:</span>
          <span 
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              item.score > 70 ? 'bg-green-100 text-green-800' : 
              (item.score > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')
            }`}
          >
            {item.score}/100
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading mb-2">Thinking Process</h2>
        <p className="text-gray-600">
          Evaluate, reverse-engineer, and verify thinking processes to build your skills.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid grid-cols-3 md:w-[400px] bg-muted rounded-lg p-1">
          <TabsTrigger 
            value="evaluate" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Evaluate
          </TabsTrigger>
          <TabsTrigger 
            value="verify" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Verify
          </TabsTrigger>
          <TabsTrigger 
            value="reverse" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Reverse Engineer
          </TabsTrigger>
        </TabsList>
        
        {/* Evaluate Thinking Tab */}
        <TabsContent value="evaluate">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <Card className="lg:col-span-2">
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
                      aria-label="Problem Type"
                    >
                      <option>Business Problem</option>
                      <option>Real-life Scenario</option>
                      <option>Coding Challenge</option>
                      <option>Mathematical Problem</option>
                      <option>Design Challenge</option>
                      <option>Other</option>
                    </select>
                    
                    {evaluateForm.problemType === "Other" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          name="customProblemType"
                          placeholder="Specify problem type..."
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                          value={evaluateForm.customProblemType}
                          onChange={handleEvaluateChange}
                        />
                      </div>
                    )}
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
            
            {/* History */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Evaluation History</h3>
                
                <div className="space-y-2">
                  {evaluateHistory.length > 0 ? (
                    evaluateHistory.map((item) => (
                      <HistoryItem key={item.id} item={item} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="ri-history-line text-3xl mb-2 block"></i>
                      <p>No evaluation history yet</p>
                      <p className="text-sm mt-1">Complete an evaluation to see it here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Results */}
            {evaluationResult && (
              <Card className="lg:col-span-3">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Evaluation Results</h3>
                  
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
                          {Array.isArray(evaluationResult.strengths) ? (
                            evaluationResult.strengths.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="inline-block mr-2 mt-0.5 text-green-600">✓</span>
                                {strength}
                              </li>
                            ))
                          ) : (
                            <li className="flex items-start">
                              <span className="inline-block mr-2 mt-0.5 text-green-600">✓</span>
                              {typeof evaluationResult.strengths === 'string' ? evaluationResult.strengths : 'No strengths provided'}
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-red-500">Weaknesses</h4>
                        <ul className="space-y-1 text-sm">
                          {Array.isArray(evaluationResult.weaknesses) ? (
                            evaluationResult.weaknesses.map((weakness: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="inline-block mr-2 mt-0.5 text-red-500">✗</span>
                                {weakness}
                              </li>
                            ))
                          ) : (
                            <li className="flex items-start">
                              <span className="inline-block mr-2 mt-0.5 text-red-500">✗</span>
                              {typeof evaluationResult.weaknesses === 'string' ? evaluationResult.weaknesses : 'No weaknesses identified'}
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-primary">Improvement Suggestions</h4>
                      <ul className="space-y-1 text-sm">
                        {Array.isArray(evaluationResult.improvements) ? (
                          evaluationResult.improvements.map((improvement: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block mr-2 mt-0.5 text-primary">→</span>
                              {improvement}
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start">
                            <span className="inline-block mr-2 mt-0.5 text-primary">→</span>
                            {typeof evaluationResult.improvements === 'string' ? evaluationResult.improvements : 'No improvement suggestions provided'}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Verification Tab */}
        <TabsContent value="verify">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <Card className="lg:col-span-2">
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
            
            {/* History */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Verification History</h3>
                
                <div className="space-y-2">
                  {verifyHistory.length > 0 ? (
                    verifyHistory.map((item) => (
                      <HistoryItem key={item.id} item={item} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="ri-history-line text-3xl mb-2 block"></i>
                      <p>No verification history yet</p>
                      <p className="text-sm mt-1">Complete a verification to see it here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Results */}
            {verifyResult && (
              <Card className="lg:col-span-3">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Verification Results</h3>
                  
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
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Reverse Engineering Tab */}
        <TabsContent value="reverse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Reverse Engineer Thinking</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem Type</label>
                    <select 
                      name="problemType"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      value={reverseForm.problemType}
                      onChange={handleReverseChange}
                      aria-label="Problem Type"
                    >
                      <option>Business Problem</option>
                      <option>Real-life Scenario</option>
                      <option>Coding Challenge</option>
                      <option>Mathematical Problem</option>
                      <option>Design Challenge</option>
                      <option>Other</option>
                    </select>
                    
                    {reverseForm.problemType === "Other" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          name="customProblemType"
                          placeholder="Specify problem type..."
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                          value={reverseForm.customProblemType}
                          onChange={handleReverseChange}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
                    <Textarea 
                      name="problem"
                      placeholder="Describe the problem you're facing..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      rows={3}
                      value={reverseForm.problem}
                      onChange={handleReverseChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Solution (Optional)
                    </label>
                    <Textarea 
                      name="solution"
                      placeholder="If you already have a solution, describe it here..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 p-2.5"
                      rows={3}
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
                      "Generate Thinking Process"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* History */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Reverse Engineering History</h3>
                
                <div className="space-y-2">
                  {reverseHistory.length > 0 ? (
                    reverseHistory.map((item) => (
                      <HistoryItem key={item.id} item={item} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="ri-history-line text-3xl mb-2 block"></i>
                      <p>No reverse engineering history yet</p>
                      <p className="text-sm mt-1">Complete a reverse engineering to see it here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Results */}
            {reverseResult && (
              <Card className="lg:col-span-3">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Reverse Engineering Results</h3>
                  
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
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
