"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { z } from "zod";

// Zod Schema
const taskSchema = z.object({
  title: z.string().min(3, "标题至少 3 个字符").max(100),
  description: z.string().max(500, "描述最多 500 个字符").optional(),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().datetime().optional(),
});

// Type Inference from Zod Schema
type TaskFormData = z.infer<typeof taskSchema>;

// Generic Component for Form Fields
type FormFieldProps<T> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  type?: "text" | "textarea" | "select" | "date";
  options?: { label: string; value: string }[];
};

function GenericField<T extends string | undefined>({
  label,
  value,
  onChange,
  error,
  type = "text",
  options,
}: FormFieldProps<T>) {
  return (
    <div className="flex flex-col gap-2 group animate-in slide-in-from-bottom-2 duration-500 fill-mode-both">
      <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-400 group-focus-within:text-zinc-800 transition-colors">
        {label}
      </label>
      
      {type === "textarea" ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value as T)}
          className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all resize-none min-h-[120px] font-light text-zinc-800"
        />
      ) : type === "select" && options ? (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value as T)}
          className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all font-light text-zinc-800 appearance-none"
        >
          {options.map((opt) => (
             <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === "date" ? (
        <input
          type="datetime-local"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value as T)}
          className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all font-light text-zinc-800"
        />
      ) : (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value as T)}
          className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all font-light text-zinc-800"
        />
      )}
      
      {error && (
        <span className="text-xs text-red-500 font-mono tracking-wider mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
}

export default function EditTaskPage() {
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "medium",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zod validation
    const result = taskSchema.safeParse(formData);
    
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(formattedErrors);
    } else {
      setErrors({});
      console.log("Saved validated data:", result.data);
      alert("已保存到草稿，控制台可查看提交数据。");
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-2xl w-full pt-8 pb-32 min-h-screen">
      <header className="space-y-4">
        <Link href="/tasks" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-800 transition-colors inline-block mb-8">
          ← 返回看板
        </Link>
        <h1 className="text-4xl lg:text-5xl font-extralight tracking-tight text-zinc-900">
          编辑任务
        </h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">
          任务 ID: {id}
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-8 bg-white p-8 sm:p-12 rounded-[2rem] border border-zinc-100 shadow-2xl shadow-zinc-200/20">
        <GenericField<string>
          label="标题"
          value={formData.title}
          onChange={(val) => setFormData({ ...formData, title: val })}
          error={errors.title}
        />

        <GenericField<string | undefined>
          label="描述"
          type="textarea"
          value={formData.description}
          onChange={(val) => setFormData({ ...formData, description: val })}
          error={errors.description}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <GenericField<string>
            label="优先级"
            type="select"
            value={formData.priority}
            onChange={(val) => setFormData({ ...formData, priority: val as "low"|"medium"|"high" })}
            options={[
              { label: "低", value: "low" },
              { label: "中", value: "medium" },
              { label: "高", value: "high" },
            ]}
            error={errors.priority}
          />
          
          <GenericField<string | undefined>
            label="截止时间"
            type="date"
            value={formData.dueDate}
            onChange={(val) => setFormData({ ...formData, dueDate: val })}
            error={errors.dueDate}
          />
        </div>

        <div className="pt-8 border-t border-zinc-100 flex justify-end gap-4 mt-12">
           <button 
             type="button" 
             className="px-8 py-4 rounded-full text-xs font-semibold tracking-[0.15em] uppercase text-zinc-500 hover:bg-zinc-50 transition-colors"
           >
             取消
           </button>
           <button 
             type="submit"
             className="px-8 py-4 rounded-full text-xs font-semibold tracking-[0.15em] uppercase bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20"
           >
             保存修改
           </button>
        </div>
      </form>
    </div>
  );
}