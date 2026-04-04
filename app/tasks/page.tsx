"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import gsap from "gsap";
import { useAppStore, type Task, type TaskStatus } from "@/lib/app-store";

const columns: Array<{ label: string; status: TaskStatus }> = [
  { label: "待处理", status: "todo" },
  { label: "进行中", status: "in-progress" },
  { label: "已完成", status: "done" },
];

const statusLabelMap: Record<TaskStatus, string> = {
  todo: "待办",
  "in-progress": "进行中",
  done: "已完成",
};

const priorityLabelMap: Record<Task["priority"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};

const formatClock = (date: Date) =>
  new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

const getWorkHint = (tasks: Task[], deletedTasks: Task[], hour: number) => {
  const highPriorityTodo = tasks.find((task) => task.status === "todo" && task.priority === "high");
  const activeTask = tasks.find((task) => task.status === "in-progress");
  const deletedCount = deletedTasks.length;

  if (deletedCount > 0 && hour >= 18) {
    return {
      label: "收尾阶段",
      text: `先检查回收站，确认是否要永久删除 ${deletedCount} 个任务。`,
    };
  }

  if (hour < 11 && highPriorityTodo) {
    return {
      label: "清晨启动",
      text: `优先处理「${highPriorityTodo.title}」，让今天先进入正轨。`,
    };
  }

  if (hour < 17 && activeTask) {
    return {
      label: "推进中",
      text: `继续推进「${activeTask.title}」，把这一条先做到接近完成。`,
    };
  }

  return {
    label: "整理节奏",
    text: "整理待办、移动进度中的任务，并把高优先级事项放在最上面。",
  };
};

const isStatus = (value: string): value is TaskStatus => {
  return value === "todo" || value === "in-progress" || value === "done";
};

function SortableItem({ task }: { task: Task }) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    transition: {
      duration: 220,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  });

  useEffect(() => {
    if (!itemRef.current) {
      return;
    }

    gsap.to(itemRef.current, {
      scale: isDragging ? 1.03 : 1,
      boxShadow: isDragging
        ? "0 24px 40px rgba(24,24,27,0.15)"
        : "0 10px 20px rgba(24,24,27,0.06)",
      duration: 0.22,
      ease: "power3.out",
    });
  }, [isDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        itemRef.current = node;
      }}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none select-none p-5 mb-3 rounded-2xl border bg-white/90 backdrop-blur-md transition-all duration-300 ring-1 ring-white/60 ${
        isDragging ? "border-zinc-400 shadow-xl shadow-zinc-200/50 opacity-95 z-20" : "border-zinc-200/60 hover:border-zinc-300 hover:shadow-lg"
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <span className="block text-zinc-700 font-light leading-relaxed">{task.title}</span>
          <span className="mt-2 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            {priorityLabelMap[task.priority]}
          </span>
        </div>
        {task.status === "done" ? <span className="shrink-0 w-2 h-2 mt-2 rounded-full bg-zinc-800" /> : null}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-zinc-400 bg-zinc-100/50 px-2 py-1 rounded-sm">
          {statusLabelMap[task.status]}
        </span>
        {task.status === "in-progress" ? <span className="text-[10px] text-zinc-300 font-mono">处理中</span> : null}
      </div>
    </div>
  );
}

