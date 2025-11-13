import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { aiSuggestionSchema, aiResponseSchema } from "@/lib/validations/ai";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI prompt templates for different field types
const getPromptForFieldType = (
  fieldType: "product" | "customer" | "businessModel",
  context?: string
): string => {
  const basePrompt = `You are helping an entrepreneur brainstorm business ideas. Generate 5-7 concise, actionable suggestions for the ${fieldType} aspect of a business idea.`;

  const fieldSpecificPrompts = {
    product: `Focus on innovative products, services, or solutions. Consider current market trends, emerging technologies, and unmet needs.`,
    customer: `Focus on target customer segments, demographics, and user personas. Consider different market segments and their pain points.`,
    businessModel: `Focus on revenue models, pricing strategies, and business approaches. Consider subscription, freemium, marketplace, B2B, B2C models, etc.`
  };

  const contextPrompt = context
    ? ` The user has provided this context: "${context}". Please tailor your suggestions to be relevant to this context.`
    : "";

  return `${basePrompt} ${fieldSpecificPrompts[fieldType]}${contextPrompt}

Please respond with a JSON object containing a "suggestions" array with 5-7 strings, each under 200 characters. Each suggestion should be practical and inspiring.`;
};

// POST /api/ai/suggestions - Get AI-powered suggestions for idea fields
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate input
    const { fieldType, context } = aiSuggestionSchema.parse(body);

    // Generate AI prompt
    const prompt = getPromptForFieldType(fieldType, context);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful business advisor specializing in entrepreneurship and innovation. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Parse and validate AI response
    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    const validatedResponse = aiResponseSchema.parse(aiResponse);

    return NextResponse.json({
      suggestions: validatedResponse.suggestions,
      fieldType
    });

  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.message },
        { status: 400 }
      );
    }

    // Handle OpenAI API errors
    if (error instanceof Error && error.message.includes("OpenAI")) {
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 503 }
      );
    }

    // Handle rate limiting
    if (error instanceof Error && error.message.includes("rate_limit")) {
      return NextResponse.json(
        { error: "Too many requests, please try again later" },
        { status: 429 }
      );
    }

    // Log and handle other errors
    console.error("Error generating AI suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}