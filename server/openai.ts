import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// OpenRouter API configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";
const MODEL = "google/gemini-2.0-pro-exp-02-05:free";

// Log a masked version of the API key for debugging
console.log(`Using OpenRouter API key: ${OPENROUTER_API_KEY.substring(0, 7)}...${OPENROUTER_API_KEY.substring(OPENROUTER_API_KEY.length - 7)}`);
console.log(`Using model: ${MODEL}`);

export type ProblemType = 'Real-life' | 'Coding' | 'Math' | 'Business' | 'Design';
export type ThinkingType = 'Critical' | 'Creative' | 'Strategic' | 'Analytical';

// Direct API call function using OpenRouter's chat completions API
async function generateContent(prompt: string): Promise<any> {
  try {
    console.log(`Calling OpenRouter API with model: ${MODEL}`);
    
    const requestBody = {
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ]
    };
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://thinklikegenius.app', // Replace with your actual domain
        'X-Title': 'Think Like Genius' // Name of your app
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("API Response:", JSON.stringify(data).substring(0, 300) + "...");
    return data;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

// Test the API connection when the module loads
async function testApiConnection() {
  try {
    const result = await generateContent("Hello, are you working? Please respond with a simple yes or no.");
    console.log("API connection test successful");
    return true;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
}

// Test the connection
testApiConnection();

// Helper function to extract response text from OpenRouter API response
function extractResponseText(data: any): string {
  try {
    return data?.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Error extracting response text:", error);
    return "";
  }
}

// Helper function to clean markdown code blocks from the response
function cleanJsonFromMarkdown(text: string): string {
  console.log("Original response:", text.substring(0, 50) + "...");
  
  // Check if the content contains markdown code blocks
  if (text.includes("```json") || text.includes("```")) {
    console.log("Detected markdown code block, cleaning response");
    
    // Extract content from inside the code block
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      const cleaned = jsonMatch[1].trim();
      console.log("Cleaned JSON:", cleaned.substring(0, 50) + "...");
      return cleaned;
    }
    
    // If we can't extract from code block, try to remove the backticks
    const cleaned = text.replace(/```json|```/g, "").trim();
    console.log("Cleaned by removing backticks:", cleaned.substring(0, 50) + "...");
    return cleaned;
  }
  
  return text;
}

/**
 * Generate a thinking process for a given problem
 */
export async function generateThinkingProcess(
  problemType: string, 
  description: string
): Promise<{ steps: Array<{ title: string, content: string }> }> {
  try {
    const prompt = `You are a thinking skills coach specialized in helping people improve their problem-solving abilities. 
    Your task is to break down the thinking process for solving a problem into clear, logical steps.
    The problem is of type: ${problemType}.
    Format your response as a JSON object with an array of steps, each containing a title and detailed content.
    Make your explanation educational and focused on improving thinking skills.
    Problem: ${description}`;
    
    const result = await generateContent(prompt);
    const content = cleanJsonFromMarkdown(extractResponseText(result));
    
    if (!content) {
      throw new Error("No content in response");
    }

    // Try to parse as JSON, if not, wrap in proper JSON format
    try {
      return JSON.parse(content) as { 
        steps: Array<{ title: string, content: string }> 
      };
    } catch (parseError) {
      console.error("Failed to parse API response as JSON:", parseError);
      
      // Extract steps from text content if possible
      const steps = extractStepsFromText(content);
      return { steps };
    }
  } catch (error) {
    console.error("API error:", error);
    // Fallback response in case the API call fails
    return {
      steps: [
        {
          title: "Error Generating Thinking Process",
          content: "We encountered an error when trying to generate a thinking process for your problem. Please try again later or with a different problem description."
        }
      ]
    };
  }
}

// Helper function to extract steps from non-JSON text
function extractStepsFromText(text: string): Array<{ title: string, content: string }> {
  // Simple extraction algorithm - look for numbered points or headings
  const steps: Array<{ title: string, content: string }> = [];
  
  // Split by lines, then look for patterns like "1. Step Title" or "Step 1: Title"
  const lines = text.split('\n');
  let currentStep: { title: string, content: string } | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for step pattern (e.g., "1.", "Step 1:", etc.)
    const stepMatch = line.match(/^(\d+\.|\#|\*|Step \d+:?)\s*(.+)$/i);
    
    if (stepMatch) {
      // If we found a new step and already have a current step, save it
      if (currentStep) {
        steps.push(currentStep);
      }
      
      // Create a new step
      currentStep = {
        title: stepMatch[2].trim(),
        content: ""
      };
    } else if (currentStep) {
      // Add content to current step
      if (currentStep.content) {
        currentStep.content += "\n" + line;
      } else {
        currentStep.content = line;
      }
    }
  }
  
  // Add the last step if it exists
  if (currentStep) {
    steps.push(currentStep);
  }
  
  // If no steps found, return the whole text as one step
  if (steps.length === 0) {
    return [{
      title: "Thinking Process",
      content: text
    }];
  }
  
  return steps;
}

/**
 * Evaluate a user's thinking process and provide feedback
 */
export async function evaluateThinkingProcess(
  problemType: string,
  description: string,
  thinkingProcess: string,
  expectedOutcome: string
): Promise<{
  score: number,
  feedback: string,
  strengths: string[],
  weaknesses: string[],
  improvements: string[]
}> {
  try {
    const prompt = `You are a thinking skills evaluator. You'll be given a problem, a user's thinking process, and their expected outcome.
    Evaluate the thinking process and provide a score (0-100), feedback, strengths, weaknesses, and suggestions for improvement.
    The problem is of type: ${problemType}.
    Format your response as a JSON object with the following fields: score, feedback, strengths, weaknesses, improvements.
    Problem: ${description}\n\nUser's thinking process: ${thinkingProcess}\n\nExpected outcome: ${expectedOutcome}`;
    
    const result = await generateContent(prompt);
    const content = cleanJsonFromMarkdown(extractResponseText(result));
    
    if (!content) {
      throw new Error("No content in response");
    }

    return JSON.parse(content) as {
      score: number,
      feedback: string,
      strengths: string[],
      weaknesses: string[],
      improvements: string[]
    };
  } catch (error) {
    console.error("API error:", error);
    return {
      score: 0,
      feedback: "We couldn't evaluate your thinking process at this time. Please try again later.",
      strengths: [],
      weaknesses: ["Error in evaluation process"],
      improvements: ["Please try again with a clearer description"]
    };
  }
}

/**
 * Generate an exercise for a specific thinking type
 */
export async function generateExercise(thinkingType: ThinkingType): Promise<{
  title: string,
  description: string,
  difficulty: string,
  duration: number,
  instructions: string,
  evaluation: string
}> {
  try {
    const prompt = `You are an educational expert in cognitive development. Create an exercise for improving ${thinkingType} thinking skills.
    Format your response as a JSON object with these fields: title, description, difficulty (Beginner/Intermediate/Advanced), 
    duration (in minutes), instructions (detailed steps), and evaluation (how to measure success).
    Make the exercise engaging, practical, and educational.
    Create a ${thinkingType} thinking exercise that can be completed in under 30 minutes.`;
    
    const result = await generateContent(prompt);
    const content = cleanJsonFromMarkdown(extractResponseText(result));
    
    if (!content) {
      throw new Error("No content in response");
    }

    return JSON.parse(content) as {
      title: string,
      description: string,
      difficulty: string,
      duration: number,
      instructions: string,
      evaluation: string
    };
  } catch (error) {
    console.error("API error:", error);
    return {
      title: `${thinkingType} Exercise`,
      description: "This is a practice exercise to improve your thinking skills.",
      difficulty: "Intermediate",
      duration: 20,
      instructions: "We couldn't generate custom instructions at this time. Please try again later.",
      evaluation: "Evaluate your performance based on how well you completed the exercise."
    };
  }
}

/**
 * Reverse engineer a thinking process from a solution
 */
export async function reverseEngineerThinking(
  problemType: string,
  problem: string,
  solution?: string
): Promise<{
  process: Array<{ step: string, reasoning: string }>,
  principles: string[],
  insights: string[]
}> {
  try {
    const prompt = `You are a cognitive analysis expert. Given a problem type, description, and optionally its solution, reverse-engineer the thinking process that would lead to that solution.
    If no solution is provided, generate a structured thinking process to solve the problem.
    Break down the process into clear steps, each with reasoning. Also identify key principles and insights from this thinking pattern.
    Format your response as a JSON object with these fields: process (array of step and reasoning objects), principles, insights.
    Problem Type: ${problemType}
    Problem: ${problem}
    ${solution ? `Solution: ${solution}` : "No solution provided - generate a thinking process to solve this problem."}`;
    
    const result = await generateContent(prompt);
    const content = cleanJsonFromMarkdown(extractResponseText(result));
    
    if (!content) {
      throw new Error("No content in response");
    }

    return JSON.parse(content) as {
      process: Array<{ step: string, reasoning: string }>,
      principles: string[],
      insights: string[]
    };
  } catch (error) {
    console.error("API error:", error);
    return {
      process: [{ step: "Error in analysis", reasoning: "We couldn't analyze this problem at this time. Please try again later." }],
      principles: ["Error occurred during analysis"],
      insights: ["Please try again with a clearer problem description"]
    };
  }
}

/**
 * Verify if a thinking process logically leads to a conclusion
 */
export async function verifyThinkingProcess(
  problem: string,
  thinkingProcess: string,
  conclusion: string
): Promise<{
  isValid: boolean,
  confidence: number,
  gaps: string[],
  alternatives: string[]
}> {
  try {
    const prompt = `You are a logical reasoning expert. Assess whether a given thinking process logically leads to the stated conclusion.
    Identify any gaps or weak links in the reasoning. Also suggest alternative conclusions or approaches.
    Format your response as a JSON object with these fields: isValid (boolean), confidence (number 0-100), gaps (array of strings), alternatives (array of strings).
    Problem: ${problem}\n\nThinking process: ${thinkingProcess}\n\nConclusion: ${conclusion}`;
    
    const result = await generateContent(prompt);
    const content = cleanJsonFromMarkdown(extractResponseText(result));
    
    if (!content) {
      throw new Error("No content in response");
    }

    return JSON.parse(content) as {
      isValid: boolean,
      confidence: number,
      gaps: string[],
      alternatives: string[]
    };
  } catch (error) {
    console.error("API error:", error);
    return {
      isValid: false,
      confidence: 0,
      gaps: ["Error in verification process"],
      alternatives: ["Please try again with a clearer description"]
    };
  }
}