function TaskColumn({ label, status, tasks }: { label: string; status: TaskStatus; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col">
      <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-6 flex justify-between items-center pb-4 border-b border-zinc-100 border-dashed">
        {label}
        <span className="text-zinc-300 font-mono bg-zinc-50 px-2 py-0.5 rounded-sm">{tasks.length}</span>
      </h3>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-3xl p-4 min-h-[50vh] max-h-[62vh] overflow-y-auto border transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ${
          isOver
            ? "border-zinc-400 bg-white/95"
            : "border-zinc-200/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.85),rgba(244,244,245,0.6))]"
        }`}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex h-full min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-zinc-200/70 text-[10px] uppercase tracking-[0.2em] text-zinc-300">
              拖到这里
            </div>
          ) : null}
          {tasks.map((task) => (
            <SortableItem key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function TrashBin() {
  const deletedTasks = useAppStore((state) => state.deletedTasks);
  const restoreTaskFromTrash = useAppStore((state) => state.restoreTaskFromTrash);
  const permanentlyDeleteTask = useAppStore((state) => state.permanentlyDeleteTask);
  const { setNodeRef, isOver } = useDroppable({ id: "trash" });

  return (
    <section className="mt-6">
      <div
        ref={setNodeRef}
        className={`rounded-[2rem] border p-5 sm:p-6 transition-all duration-300 shadow-[0_24px_60px_rgba(24,24,27,0.08)] ${
          isOver
            ? "border-rose-400 bg-rose-50/90"
            : "border-zinc-200/70 bg-white/75 backdrop-blur-xl"
        }`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 ${isOver ? "bg-rose-600 shadow-rose-300/50" : "bg-zinc-900 shadow-zinc-900/20"}`}>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={`h-5 w-5 transition-transform duration-300 ${isOver ? "rotate-3 scale-105" : ""}`}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.25 5.5h7.5m-8.5 0 1-1.5h7.5l1 1.5M6 7h12l-.9 11a2 2 0 0 1-2 1.85H8.9a2 2 0 0 1-2-1.85L6 7Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 10.25v6.25M14 10.25v6.25" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-[0.18em] uppercase text-zinc-800">回收站</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  拖进来会先暂存，确认后再永久删除。误删时可以先恢复。
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Tip: 回收站里的任务不会自动消失，避免误删。
            </div>
          </div>
          <div className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            {deletedTasks.length} 项
          </div>
        </div>

        <div className={`mt-5 rounded-[1.5rem] border border-dashed p-4 ${isOver ? "border-rose-400 bg-rose-50/80" : "border-zinc-200 bg-white/60"}`}>
          {deletedTasks.length === 0 ? (
            <div className="flex min-h-[8rem] items-center justify-center text-center text-sm text-zinc-400">
              把任务拖到这里进行暂存删除。
            </div>
          ) : (
            <div className="space-y-3 max-h-[18rem] overflow-y-auto pr-1">
              {deletedTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-zinc-200 bg-white/85 px-4 py-3 shadow-sm shadow-zinc-200/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-light text-zinc-700">{task.title}</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                        <span className="rounded-full bg-zinc-100 px-2 py-1">{statusLabelMap[task.status]}</span>
                        <span className="rounded-full bg-zinc-100 px-2 py-1">{priorityLabelMap[task.priority]}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => restoreTaskFromTrash(task.id)}
                        className="rounded-full border border-zinc-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 transition-colors"
                      >
                        恢复
                      </button>
                      <button
                        type="button"
                        onClick={() => permanentlyDeleteTask(task.id)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        永久删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function KanbanPage() {
  const tasks = useAppStore((state) => state.tasks);
  const deletedTasks = useAppStore((state) => state.deletedTasks);
  const activeTaskId = useAppStore((state) => state.drag.activeTaskId);
  const startDragging = useAppStore((state) => state.startDragging);
  const endDragging = useAppStore((state) => state.endDragging);
  const moveTaskToTask = useAppStore((state) => state.moveTaskToTask);
  const moveTaskToStatus = useAppStore((state) => state.moveTaskToStatus);
  const moveTaskToTrash = useAppStore((state) => state.moveTaskToTrash);

  const [now, setNow] = useState(() => new Date());

  const activeTask = useMemo(() => tasks.find((task) => task.id === activeTaskId) ?? null, [activeTaskId, tasks]);
  const workHint = useMemo(() => getWorkHint(tasks, deletedTasks, now.getHours()), [deletedTasks, now, tasks]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 130,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    startDragging(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    endDragging();

    if (!over || active.id === over.id) {
      return;
    }

    const overId = String(over.id);

    if (overId === "trash") {
      moveTaskToTrash(String(active.id));
      return;
    }

    if (isStatus(overId)) {
      moveTaskToStatus(String(active.id), overId);
      return;
    }

    moveTaskToTask(String(active.id), overId);
  };

  const handleDragCancel = () => {
    endDragging();
  };

  return (
    <div className="page-kanban-bg flex flex-col gap-12 max-w-full mx-auto w-full pt-8 min-h-screen animate-in fade-in duration-1000 lg:pr-16">
      <header className="space-y-6">
        <div className="rounded-[2rem] border border-white/65 bg-white/55 px-6 py-5 backdrop-blur-2xl shadow-[0_24px_80px_rgba(24,24,27,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                实时节奏
              </div>
              <h1 className="text-4xl lg:text-5xl font-extralight tracking-tight text-zinc-900">看板</h1>
              <p className="max-w-2xl text-zinc-500 font-light text-lg">
                拖拽即可调整优先级，任务会在列之间自然流动，回收站则保留一个可逆的暂存出口。
              </p>
            </div>
            <Link
              href="/tasks/new"
              className="inline-flex w-fit items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-xs font-semibold tracking-[0.15em] uppercase text-white transition-colors hover:bg-zinc-800"
            >
              + 新建任务
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">当前时间</div>
              <div className="mt-2 text-2xl font-light tabular-nums text-zinc-900">{formatClock(now)}</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 md:col-span-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">现在应该做什么</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  {workHint.label}
                </span>
                <p className="text-sm text-zinc-600">{workHint.text}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-24">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.status);

            return <TaskColumn key={column.status} label={column.label} status={column.status} tasks={columnTasks} />;
          })}
        </div>

        <TrashBin />

        <DragOverlay>
          {activeTask ? (
            <div className="p-5 rounded-2xl border border-zinc-300 bg-white/95 backdrop-blur-md ring-1 ring-white/90 shadow-[0_30px_55px_rgba(24,24,27,0.22)]">
              <div className="text-zinc-700 font-light leading-relaxed">{activeTask.title}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}