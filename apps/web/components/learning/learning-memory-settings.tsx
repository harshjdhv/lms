"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  LearningPreferencesFields,
  type LearningPreferencesValue,
} from "@/components/learning/learning-preferences-fields";

const DEFAULT_PREFERENCES: LearningPreferencesValue = {
  learningPace: "STEADY",
  preferredLearningStyle: "MIXED",
  preferredExplanationStyle: "STEP_BY_STEP",
  confidenceLevel: "BEGINNER",
  goals: ["DEEP_UNDERSTANDING"],
};

export function LearningMemorySettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [preferences, setPreferences] =
    useState<LearningPreferencesValue>(DEFAULT_PREFERENCES);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/user/learning-memory");
        const data = await res.json();
        if (!res.ok || !mounted) return;
        const memory = data.memory ?? {};
        setPreferences({
          learningPace: memory.learningPace ?? DEFAULT_PREFERENCES.learningPace,
          preferredLearningStyle:
            memory.preferredLearningStyle ??
            DEFAULT_PREFERENCES.preferredLearningStyle,
          preferredExplanationStyle:
            memory.preferredExplanationStyle ??
            DEFAULT_PREFERENCES.preferredExplanationStyle,
          confidenceLevel:
            memory.confidenceLevel ?? DEFAULT_PREFERENCES.confidenceLevel,
          goals:
            memory.goals?.length > 0 ? memory.goals : DEFAULT_PREFERENCES.goals,
        });
      } catch (error) {
        console.error("Failed to load learning memory settings:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/user/learning-memory", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            preferences,
            onboardingAnswers: preferences,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to save learning settings");
        }
        toast.success("Learning preferences updated");
      } catch (error) {
        console.error(error);
        toast.error("Could not save learning preferences");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Preferences</CardTitle>
        <CardDescription>
          These settings drive how AI generates questions and explanations for
          you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading learning preferences...
          </div>
        ) : (
          <LearningPreferencesFields
            value={preferences}
            onChange={setPreferences}
            disabled={isPending}
          />
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/20">
        <Button
          onClick={onSave}
          disabled={isLoading || isPending}
          className="min-w-[150px]"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
