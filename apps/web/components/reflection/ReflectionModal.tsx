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
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Label } from "@workspace/ui/components/label";
import { Loader2, CheckCircle, XCircle, Lightbulb } from "lucide-react";

type ReflectionPoint = {
  time: number;
  topic: string;
};

type Props = {
  reflection: ReflectionPoint;
  studentId: string;
  onComplete: () => void;
  /** When set, transcript up to reflection.time is fetched and used to generate the quiz question. */
  chapterId?: string | null;
};

interface EvaluationResult {
  correct: boolean;
  feedback: string;
  hint?: string;
}

export function ReflectionModal({ reflection, studentId, onComplete, chapterId }: Props) {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[] | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(true);

  const isMultipleChoice = options !== null && options.length > 0;

  // Generate quiz question when modal opens — use transcript up to reflection.time when chapterId is set
  useEffect(() => {
    generateQuestion();
  }, [reflection.topic, reflection.time, chapterId]);

  const generateQuestion = async () => {
    setIsGeneratingQuestion(true);
    setAnswer("");
    setSelectedOptionIndex(null);
    setEvaluation(null);
    setShowHint(false);
    try {
      let transcriptText: string | undefined;

      if (chapterId) {
        const transcriptRes = await fetch(
          `/api/reflection/transcript?chapterId=${encodeURIComponent(chapterId)}`,
        );
        if (transcriptRes.ok) {
          const { segments } = await transcriptRes.json();
          if (Array.isArray(segments) && segments.length > 0) {
            const upToTime = reflection.time;
            const filtered = segments.filter(
              (s: { start?: number }) => (s.start ?? 0) <= upToTime + 1,
            );
            transcriptText = filtered
              .map((s: { start?: number; text?: string }) => `[${Math.round((s.start ?? 0))}s] ${(s.text ?? "").trim()}`)
              .filter(Boolean)
              .join("\n");
          }
        }
      }

      const body: { topic: string; transcriptText?: string } = { topic: reflection.topic };
      if (transcriptText?.trim()) {
        body.transcriptText = transcriptText;
      }

      const response = await fetch("/api/reflection/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setQuestion(data.question ?? "");
      setOptions(data.options ?? null);
      setCorrectIndex(typeof data.correctIndex === "number" ? data.correctIndex : null);
    } catch (error) {
      console.error("Failed to generate question:", error);
      setQuestion(`What key concepts did you learn about ${reflection.topic}?`);
      setOptions(null);
      setCorrectIndex(null);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleSubmit = async () => {
    const hasAnswer = isMultipleChoice
      ? selectedOptionIndex !== null
      : answer.trim().length > 0;
    if (!hasAnswer) return;

    setIsSubmitting(true);
    try {
      let result: EvaluationResult;

      if (isMultipleChoice && correctIndex !== null && selectedOptionIndex !== null) {
        const correct = selectedOptionIndex === correctIndex;
        result = {
          correct,
          feedback: correct
            ? "Well done! You got it right."
            : "That's not correct. Review the topic and try again.",
        };
      } else {
        const response = await fetch("/api/reflection/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            answer: isMultipleChoice && selectedOptionIndex !== null && options
              ? options[selectedOptionIndex]
              : answer.trim(),
            topic: reflection.topic,
            studentId,
          }),
        });
        result = await response.json();
      }

      setEvaluation(result);
      setAttempts(attempts + 1);
      await updateMemory(result.correct);

      if (result.correct) {
        setTimeout(() => onComplete(), 1500);
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

  const canSubmit =
    isMultipleChoice ? selectedOptionIndex !== null : answer.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div>
            <CardTitle className="text-xl">Quiz Checkpoint</CardTitle>
            <p className="text-muted-foreground mt-1">
              Answer correctly to continue. Topic:{" "}
              <Badge variant="secondary">{reflection.topic}</Badge>
            </p>
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
                  Generating quiz question...
                </span>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm leading-relaxed">{question}</p>
              </div>
            )}
          </div>

          {/* Answer: Multiple choice or text */}
          {!isGeneratingQuestion && (
            <div className="space-y-3">
              <h3 className="font-medium">Your Answer:</h3>
              {isMultipleChoice && options ? (
                <RadioGroup
                  value={selectedOptionIndex !== null ? String(selectedOptionIndex) : ""}
                  onValueChange={(v) => setSelectedOptionIndex(parseInt(v, 10))}
                  disabled={!!evaluation}
                  className="space-y-2"
                >
                  {options.map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/30 has-checked:border-primary has-checked:bg-primary/5"
                    >
                      <RadioGroupItem value={String(i)} id={`opt-${i}`} />
                      <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-sm">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[100px]"
                  disabled={!!evaluation}
                />
              )}
            </div>
          )}

          {/* Evaluation Result */}
          {evaluation && (
            <div
              className={`p-4 rounded-lg border ${
                evaluation.correct
                  ? "bg-green-500/10 border-green-500/30 dark:bg-green-500/10 dark:border-green-500/30"
                  : "bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                {evaluation.correct ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${
                      evaluation.correct ? "text-green-800 dark:text-green-200" : "text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    {evaluation.correct ? "Correct!" : "Incorrect"}
                  </p>
                  <p className="text-sm mt-1 text-foreground/90">
                    {evaluation.feedback}
                  </p>

                  {!evaluation.correct && evaluation.hint && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHint(!showHint)}
                        className="mt-3"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        {showHint ? "Hide Hint" : "Show Hint"}
                      </Button>
                      {showHint && (
                        <div className="mt-3 p-3 rounded border bg-muted/50 border-border">
                          <p className="text-sm">
                            <strong>Hint:</strong> {evaluation.hint}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons – no skip / continue anyway */}
          {!isGeneratingQuestion && (
            <div className="flex gap-3 pt-4">
              {!evaluation ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Submit Answer
                </Button>
              ) : !evaluation.correct ? (
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
              ) : (
                <Button onClick={onComplete} className="flex-1">
                  Continue
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
