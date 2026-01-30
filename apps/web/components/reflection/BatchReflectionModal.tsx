
"use client";

import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Loader2, CheckCircle, BookOpen, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";

type Question = {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
};

type Props = {
    chapterId: string;
    currentTime: number;
    onComplete: () => void;
};

type QuizState =
    | "initializing"
    | "quiz"
    | "evaluating" // Showing results momentarily, or checking 
    | "remediation_loading"
    | "remediation_teaching"
    | "remediation_quiz"
    | "success";

export function BatchReflectionModal({ chapterId, currentTime, onComplete }: Props) {
    const [state, setState] = useState<QuizState>("initializing");

    // Data
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, number>>({}); // questionId -> optionIndex

    // Remediation
    const [transcriptText, setTranscriptText] = useState<string>("");
    const [failedQuestionsQueue, setFailedQuestionsQueue] = useState<Question[]>([]);
    const [currentRemediation, setCurrentRemediation] = useState<{
        explanation: string;
        question: Question;
        originalQuestionId: string;
    } | null>(null);

    // Load Initial Quiz
    useEffect(() => {
        const loadQuiz = async () => {
            try {
                // 1. Fetch transcript context
                const transcriptRes = await fetch(
                    `/api/reflection/transcript?chapterId=${encodeURIComponent(chapterId)}`
                );
                if (!transcriptRes.ok) throw new Error("Failed to load transcript");

                const { segments }: { segments: { start: number; text: string }[] } = await transcriptRes.json();
                let textContext = "";

                if (Array.isArray(segments)) {
                    // Get context around current time (+/- window or just up to now?)
                    // User asked "from the transcript as well around that part". 
                    // Usually "up to now" is best for "what did you just watch".
                    // Let's take last 3 minutes or so? Or just up to current time.
                    // Prompt says "paused at 3:00 min... around that part".
                    const startTime = Math.max(0, currentTime - 180); // Last 3 mins
                    const relevant = segments.filter((s) => s.start >= startTime && s.start <= currentTime + 5);
                    textContext = relevant.map((s) => s.text).join(" ");
                }
                setTranscriptText(textContext);

                if (!textContext.trim()) {
                    toast.error("No transcript available for this section.");
                    onComplete();
                    return;
                }

                // 2. Generate Batch Questions
                const generateRes = await fetch("/api/reflection/generate-batch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ transcriptText: textContext, count: 4 }),
                });

                const data = await generateRes.json();
                if (data.questions && Array.isArray(data.questions)) {
                    setQuestions(data.questions);
                    setState("quiz");
                } else {
                    throw new Error("No questions generated");
                }
            } catch (err) {
                console.error(err);
                toast.error("Could not generate quiz. Continuing.");
                onComplete();
            }
        };
        loadQuiz();
    }, [chapterId, currentTime, onComplete]);

    // Quiz Handling
    const handleOptionSelect = (index: number) => {
        const q = state === "quiz" ? questions[currentQuestionIndex] : currentRemediation?.question;
        if (!q) return;

        setUserAnswers(prev => ({ ...prev, [q.id]: index }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Submit Quiz
            evaluateQuiz();
        }
    };

    const evaluateQuiz = () => {
        setState("evaluating");
        const failed: Question[] = [];

        questions.forEach(q => {
            if (userAnswers[q.id] !== q.correctIndex) {
                failed.push(q);
            }
        });

        if (failed.length === 0) {
            // All Correct!
            setState("success");
        } else {
            // Start Remediation Loop
            setFailedQuestionsQueue(failed);
            if (failed[0]) {
                startRemediationFor(failed[0]);
            }
        }
    };

    // Remediation Handling
    const startRemediationFor = async (failedQ: Question) => {
        setState("remediation_loading");
        try {
            const wrongIndex = userAnswers[failedQ.id];
            const res = await fetch("/api/reflection/remediate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transcriptText,
                    failedQuestion: failedQ,
                    wrongAnswerIndex: wrongIndex,
                }),
            });
            const data = await res.json();

            setCurrentRemediation({
                explanation: data.explanation,
                question: { ...data.newQuestion, id: `remediate-${failedQ.id}-${Date.now()}` },
                originalQuestionId: failedQ.id,
            });

            setState("remediation_teaching");
        } catch (err) {
            console.error(err);
            toast.error("Failed to load explanation.");
            // Skip this one? Or just retry?
            // For now, let's just skip to next or success if empty
            const remaining = failedQuestionsQueue.slice(1);
            if (remaining.length > 0 && remaining[0]) {
                setFailedQuestionsQueue(remaining);
                startRemediationFor(remaining[0]);
            } else {
                setState("success");
            }
        }
    };

    const handleRemediationContinue = () => {
        // Explanation read, show question
        setState("remediation_quiz");
        // Clear answer for the new question
        if (currentRemediation) {
            const newId = currentRemediation.question.id;
            setUserAnswers(prev => {
                const copy = { ...prev };
                delete copy[newId];
                return copy;
            });
        }
    };

    const handleRemediationSubmit = () => {
        if (!currentRemediation) return;
        const q = currentRemediation.question;
        const ans = userAnswers[q.id];

        if (ans === q.correctIndex) {
            // Success! Move to next failed item
            toast.success("Correct! Great job.");
            const remaining = failedQuestionsQueue.slice(1);
            setFailedQuestionsQueue(remaining);

            if (remaining.length > 0 && remaining[0]) {
                startRemediationFor(remaining[0]);
            } else {
                setState("success");
            }
        } else {
            // Failed again. Loop continues (User said "keep on making it simpler")
            // In this version, I'll recursively call remediation on THIS new question
            toast.error("Not quite. Let's break it down further.");
            startRemediationFor(q); // Remediate the remediation question
        }
    };


    // Renders
    if (state === "initializing") {
        return (
            <div className="fixed top-0 bottom-0 right-0 left-0 md:left-64 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                    <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-zinc-400">Analyzing transcript & generating quiz...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (state === "success") {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
                <Card className="w-full max-w-md bg-zinc-900 border-emerald-900/50 text-zinc-100">
                    <CardContent className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Knowledge Locked In!</h3>
                            <p className="text-zinc-400">You&apos;ve mastered this section. Returning to video...</p>
                        </div>
                        <Button onClick={onComplete} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            Continue Watching <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Active Question (Quiz or Remediation)
    const activeQuestion = state === "quiz" ? questions[currentQuestionIndex] : currentRemediation?.question;
    const isRemediationPhase = state === "remediation_loading" || state === "remediation_teaching" || state === "remediation_quiz";

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl flex items-center gap-2">
                                {isRemediationPhase ? (
                                    <>
                                        <BookOpen className="h-5 w-5 text-amber-500" />
                                        <span className="text-amber-500">Learning Break</span>
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-5 w-5 text-indigo-500" />
                                        <span>Checkpoint Quiz</span>
                                    </>
                                )}
                            </CardTitle>
                            <p className="text-sm text-zinc-400">
                                {state === "quiz"
                                    ? `Question ${currentQuestionIndex + 1} of ${questions.length}`
                                    : "Let&apos;s review a concept you missed"}
                            </p>
                        </div>
                        {state === "quiz" && (
                            <div className="flex gap-1">
                                {questions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1.5 w-6 rounded-full transition-colors",
                                            i === currentQuestionIndex ? "bg-indigo-500" : i < currentQuestionIndex ? "bg-indigo-500/80" : "bg-zinc-800"
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {state === "remediation_loading" ? (
                        <div className="py-12 flex flex-col items-center justify-center text-zinc-400 space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                            <p>Preparing a simpler explanation for you...</p>
                        </div>
                    ) : state === "remediation_teaching" && currentRemediation ? (
                        <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                                <h3 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" /> Concept Explanation
                                </h3>
                                <p className="text-zinc-200 leading-relaxed text-base">
                                    {currentRemediation.explanation}
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleRemediationContinue} size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
                                    Got it, try again
                                </Button>
                            </div>
                        </div>
                    ) : activeQuestion ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-2">
                                <h2 className="text-lg md:text-xl font-medium leading-relaxed">
                                    {activeQuestion.question}
                                </h2>
                            </div>

                            <RadioGroup
                                value={userAnswers[activeQuestion.id]?.toString()}
                                onValueChange={(v) => handleOptionSelect(parseInt(v))}
                                className="space-y-3"
                            >
                                {activeQuestion.options.map((opt, i) => (
                                    <label
                                        key={i}
                                        className={cn(
                                            "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all duration-200 group",
                                            userAnswers[activeQuestion.id] === i
                                                ? "bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/50"
                                                : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
                                        )}
                                    >
                                        <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="sr-only" />
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                            userAnswers[activeQuestion.id] === i ? "border-indigo-500 bg-indigo-500" : "border-zinc-600 group-hover:border-zinc-500"
                                        )}>
                                            {userAnswers[activeQuestion.id] === i && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <span className="text-base text-zinc-300 group-hover:text-zinc-100 flex-1">{opt}</span>
                                    </label>
                                ))}
                            </RadioGroup>

                            <div className="pt-4 flex justify-end">
                                {state === "quiz" ? (
                                    <Button
                                        onClick={handleNextQuestion}
                                        disabled={userAnswers[activeQuestion.id] === undefined}
                                        size="lg"
                                        className="min-w-[120px]"
                                    >
                                        {currentQuestionIndex < questions.length - 1 ? "Next" : "Submit"} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleRemediationSubmit}
                                        disabled={userAnswers[activeQuestion.id] === undefined}
                                        size="lg"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        Check Understanding
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
