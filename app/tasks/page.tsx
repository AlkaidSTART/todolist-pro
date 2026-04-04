"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-5 mb-3 rounded-2xl border bg-white/60 backdrop-blur-md transition-all duration-300 
        ${
          isDragging
            ? "border-zinc-400 shadow-xl shadow-zinc-200/50 opacity-90 scale-105 z-10"
            : "border-zinc-200/50 hover:border-zinc-300 hover:shadow-lg"
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-24">
          {Object.entries(columns).map(([columnName, status]) => {
             const columnTasks = tasks.filter((t) => t.status === status);

             return (
               <div key={columnName} className="flex flex-col">
                 <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-6 flex justify-between items-center pb-4 border-b border-zinc-100 border-dashed">
                   {columnName}
                   <span className="text-zinc-300 font-mono bg-zinc-50 px-2 py-0.5 rounded-sm">{columnTasks.length}</span>
                 </h3>
                 <div className="flex-1 bg-zinc-50/30 rounded-3xl p-4 min-h-[50vh] border border-zinc-100/50">
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
      </DndContext>
    </div>
  );
}