import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { idea } from "@/db/schema/ideas";
import { updateIdeaSchema } from "@/lib/validations/idea";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/ideas/[id] - Get a specific idea
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [ideaRecord] = await db
      .select({
        id: idea.id,
        product: idea.product,
        customer: idea.customer,
        businessModel: idea.businessModel,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      })
      .from(idea)
      .where(and(eq(idea.id, id), eq(idea.userId, session.user.id)));

    if (!ideaRecord) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ idea: ideaRecord });
  } catch (error) {
    console.error("Error fetching idea:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/ideas/[id] - Update a specific idea
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const validatedData = updateIdeaSchema.parse(body);

    // Check if idea exists and belongs to user
    const [existingIdea] = await db
      .select({ id: idea.id })
      .from(idea)
      .where(and(eq(idea.id, id), eq(idea.userId, session.user.id)));

    if (!existingIdea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Update idea
    const [updatedIdea] = await db
      .update(idea)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(eq(idea.id, id), eq(idea.userId, session.user.id)))
      .returning({
        id: idea.id,
        product: idea.product,
        customer: idea.customer,
        businessModel: idea.businessModel,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      });

    return NextResponse.json({ idea: updatedIdea });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.message },
        { status: 400 }
      );
    }

    console.error("Error updating idea:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas/[id] - Delete a specific idea
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if idea exists and belongs to user
    const [existingIdea] = await db
      .select({ id: idea.id })
      .from(idea)
      .where(and(eq(idea.id, id), eq(idea.userId, session.user.id)));

    if (!existingIdea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Delete idea
    await db
      .delete(idea)
      .where(and(eq(idea.id, id), eq(idea.userId, session.user.id)));

    return NextResponse.json({ message: "Idea deleted successfully" });
  } catch (error) {
    console.error("Error deleting idea:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}