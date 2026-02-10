"use client";

import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import {
  CONFIDENCE_OPTIONS,
  EXPLANATION_STYLE_OPTIONS,
  LEARNING_GOAL_OPTIONS,
  LEARNING_PACE_OPTIONS,
  LEARNING_STYLE_OPTIONS,
  type ConfidenceLevel,
  type ExplanationStyle,
  type LearningGoal,
  type LearningPace,
  type LearningStyle,
} from "@/lib/learning-memory";

export type LearningPreferencesValue = {
  learningPace: LearningPace;
  preferredLearningStyle: LearningStyle;
  preferredExplanationStyle: ExplanationStyle;
  confidenceLevel: ConfidenceLevel;
  goals: LearningGoal[];
};

type Props = {
  value: LearningPreferencesValue;
  onChange: (next: LearningPreferencesValue) => void;
  disabled?: boolean;
};

const GoalItem = ({
  value,
  checked,
  label,
  disabled,
  onChange,
}: {
  value: LearningGoal;
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (goal: LearningGoal, checked: boolean) => void;
}) => (
  <label
    className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
    htmlFor={`goal-${value}`}
  >
    <Checkbox
      id={`goal-${value}`}
      checked={checked}
      disabled={disabled}
      onCheckedChange={(state) => onChange(value, Boolean(state))}
    />
    <span className="text-sm">{label}</span>
  </label>
);

const Question = ({
  label,
  description,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  <div className="space-y-3">
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
    <RadioGroup
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      className="grid gap-2"
    >
      {options.map((option) => (
        <label
          key={option.value}
          htmlFor={`${label}-${option.value}`}
          className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <RadioGroupItem id={`${label}-${option.value}`} value={option.value} />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  </div>
);

export function LearningPreferencesFields({
  value,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="space-y-6">
      <Question
        label="Preferred learning style"
        description="How should lessons be introduced first?"
        value={value.preferredLearningStyle}
        options={LEARNING_STYLE_OPTIONS}
        disabled={disabled}
        onChange={(next) =>
          onChange({
            ...value,
            preferredLearningStyle: next as LearningStyle,
          })
        }
      />

      <Question
        label="Preferred explanation style"
        description="How should AI responses be formatted?"
        value={value.preferredExplanationStyle}
        options={EXPLANATION_STYLE_OPTIONS}
        disabled={disabled}
        onChange={(next) =>
          onChange({
            ...value,
            preferredExplanationStyle: next as ExplanationStyle,
          })
        }
      />

      <Question
        label="Confidence level"
        description="How comfortable are you with this subject today?"
        value={value.confidenceLevel}
        options={CONFIDENCE_OPTIONS}
        disabled={disabled}
        onChange={(next) =>
          onChange({
            ...value,
            confidenceLevel: next as ConfidenceLevel,
          })
        }
      />

      <Question
        label="Preferred pace"
        description="How quickly should AI move through explanations?"
        value={value.learningPace}
        options={LEARNING_PACE_OPTIONS}
        disabled={disabled}
        onChange={(next) =>
          onChange({
            ...value,
            learningPace: next as LearningPace,
          })
        }
      />

      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">Primary goals</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Select one or more goals to optimize your learning plan.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {LEARNING_GOAL_OPTIONS.map((goal) => (
            <GoalItem
              key={goal.value}
              value={goal.value}
              checked={value.goals.includes(goal.value)}
              label={goal.label}
              disabled={disabled}
              onChange={(goalValue, checked) => {
                const nextGoals = checked
                  ? [...new Set([...value.goals, goalValue])]
                  : value.goals.filter((goalItem) => goalItem !== goalValue);
                onChange({
                  ...value,
                  goals: nextGoals,
                });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
