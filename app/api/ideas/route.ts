import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { idea } from "@/db/schema/ideas";
import { createIdeaSchema } from "@/lib/validations/idea";
import { eq, desc } from "drizzle-orm";

// GET /api/ideas - Get all ideas for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ideas = await db
      .select({
        id: idea.id,
        product: idea.product,
        customer: idea.customer,
        businessModel: idea.businessModel,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      })
      .from(idea)
      .where(eq(idea.userId, session.user.id))
      .orderBy(desc(idea.createdAt));

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/ideas - Create a new idea
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = createIdeaSchema.parse(body);

    // Create new idea
    const [newIdea] = await db
      .insert(idea)
      .values({
        userId: session.user.id,
        product: validatedData.product,
        customer: validatedData.customer,
        businessModel: validatedData.businessModel,
        updatedAt: new Date(),
      })
      .returning({
        id: idea.id,
        product: idea.product,
        customer: idea.customer,
        businessModel: idea.businessModel,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      });

    return NextResponse.json({ idea: newIdea }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.message },
        { status: 400 }
      );
    }

    console.error("Error creating idea:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}