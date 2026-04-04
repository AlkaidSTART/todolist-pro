"use client";

import React, { useEffect, useMemo, useRef } from "react";
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
        className={`flex-1 rounded-3xl p-4 min-h-[50vh] border transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ${
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

export default function KanbanPage() {
  const tasks = useAppStore((state) => state.tasks);
  const activeTaskId = useAppStore((state) => state.drag.activeTaskId);
  const startDragging = useAppStore((state) => state.startDragging);
  const endDragging = useAppStore((state) => state.endDragging);
  const moveTaskToTask = useAppStore((state) => state.moveTaskToTask);
  const moveTaskToStatus = useAppStore((state) => state.moveTaskToStatus);

  const activeTask = useMemo(() => tasks.find((task) => task.id === activeTaskId) ?? null, [activeTaskId, tasks]);

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
    <div className="flex flex-col gap-12 max-w-full mx-auto w-full pt-8 min-h-screen animate-in fade-in duration-1000 lg:pr-16">
      <header className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extralight tracking-tight text-zinc-900">看板</h1>
            <p className="text-zinc-500 font-light text-lg mt-4">拖拽即可调整优先级，让状态流转更直观。</p>
          </div>
          <Link
            href="/tasks/new"
            className="hidden sm:flex text-xs font-semibold tracking-[0.15em] uppercase px-6 py-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            + 新建任务
          </Link>
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