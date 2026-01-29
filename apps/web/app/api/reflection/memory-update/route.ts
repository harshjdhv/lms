import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";

export async function POST(request: NextRequest) {
  try {
    const { studentId, topic, isCorrect, attempts } = await request.json();

    if (!studentId || !topic || typeof isCorrect !== "boolean") {
      return NextResponse.json(
        { error: "Student ID, topic, and correctness are required" },
        { status: 400 },
      );
    }

    // Get or create student memory record
    let memory = await prisma.studentReflectionMemory.findUnique({
      where: { userId: studentId },
    });

    if (!memory) {
      // Create new memory record
      memory = await prisma.studentReflectionMemory.create({
        data: {
          userId: studentId,
          weakTopics: isCorrect ? [] : [topic],
          accuracyRate: isCorrect ? 100.0 : 0.0,
          totalAttempts: attempts || 1,
          correctAttempts: isCorrect ? 1 : 0,
        },
      });
    } else {
      // Update existing memory record
      const newTotalAttempts = (memory.totalAttempts || 0) + (attempts || 1);
      const newCorrectAttempts = memory.correctAttempts + (isCorrect ? 1 : 0);
      const newAccuracyRate =
        newTotalAttempts > 0
          ? (newCorrectAttempts / newTotalAttempts) * 100
          : 0;

      // Update weak topics
      let weakTopics = [...(memory.weakTopics || [])];
      if (isCorrect) {
        // Remove topic from weak topics if correct
        weakTopics = weakTopics.filter((t) => t !== topic);
      } else {
        // Add topic to weak topics if incorrect and not already there
        if (!weakTopics.includes(topic)) {
          weakTopics.push(topic);
        }
      }

      memory = await prisma.studentReflectionMemory.update({
        where: { userId: studentId },
        data: {
          weakTopics,
          accuracyRate: newAccuracyRate,
          totalAttempts: newTotalAttempts,
          correctAttempts: newCorrectAttempts,
        },
      });
    }

    return NextResponse.json({
      success: true,
      memory: {
        weakTopics: memory.weakTopics,
        accuracyRate: memory.accuracyRate,
        totalAttempts: memory.totalAttempts,
        correctAttempts: memory.correctAttempts,
      },
      updated: {
        topic,
        isCorrect,
        attempts: attempts || 1,
      },
    });
  } catch (error) {
    console.error("Error updating student memory:", error);
    return NextResponse.json(
      { error: "Failed to update student memory" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 },
      );
    }

    const memory = await prisma.studentReflectionMemory.findUnique({
      where: { userId: studentId },
    });

    if (!memory) {
      return NextResponse.json({
        weakTopics: [],
        accuracyRate: 0.0,
        totalAttempts: 0,
        correctAttempts: 0,
      });
    }

    return NextResponse.json({
      weakTopics: memory.weakTopics,
      accuracyRate: memory.accuracyRate,
      totalAttempts: memory.totalAttempts,
      correctAttempts: memory.correctAttempts,
    });
  } catch (error) {
    console.error("Error fetching student memory:", error);
    return NextResponse.json(
      { error: "Failed to fetch student memory" },
      { status: 500 },
    );
  }
}
