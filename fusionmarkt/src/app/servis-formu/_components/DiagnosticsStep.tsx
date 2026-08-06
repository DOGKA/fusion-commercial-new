"use client";

import { useState } from "react";
import { Check, Info } from "lucide-react";
import {
  APPROX_DATE_LABEL,
  getQuestionHint,
  getQuestionOptions,
  getVisibleGroups,
  type DiagnosticAnswers,
  type DiagnosticQuestion,
  type ProductModel,
} from "@/lib/service-form/diagnostics";
import { FieldError } from "./FieldError";

type Props = {
  model: ProductModel;
  answers: DiagnosticAnswers;
  errors: Record<string, string | undefined>;
  onChange: (questionId: string, value: string | string[]) => void;
};

export function DiagnosticsStep({ model, answers, errors, onChange }: Props) {
  const groups = getVisibleGroups(model, answers);

  return (
    <div className="space-y-8">
      {groups.map(({ group, questions }) => (
        <section key={group.id}>
          <div className="mb-4 pb-2 border-b border-[var(--glass-border)]">
            <h3 className="text-base sm:text-lg font-semibold">{group.title}</h3>
            {group.description && (
              <p className="text-xs sm:text-sm text-[var(--foreground-tertiary)] mt-1">
                {group.description}
              </p>
            )}
          </div>
          <div className="space-y-5">
            {questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                model={model}
                value={answers[question.id]}
                error={errors[question.id]}
                onChange={onChange}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type DateChoiceFieldProps = {
  question: DiagnosticQuestion;
  label: React.ReactNode;
  value: string;
  error?: string;
  onChange: (questionId: string, value: string | string[]) => void;
};

function DateChoiceField({ question, label, value, error, onChange }: DateChoiceFieldProps) {
  const today = new Date().toISOString().split("T")[0];
  const isExactDate = value !== "" && value !== APPROX_DATE_LABEL && value !== today;
  const [pickingExact, setPickingExact] = useState(isExactDate);
  const hasError = Boolean(error);

  const choices: { id: string; label: string; onSelect: () => void; active: boolean }[] = [
    {
      id: "today",
      label: "Bugün",
      active: !pickingExact && value === today,
      onSelect: () => {
        setPickingExact(false);
        onChange(question.id, today);
      },
    },
    {
      id: "approx",
      label: APPROX_DATE_LABEL,
      active: !pickingExact && value === APPROX_DATE_LABEL,
      onSelect: () => {
        setPickingExact(false);
        onChange(question.id, APPROX_DATE_LABEL);
      },
    },
    {
      id: "exact",
      label: "Tarih seç",
      active: pickingExact,
      onSelect: () => {
        setPickingExact(true);
        if (value === today || value === APPROX_DATE_LABEL) onChange(question.id, "");
      },
    },
  ];

  return (
    <div>
      {label}
      <div role="radiogroup" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            role="radio"
            aria-checked={choice.active}
            onClick={choice.onSelect}
            className={`flex items-center justify-center px-3 py-2.5 rounded-xl border transition-all ${
              choice.active
                ? "border-[var(--fusion-primary)] bg-[var(--fusion-primary)]/10 text-[var(--fusion-primary)] font-medium"
                : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--glass-border-hover)]"
            } ${hasError ? "border-[var(--fusion-error)]" : ""}`}
          >
            <span className="text-xs sm:text-sm leading-snug text-center">{choice.label}</span>
          </button>
        ))}
      </div>
      {pickingExact && (
        <input
          type="date"
          value={isExactDate ? value : ""}
          max={today}
          onChange={(e) => onChange(question.id, e.target.value)}
          className={`glass-input mt-2 w-full min-w-0 px-3 sm:px-4 py-3 rounded-xl text-sm sm:text-base ${
            hasError ? "border-[var(--fusion-error)]" : ""
          }`}
        />
      )}
      <FieldError message={error} />
    </div>
  );
}

type QuestionFieldProps = {
  question: DiagnosticQuestion;
  model: ProductModel;
  value: string | string[] | undefined;
  error?: string;
  onChange: (questionId: string, value: string | string[]) => void;
};

function QuestionField({ question, model, value, error, onChange }: QuestionFieldProps) {
  const hint = getQuestionHint(question, model);
  const hasError = Boolean(error);

  const label = (
    <div className="mb-2">
      <label className="block text-sm font-medium">
        {question.label}{" "}
        {question.required && <span className="text-[var(--fusion-primary)]">*</span>}
      </label>
      {hint && (
        <div className="mt-1.5 flex items-start gap-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] px-3 py-2">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[var(--fusion-info)]" />
          <span className="text-xs text-[var(--foreground-tertiary)] leading-relaxed">{hint}</span>
        </div>
      )}
    </div>
  );

  if (question.type === "date") {
    return (
      <DateChoiceField
        question={question}
        label={label}
        value={typeof value === "string" ? value : ""}
        error={error}
        onChange={onChange}
      />
    );
  }

  if (question.type === "text" || question.type === "textarea") {
    const textValue = typeof value === "string" ? value : "";
    return (
      <div>
        {label}
        {question.type === "textarea" ? (
          <textarea
            rows={3}
            value={textValue}
            onChange={(e) => onChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`glass-input w-full px-3 sm:px-4 py-3 rounded-xl resize-none text-sm sm:text-base ${
              hasError ? "border-[var(--fusion-error)]" : ""
            }`}
          />
        ) : (
          <input
            type="text"
            value={textValue}
            onChange={(e) => onChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`glass-input w-full px-3 sm:px-4 py-3 rounded-xl text-sm sm:text-base ${
              hasError ? "border-[var(--fusion-error)]" : ""
            }`}
          />
        )}
        <FieldError message={error} />
      </div>
    );
  }

  const options = getQuestionOptions(question, model);
  const isMulti = question.type === "multi";
  const selected = isMulti
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === "string"
      ? [value]
      : [];

  const toggle = (option: string) => {
    if (!isMulti) {
      onChange(question.id, option);
      return;
    }
    const exclusive = question.exclusiveOptions ?? [];
    if (exclusive.includes(option)) {
      onChange(question.id, selected.includes(option) ? [] : [option]);
      return;
    }
    const withoutExclusive = selected.filter((item) => !exclusive.includes(item));
    onChange(
      question.id,
      withoutExclusive.includes(option)
        ? withoutExclusive.filter((item) => item !== option)
        : [...withoutExclusive, option]
    );
  };

  return (
    <div>
      {label}
      <div
        role={isMulti ? "group" : "radiogroup"}
        className="grid sm:grid-cols-2 gap-2"
      >
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              role={isMulti ? "checkbox" : "radio"}
              aria-checked={isSelected}
              onClick={() => toggle(option)}
              className={`flex items-start gap-2.5 text-left px-3 py-2.5 rounded-xl border transition-all ${
                isSelected
                  ? "border-[var(--fusion-primary)] bg-[var(--fusion-primary)]/10"
                  : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--glass-border-hover)]"
              } ${hasError ? "border-[var(--fusion-error)]" : ""}`}
            >
              <span
                aria-hidden
                className={`mt-0.5 w-4 h-4 flex-shrink-0 flex items-center justify-center border transition-colors ${
                  isMulti ? "rounded" : "rounded-full"
                } ${
                  isSelected
                    ? "bg-[var(--fusion-primary)] border-[var(--fusion-primary)]"
                    : "border-gray-400"
                }`}
              >
                {isSelected &&
                  (isMulti ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  ))}
              </span>
              <span
                className={`text-xs sm:text-sm leading-snug ${
                  isSelected ? "text-[var(--fusion-primary)] font-medium" : ""
                }`}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}
