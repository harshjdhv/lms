"use client";

import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Loader2, CheckCircle, XCircle, Lightbulb } from "lucide-react";

type ReflectionPoint = {
  time: number;
  topic: string;
};

type Props = {
  reflection: ReflectionPoint;
  studentId: string;
  onComplete: () => void;
};

interface EvaluationResult {
  correct: boolean;
  feedback: string;
  hint?: string;
}

export function ReflectionModal({ reflection, studentId, onComplete }: Props) {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(true);

  // Generate AI question when modal opens
  useEffect(() => {
    generateQuestion();
  }, [reflection.topic]);

  const generateQuestion = async () => {
    setIsGeneratingQuestion(true);
    try {
      const response = await fetch("/api/reflection/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: reflection.topic }),
      });

      const data = await response.json();
      setQuestion(data.question);
    } catch (error) {
      console.error("Failed to generate question:", error);
      setQuestion(`What key concepts did you learn about ${reflection.topic}?`);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reflection/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer: answer.trim(),
          topic: reflection.topic,
          studentId,
        }),
      });

      const result: EvaluationResult = await response.json();
      setEvaluation(result);
      setAttempts(attempts + 1);

      // Update student memory
      await updateMemory(result.correct);

      if (result.correct) {
        // Auto-resume after a short delay if correct
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to evaluate answer:", error);
      setEvaluation({
        correct: false,
        feedback: "Unable to evaluate your answer. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateMemory = async (isCorrect: boolean) => {
    try {
      await fetch("/api/reflection/memory-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          topic: reflection.topic,
          isCorrect,
          attempts: attempts + 1,
        }),
      });
    } catch (error) {
      console.error("Failed to update memory:", error);
    }
  };

  const handleRetry = () => {
    setAnswer("");
    setEvaluation(null);
    setShowHint(false);
  };

  const getModalVariant = () => {
    if (!evaluation) return "default";
    return evaluation.correct ? "success" : "warning";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Reflection Checkpoint</CardTitle>
              <p className="text-muted-foreground mt-1">
                Let's test your understanding of{" "}
                <Badge variant="secondary">{reflection.topic}</Badge>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onComplete}
              className="text-muted-foreground"
            >
              Skip
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question Section */}
          <div className="space-y-3">
            <h3 className="font-medium">Question:</h3>
            {isGeneratingQuestion ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">
                  Generating question...
                </span>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm leading-relaxed">{question}</p>
              </div>
            )}
          </div>

          {/* Answer Section */}
          {!isGeneratingQuestion && (
            <div className="space-y-3">
              <h3 className="font-medium">Your Answer:</h3>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[100px]"
                disabled={!!evaluation}
              />
            </div>
          )}

          {/* Evaluation Result */}
          {evaluation && (
            <div
              className={`p-4 rounded-lg border ${
                evaluation.correct
                  ? "bg-green-50 border-green-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {evaluation.correct ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      evaluation.correct ? "text-green-800" : "text-amber-800"
                    }`}
                  >
                    {evaluation.correct ? "Correct!" : "Not quite right"}
                  </p>
                  <p className="text-sm mt-1 text-gray-700">
                    {evaluation.feedback}
                  </p>

                  {!evaluation.correct && evaluation.hint && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHint(!showHint)}
                      className="mt-3"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {showHint ? "Hide Hint" : "Show Hint"}
                    </Button>
                  )}

                  {showHint && evaluation.hint && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Hint:</strong> {evaluation.hint}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isGeneratingQuestion && (
            <div className="flex gap-3 pt-4">
              {!evaluation ? (
                <>
                  <Button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Submit Answer
                  </Button>
                  <Button variant="outline" onClick={onComplete}>
                    Skip Question
                  </Button>
                </>
              ) : !evaluation.correct ? (
                <>
                  <Button onClick={handleRetry} className="flex-1">
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={onComplete}>
                    Continue Anyway
                  </Button>
                </>
              ) : (
                <Button onClick={onComplete} className="flex-1">
                  Continue Learning
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
