"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAppStore, type TaskPriority } from "@/lib/app-store";

const taskSchema = z.object({
  title: z.string().min(3, "标题至少 3 个字符").max(100),
  description: z.string().max(500, "描述最多 500 个字符"),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

type TaskFormProps = {
  mode: "create" | "edit";
  taskId?: string;
};

type FieldProps<T> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  type?: "text" | "textarea" | "select" | "date";
  options?: { label: string; value: string }[];
};

function Field<T extends string>({
  label,
  value,
  onChange,
  error,
  type = "text",
  options,
}: FieldProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-400">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all resize-none min-h-[120px] font-light text-zinc-800"
        />
      ) : type === "select" && options ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all font-light text-zinc-800 appearance-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "date" ? (
        <input
          type="datetime-local"
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all font-light text-zinc-800"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all font-light text-zinc-800"
        />
      )}

      {error && <span className="text-xs text-red-500 font-mono tracking-wider mt-1">{error}</span>}
    </div>
  );
}

export default function TaskForm({ mode, taskId }: TaskFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const taskDraft = useAppStore((state) => state.taskDraft);
  const loadTaskDraft = useAppStore((state) => state.loadTaskDraft);
  const resetTaskDraft = useAppStore((state) => state.resetTaskDraft);
  const setTaskDraft = useAppStore((state) => state.setTaskDraft);
  const createTask = useAppStore((state) => state.createTask);
  const updateTask = useAppStore((state) => state.updateTask);

  useEffect(() => {
    if (mode === "edit" && taskId) {
      loadTaskDraft(taskId);
      return;
    }

    resetTaskDraft();
  }, [loadTaskDraft, mode, resetTaskDraft, taskId]);

  const handleSave = (event: FormEvent) => {
    event.preventDefault();

    const result = taskSchema.safeParse(taskDraft);

    if (!result.success) {
      const nextErrors: Partial<Record<keyof TaskFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          nextErrors[field as keyof TaskFormData] = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});

    if (mode === "edit" && taskId) {
      updateTask(taskId);
    } else {
      createTask();
    }

    resetTaskDraft();
    router.push("/tasks");
  };

  const handleCancel = () => {
    resetTaskDraft();
    router.push("/tasks");
  };

  return (
    <div className="relative isolate flex flex-col gap-10 max-w-3xl w-full pt-8 pb-32 min-h-screen">
      <div className="page-background page-background--form" aria-hidden="true" />
      <header className="rounded-[2rem] border border-white/65 bg-white/55 px-6 py-6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(24,24,27,0.08)] sm:px-8">
        <Link
          href="/tasks"
          className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-800 transition-colors inline-block mb-8"
        >
          ← 返回看板
        </Link>
        <h1 className="text-4xl lg:text-5xl font-extralight tracking-tight text-zinc-900">
          {mode === "edit" ? "编辑任务" : "新建任务"}
        </h1>
        {mode === "edit" && taskId ? (
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">
            任务 ID: {taskId}
          </p>
        ) : (
          <p className="text-zinc-500 font-light text-lg">新建任务会直接写入全局状态，并和看板同步。</p>
        )}
      </header>

      <form
        onSubmit={handleSave}
        className="space-y-8 rounded-[2rem] border border-zinc-200/70 bg-white/70 p-8 shadow-[0_24px_80px_rgba(24,24,27,0.08)] backdrop-blur-2xl sm:p-12"
      >
        <Field<string>
          label="标题"
          value={taskDraft.title}
          onChange={(value) => setTaskDraft({ title: value })}
          error={errors.title}
        />

        <Field<string>
          label="描述"
          type="textarea"
          value={taskDraft.description}
          onChange={(value) => setTaskDraft({ description: value })}
          error={errors.description}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Field<string>
            label="优先级"
            type="select"
            value={taskDraft.priority}
            onChange={(value) => setTaskDraft({ priority: value as TaskPriority })}
            options={[
              { label: "低", value: "low" },
              { label: "中", value: "medium" },
              { label: "高", value: "high" },
            ]}
            error={errors.priority}
          />

          <Field<string>
            label="截止时间"
            type="date"
            value={taskDraft.dueDate}
            onChange={(value) => setTaskDraft({ dueDate: value })}
            error={errors.dueDate}
          />
        </div>

        <div className="pt-8 border-t border-zinc-100 flex justify-end gap-4 mt-12">
          <button
            type="button"
            onClick={handleCancel}
            className="px-8 py-4 rounded-full text-xs font-semibold tracking-[0.15em] uppercase text-zinc-500 hover:bg-zinc-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-8 py-4 rounded-full text-xs font-semibold tracking-[0.15em] uppercase bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20"
          >
            {mode === "edit" ? "保存修改" : "创建任务"}
          </button>
        </div>
      </form>
    </div>
  );
}