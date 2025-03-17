import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development"
});

export type ProblemType = 'Real-life' | 'Coding' | 'Math' | 'Business' | 'Design';
export type ThinkingType = 'Critical' | 'Creative' | 'Strategic' | 'Analytical';

/**
 * Generate a thinking process for a given problem
 */
export async function generateThinkingProcess(
  problemType: string, 
  description: string
): Promise<{ steps: Array<{ title: string, content: string }> }> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a thinking skills coach specialized in helping people improve their problem-solving abilities. 
          Your task is to break down the thinking process for solving a problem into clear, logical steps.
          The problem is of type: ${problemType}.
          Format your response as a JSON object with an array of steps, each containing a title and detailed content.
          Make your explanation educational and focused on improving thinking skills.`,
        },
        {
          role: "user",
          content: description,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    return JSON.parse(content) as { 
      steps: Array<{ title: string, content: string }> 
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
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
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a thinking skills evaluator. You'll be given a problem, a user's thinking process, and their expected outcome.
          Evaluate the thinking process and provide a score (0-100), feedback, strengths, weaknesses, and suggestions for improvement.
          The problem is of type: ${problemType}.
          Format your response as a JSON object with the following fields: score, feedback, strengths, weaknesses, improvements.`,
        },
        {
          role: "user",
          content: `Problem: ${description}\n\nUser's thinking process: ${thinkingProcess}\n\nExpected outcome: ${expectedOutcome}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
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
    console.error("OpenAI API error:", error);
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
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an educational expert in cognitive development. Create an exercise for improving ${thinkingType} thinking skills.
          Format your response as a JSON object with these fields: title, description, difficulty (Beginner/Intermediate/Advanced), 
          duration (in minutes), instructions (detailed steps), and evaluation (how to measure success).
          Make the exercise engaging, practical, and educational.`,
        },
        {
          role: "user",
          content: `Create a ${thinkingType} thinking exercise that can be completed in under 30 minutes.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
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
    console.error("OpenAI API error:", error);
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
  problem: string,
  solution: string
): Promise<{
  process: Array<{ step: string, reasoning: string }>,
  principles: string[],
  insights: string[]
}> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a cognitive analysis expert. Given a problem and its solution, reverse-engineer the thinking process that would lead to that solution.
          Break down the process into clear steps, each with reasoning. Also identify key principles and insights from this thinking pattern.
          Format your response as a JSON object with these fields: process (array of step and reasoning objects), principles, insights.`,
        },
        {
          role: "user",
          content: `Problem: ${problem}\n\nSolution: ${solution}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    return JSON.parse(content) as {
      process: Array<{ step: string, reasoning: string }>,
      principles: string[],
      insights: string[]
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      process: [{ step: "Error in analysis", reasoning: "We couldn't analyze this solution at this time. Please try again later." }],
      principles: ["Error occurred during analysis"],
      insights: ["Please try again with a clearer problem and solution description"]
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
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a logical reasoning expert. Evaluate whether the given thinking process logically leads to the claimed conclusion.
          Identify any logical gaps or errors in the process, and suggest alternative conclusions that could be reached from the same process.
          Format your response as a JSON object with these fields: isValid (boolean), confidence (0-1), gaps (array of strings), alternatives (array of strings).`,
        },
        {
          role: "user",
          content: `Problem: ${problem}\n\nThinking process: ${thinkingProcess}\n\nClaimed conclusion: ${conclusion}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
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
    console.error("OpenAI API error:", error);
    return {
      isValid: false,
      confidence: 0,
      gaps: ["Error in verification process"],
      alternatives: ["We couldn't verify this thinking process at this time. Please try again later."]
    };
  }
}
