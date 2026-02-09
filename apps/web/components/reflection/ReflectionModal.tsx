"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Loader2, CheckCircle, XCircle, Lightbulb, Send, MessageSquare, RotateCcw, ImageIcon, VideoIcon, ExternalLink } from "lucide-react";

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
  /** Start time of the segment to generate questions for (e.g. previous reflection point). Defaults to 0. */
  previousTime?: number;
};

interface EvaluationResult {
  correct: boolean;
  feedback: string;
  hint?: string;
  // Combined similarity/semantic score in the 0-1 range from the evaluator.
  score?: number;
}

export function ReflectionModal({ reflection, studentId, onComplete, chapterId, previousTime = 0 }: Props) {
  const [question, setQuestion] = useState<string>("");
  const [referenceAnswer, setReferenceAnswer] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(true);

  // Chat Mode State
  const [mode, setMode] = useState<'quiz' | 'chat'>('quiz');
  type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
    resources?: {
      type: 'images' | 'videos';
      data: any[];
    };
  };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, mode]);

  // Generate quiz question when modal opens — use transcript up to reflection.time when chapterId is set
  useEffect(() => {
    let active = true;

    const generateQuestion = async () => {
      setIsGeneratingQuestion(true);
      setAnswer("");
      setEvaluation(null);
      setShowHint(false);
      setMode('quiz'); // Reset to quiz mode
      setChatMessages([]);
      try {
        let transcriptText: string | undefined;

        if (chapterId) {
          let transcriptRes = await fetch(
            `/api/reflection/transcript?chapterId=${encodeURIComponent(chapterId)}`,
          );
          let data = await transcriptRes.json();

          // Poll when transcription is in progress (captionless / STT)
          const maxPollAttempts = 30;
          let attempts = 0;
          while (
            active &&
            transcriptRes.ok &&
            data.status === "processing" &&
            data.jobId &&
            attempts < maxPollAttempts
          ) {
            await new Promise((r) => setTimeout(r, 2000));
            transcriptRes = await fetch(
              `/api/reflection/transcript?chapterId=${encodeURIComponent(chapterId)}`,
            );
            data = await transcriptRes.json();
            attempts++;
          }

          if (active && transcriptRes.ok && Array.isArray(data.segments) && data.segments.length > 0) {
            const segments = data.segments as { start?: number; text?: string }[];
            const upToTime = reflection.time;
            const fromTime = previousTime;
            // Filter segments that overlap with [fromTime, upToTime]
            // A segment is relevant if its start time is <= upToTime AND >= fromTime
            // Or we can just take everything between previous point and current point.
            // Let's be generous: include segments that start slightly before previousTime if they are close?
            // Simplest: start >= fromTime && start <= upToTime
            const filtered = segments.filter(
              (s: { start?: number }) => {
                const start = s.start ?? 0;
                return start >= fromTime && start <= upToTime + 2; // +2s buffer
              }
            );
            transcriptText = filtered
              .map((s: { start?: number; text?: string }) => `[${Math.round((s.start ?? 0))}s] ${(s.text ?? "").trim()}`)
              .filter(Boolean)
              .join("\n");
          }
        }

        if (!active) return;

        const body: { topic: string; transcriptText?: string } = { topic: reflection.topic };
        if (transcriptText?.trim()) {
          body.transcriptText = transcriptText;
        }

        const response = await fetch("/api/reflection/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!active) return;

        const data = await response.json();
        setQuestion(data.question ?? "");
        setReferenceAnswer(data.referenceAnswer ?? "");
      } catch (error) {
        if (!active) return;
        console.error("Failed to generate question:", error);
        setQuestion(`What key concepts did you learn about ${reflection.topic}?`);
        setReferenceAnswer("");
      } finally {
        if (active) setIsGeneratingQuestion(false);
      }
    };

    generateQuestion();

    return () => {
      active = false;
    };
  }, [reflection.topic, reflection.time, chapterId, previousTime]);

  const handleSubmit = async () => {
    const hasAnswer = answer.trim().length > 0;
    if (!hasAnswer) return;

    setIsSubmitting(true);
    try {
      let result: EvaluationResult;

      const response = await fetch("/api/reflection/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer: answer.trim(),
          topic: reflection.topic,
          studentId,
          referenceAnswer,
        }),
      });
      result = await response.json();

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

  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/reflection/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, { role: 'user', content: userMessage }],
          context: {
            topic: reflection.topic,
            question: question,
            wrongAnswer: answer.trim(),
            referenceAnswer,
            transcriptContext: "", // Ideally pass the transcript text if we had it stored, simpler for now
          }
        }),
      });

      const data = await response.json();

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        resources: data.resources // Store resources if present
      }]);

      if (data.status === 'READY') {
        // AI detected user is ready to retry
        setTimeout(() => {
          handleRetry();
        }, 2000); // Give them a moment to read the confirmation
      }

    } catch (error) {
      console.error("Chat failed:", error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. You can try asking again or click 'Return to Quiz' to retry." }]);
    } finally {
      setIsChatLoading(false);
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
    setMode('quiz');
    // Note: We deliberately don't clear chatMessages immediately so they could potentially review,
    // but for now let's clear them to reset context for the next attempt if they fail again.
    setChatMessages([]);
  };

  const switchToChat = () => {
    if (evaluation && !evaluation.correct) {
      setMode('chat');
      // Initialize chat with feedback if empty
      if (chatMessages.length === 0) {
        setChatMessages([{
          role: 'assistant',
          content: `${evaluation.feedback} What part of this topic is confusing for you?`
        }]);
      }
    }
  };

  const canSubmit =
    answer.trim().length > 0;

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 md:left-64 z-50 flex font-sans transition-all duration-300">
      {/* Backdrop - now fills the offset container */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm transition-all duration-300" />

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col h-full lg:mr-80 xl:mr-96 w-full transition-all duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border/40 bg-background/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-7 px-3 text-sm">
              Reflection Point
            </Badge>
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <h2 className="font-semibold text-lg truncate max-w-[300px] sm:max-w-md">{reflection.topic}</h2>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-3xl mx-auto w-full px-6 py-12 flex flex-col justify-center min-h-[50vh]">

            {mode === 'quiz' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Question Section */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Question</h3>
                    {isGeneratingQuestion ? (
                      <div className="flex items-center py-4 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                        Generating quiz question...
                      </div>
                    ) : (
                      <p className="text-2xl font-medium leading-relaxed text-foreground">
                        {question}
                      </p>
                    )}
                  </div>
                </div>

                {/* Answer Section */}
                {!isGeneratingQuestion && (
                  <div className="space-y-6">
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="min-h-[150px] text-lg p-4 resize-none bg-background border-border/50 focus:border-primary"
                      disabled={!!evaluation}
                    />
                  </div>
                )}

                {/* Feedback & Actions */}
                {evaluation && (
                  <div className={`p-6 rounded-xl border ${evaluation.correct
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-amber-500/10 border-amber-500/20"
                    } animate-in zoom-in-95 duration-300`}>
                    <div className="flex items-start gap-4">
                      {evaluation.correct ? (
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1" />
                      ) : (
                        <XCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
                      )}
                      <div className="space-y-2">
                        <p className={`font-semibold text-lg ${evaluation.correct ? "text-green-800 dark:text-green-200" : "text-amber-800 dark:text-amber-200"
                          }`}>
                          {evaluation.correct ? "Correct!" : "Incorrect"}
                        </p>
                        <p className="text-foreground/80 leading-relaxed">
                          {evaluation.feedback}
                        </p>
                        {!evaluation.correct && evaluation.hint && (
                          <div className="pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowHint(!showHint)}
                              className="text-amber-700 dark:text-amber-300 hover:bg-amber-100/50 -ml-2"
                            >
                              <Lightbulb className="h-4 w-4 mr-2" />
                              {showHint ? "Hide Hint" : "Show Hint"}
                            </Button>
                            {showHint && (
                              <p className="mt-2 text-sm text-foreground/70 p-3 bg-background/50 rounded-lg">
                                {evaluation.hint}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Chat Mode UI */
              <div className="flex flex-col h-[calc(100vh-14rem)] max-h-[800px] animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto">
                <div className="flex-1 overflow-y-auto space-y-6 px-4 pb-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-base shadow-sm ${msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted border border-border/50 rounded-bl-none'
                        }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                        {msg.resources && msg.resources.data && msg.resources.data.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <div className="h-px bg-current/20 w-full" />
                            <p className="text-xs font-semibold uppercase tracking-wide opacity-80 flex items-center gap-1.5">
                              {msg.resources.type === 'images' ? <ImageIcon className="w-3.5 h-3.5" /> : <VideoIcon className="w-3.5 h-3.5" />}
                              {msg.resources.type === 'images' ? 'Helpful Visuals' : 'Related Videos'}
                            </p>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                              {msg.resources.data.map((item: any, i: number) => (
                                <a
                                  key={i}
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 group relative block w-48 aspect-video rounded-lg overflow-hidden border border-white/20 hover:border-white/50 bg-black/40 transition-all hover:scale-[1.02]"
                                >
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted/80">
                                      <ExternalLink className="w-6 h-6 opacity-50" />
                                    </div>
                                  )}
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6">
                                    <p className="text-[11px] text-white line-clamp-1 font-medium">{item.title}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted border border-border rounded-2xl rounded-bl-none px-5 py-3">
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 w-full px-4">
                  <form onSubmit={handleChatSubmit} className="relative max-w-4xl mx-auto w-full">
                    <Textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask for clarification or type 'Ready' to retry..."
                      className="min-h-[60px] max-h-[120px] resize-none pr-14 py-3 bg-muted/30 border-border/60 focus:bg-background text-base rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSubmit();
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  <div className="mt-3 flex justify-center">
                    <Button variant="link" size="sm" onClick={handleRetry} className="text-muted-foreground hover:text-foreground">
                      <RotateCcw className="h-3 w-3 mr-2" />
                      Return to Quiz manually
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Actions (Quiz Mode only) */}
        {mode === 'quiz' && !isGeneratingQuestion && (
          <div className="p-6 border-t border-border/40 bg-background/50 backdrop-blur-sm shrink-0">
            <div className="max-w-3xl mx-auto w-full flex gap-4">
              {!evaluation ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  size="lg"
                  className="w-full text-base font-medium h-12"
                >
                  {isSubmitting && (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  )}
                  Check Answer
                </Button>
              ) : !evaluation.correct ? (
                <div className="flex gap-4 w-full">
                  <Button onClick={handleRetry} variant="outline" size="lg" className="flex-1 h-12 border-2 hover:bg-muted/50">
                    Try Again
                  </Button>
                  <Button onClick={switchToChat} size="lg" className="flex-1 h-12 bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Explain with AI
                  </Button>
                </div>
              ) : (
                <Button onClick={onComplete} size="lg" className="w-full h-12 text-base shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white">
                  Continue Video
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
