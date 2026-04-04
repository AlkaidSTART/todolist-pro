import React from "react";

// Index Signature: Defining an object structure where keys are dynamic (categories).
type CategoryStats = {
  [categoryName: string]: {
    total: number;
    completed: number;
  };
};

type Task = {
  id: string;
  title: string;
  category: string;
  completed: boolean;
};

// Mock data
const mockTasks: Task[] = [
  { id: "1", title: "Review Q3 Roadmaps", category: "Work", completed: true },
  { id: "2", title: "Design System Tokens", category: "Work", completed: false },
  { id: "3", title: "Weekly Grocery Run", category: "Personal", completed: true },
  { id: "4", title: "Gym Session", category: "Health", completed: false },
  { id: "5", title: "Read Clean Architecture", category: "Personal", completed: false },
];

export default function OverviewPage() {
  // Array Processing: using '.reduce' to aggregate task statistics dynamically.
  const stats: CategoryStats = mockTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = { total: 0, completed: 0 };
    }
    acc[task.category].total += 1;
    if (task.completed) {
      acc[task.category].completed += 1;
    }
    return acc;
  }, {} as CategoryStats);

  const categories = Object.keys(stats);

  return (
    <div className="flex flex-col gap-12 sm:gap-16 lg:pr-16 max-w-4xl mx-auto w-full pt-8 min-h-screen animate-in fade-in duration-1000">
      <header className="space-y-4">
        <h1 className="text-4xl lg:text-5xl font-extralight tracking-tight text-zinc-900">
          Overview
        </h1>
        <p className="text-zinc-500 font-light text-lg">
          A high-level glance at your productivity landscape.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const { total, completed } = stats[category];
          const progress = Math.round((completed / total) * 100);

          return (
            <div
              key={category}
              className="p-8 border border-zinc-200/60 bg-white/40 ring-1 ring-zinc-100 backdrop-blur-md hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-700 ease-out rounded-3xl group flex flex-col justify-between"
            >
              <h2 className="text-lg font-medium tracking-wide text-zinc-800 uppercase text-xs mb-8">
                {category}
              </h2>
              <div>
                <div className="flex items-end justify-between mb-4">
                  <span className="text-4xl font-light tabular-nums text-zinc-800">
                    {progress}%
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-[0.2em] mb-1">
                    {completed} / {total}
                  </span>
                </div>
                <div className="h-[2px] bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-black"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Array Processing: Filtering and Mapping */}
      <section className="mt-12">
        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-6">
          Pending Highlights
        </h3>
        <ul className="flex flex-col gap-1">
          {mockTasks
            .filter((t) => !t.completed)
            .map((task) => (
              <li
                 key={task.id}
                 className="flex items-center justify-between p-5 rounded-2xl border border-transparent hover:border-zinc-200/60 hover:bg-white/60 transition-all duration-300 group cursor-default"
              >
                <span className="text-zinc-600 font-light group-hover:text-zinc-900 transition-colors">
                  {task.title}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.1em] px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                  {task.category}
                </span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
