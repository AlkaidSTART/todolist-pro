"use client";

import React, { useMemo } from "react";
import { useAppStore, type TaskStatus } from "@/lib/app-store";

const statusMeta: Record<TaskStatus, { label: string; tone: string }> = {
  todo: { label: "待处理", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  "in-progress": { label: "进行中", tone: "bg-sky-50 text-sky-700 border-sky-200" },
  done: { label: "已完成", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const priorityLabels = {
  low: "低",
  medium: "中",
  high: "高",
} as const;

export default function OverviewPage() {
  const tasks = useAppStore((state) => state.tasks);

  const stats = useMemo(
    () =>
      (Object.keys(statusMeta) as TaskStatus[]).map((status) => {
        const list = tasks.filter((task) => task.status === status);
        return {
          status,
          label: statusMeta[status].label,
          tone: statusMeta[status].tone,
          count: list.length,
          list: list.slice(0, 3),
        };
      }),
    [tasks]
  );

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((task) => task.status === "done").length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const focusTask = tasks.find((task) => task.status !== "done") ?? tasks[0];

  return (
    <div className="relative isolate flex flex-col gap-10 lg:gap-12 lg:pr-16 max-w-5xl mx-auto w-full pt-8 min-h-screen animate-in fade-in duration-1000">
      <div className="page-background page-background--overview" aria-hidden="true" />
      <header className="rounded-[2rem] border border-zinc-200/70 bg-[linear-gradient(125deg,rgba(255,255,255,0.92),rgba(244,244,245,0.62))] px-6 py-6 shadow-[0_24px_80px_rgba(24,24,27,0.08)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              总览面板
            </div>
            <h1 className="text-4xl lg:text-5xl font-extralight tracking-tight text-zinc-900">总览</h1>
            <p className="max-w-2xl text-zinc-500 font-light text-lg">
              把分散的任务收拢到一个沉浸式画布里，进度、状态和当前焦点都在同一个视野内。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[26rem]">
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">总任务</div>
              <div className="mt-2 text-2xl font-light tabular-nums text-zinc-900">{totalTasks}</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">完成率</div>
              <div className="mt-2 text-2xl font-light tabular-nums text-zinc-900">{progress}%</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">进行中</div>
              <div className="mt-2 text-2xl font-light tabular-nums text-zinc-900">
                {stats.find((item) => item.status === "in-progress")?.count ?? 0}
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">待处理</div>
              <div className="mt-2 text-2xl font-light tabular-nums text-zinc-900">
                {stats.find((item) => item.status === "todo")?.count ?? 0}
              </div>
            </div>
          </div>
        </div>

        {focusTask ? (
          <div className="mt-6 rounded-3xl border-l-4 border-l-zinc-800 border-zinc-200 bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(255,255,255,0.58))] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">当前焦点</div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                {statusMeta[focusTask.status].label}
              </span>
              <span className="text-zinc-700 font-light">{focusTask.title}</span>
            </div>
          </div>
        ) : null}
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {stats.map((item) => (
          <article
            key={item.status}
            className="rounded-[1.6rem] border border-zinc-200 bg-[linear-gradient(160deg,rgba(255,255,255,0.94),rgba(250,250,251,0.76))] p-6 shadow-[0_18px_50px_rgba(24,24,27,0.05)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${item.tone}`}>
                  {item.label}
                </div>
                <div className="mt-4 text-4xl font-light tabular-nums text-zinc-900">{item.count}</div>
              </div>
              <div className="text-right text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                <div>任务</div>
                <div className="mt-1">{item.label}</div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {item.list.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-4 text-sm text-zinc-400">
                  当前没有任务。
                </div>
              ) : (
                item.list.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-3 text-sm text-zinc-700"
                  >
                    {task.title}
                  </div>
                ))
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[1.8rem] border border-zinc-200 bg-[linear-gradient(160deg,rgba(255,255,255,0.92),rgba(246,246,247,0.74))] p-6">
        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-6">待办聚焦</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tasks
            .filter((task) => task.status !== "done")
            .slice(0, 6)
            .map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-zinc-700 font-light">{task.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    <span>{statusMeta[task.status].label}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span>{priorityLabels[task.priority]}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  聚焦
                </span>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
