"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import gsap from "gsap";

// Discriminated Unions & Type Guards
type BaseTask = {
  id: string;
  title: string;
};

export type TodoTask = BaseTask & { status: "todo" };
export type InProgressTask = BaseTask & { status: "in-progress"; startedAt: number };
export type DoneTask = BaseTask & { status: "done"; completedAt: number };

export type KanbanTask = TodoTask | InProgressTask | DoneTask;

// Type Guard
export const isDoneTask = (task: KanbanTask): task is DoneTask => {
  return task.status === "done";
};

const initialTasks: KanbanTask[] = [
  { id: "t1", title: "定义品牌视觉结构", status: "todo" },
  { id: "t2", title: "校验对比度可读性", status: "todo" },
  { id: "t3", title: "实现登录鉴权流程", status: "in-progress", startedAt: Date.now() },
  { id: "t4", title: "微调标题排印系统", status: "done", completedAt: Date.now() - 86400000 },
];

function SortableItem({ task }: { task: KanbanTask }) {
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
      className={`touch-none select-none p-5 mb-3 rounded-2xl border bg-white/90 backdrop-blur-md transition-all duration-300 ring-1 ring-white/60
        ${
          isDragging
            ? "border-zinc-400 shadow-xl shadow-zinc-200/50 opacity-95 z-20"
            : "border-zinc-200/60 hover:border-zinc-300 hover:shadow-lg"
        }
      `}
    >
      <div className="flex justify-between items-start gap-4">
         <span className="text-zinc-700 font-light leading-relaxed">{task.title}</span>
         {isDoneTask(task) && (
           <span className="shrink-0 w-2 h-2 mt-2 rounded-full bg-zinc-800" />
         )}
      </div>
      <div className="mt-4 flex items-center gap-2">
         <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-zinc-400 bg-zinc-100/50 px-2 py-1 rounded-sm">
           {task.status === "todo" ? "待办" : task.status === "in-progress" ? "进行中" : "已完成"}
         </span>
         {task.status === "in-progress" && (
           <span className="text-[10px] text-zinc-300 font-mono">处理中</span>
         )}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, tasks]
  );

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
    setActiveTaskId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
  };

  const columns: Record<string, KanbanTask["status"]> = {
    "待处理": "todo",
    "进行中": "in-progress",
    "已完成": "done",
  };

  return (
    <div className="flex flex-col gap-12 max-w-full mx-auto w-full pt-8 min-h-screen animate-in fade-in duration-1000 lg:pr-16">
      <header className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extralight tracking-tight text-zinc-900">
              看板
            </h1>
            <p className="text-zinc-500 font-light text-lg mt-4">
              拖拽即可调整优先级，让状态流转更直观。
            </p>
          </div>
          <Link
            href="/tasks/new"
            className="hidden sm:flex text-xs font-semibold tracking-[0.15em] uppercase px-6 py-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            + 新建任务
          </Link>
        </div>
      </header>

      {/* Dnd Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-24">
          {Object.entries(columns).map(([columnName, status]) => {
             const columnTasks = tasks.filter((t) => t.status === status);

             return (
               <div key={columnName} className="flex flex-col">
                 <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-6 flex justify-between items-center pb-4 border-b border-zinc-100 border-dashed">
                   {columnName}
                   <span className="text-zinc-300 font-mono bg-zinc-50 px-2 py-0.5 rounded-sm">{columnTasks.length}</span>
                 </h3>
                 <div className="flex-1 rounded-3xl p-4 min-h-[50vh] border border-zinc-200/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.85),rgba(244,244,245,0.6))] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      {columnTasks.map((task) => (
                        <SortableItem key={task.id} task={task} />
                      ))}
                    </SortableContext>
                 </div>
               </div>
             );
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