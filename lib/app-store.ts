"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type ThemeMode = "light" | "dark" | "system";

export type ThemePaletteName =
  | "graphite"
  | "teal"
  | "amber"
  | "coral"
  | "sky"
  | "emerald"
  | "rose"
  | "sand"
  | "violet";

export interface TaskDraft {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

export interface Task extends TaskDraft {
  id: string;
  status: TaskStatus;
  startedAt?: number;
  completedAt?: number;
  deletedAt?: number;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface PrivacySettings {
  telemetry: boolean;
  shareData: boolean;
}

export interface UserSettings {
  theme: ThemeMode;
  palette: ThemePaletteName;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface ThemePaletteTokens {
  accent: string;
  accentSoft: string;
  bgStart: string;
  bgEnd: string;
  surface: string;
}

export type StoreUpdater<T extends object> = Partial<T> | ((prev: T) => Partial<T>);

type SettingsObjectKey = {
  [K in keyof UserSettings]-?: UserSettings[K] extends object ? K : never;
}[keyof UserSettings];

export const themePaletteNames = [
  "graphite",
  "teal",
  "amber",
  "coral",
  "sky",
  "emerald",
  "rose",
  "sand",
  "violet",
] as const;

export const themePalettes: Record<ThemePaletteName, ThemePaletteTokens> = {
  graphite: {
    accent: "#18181b",
    accentSoft: "#52525b",
    bgStart: "#fafafa",
    bgEnd: "#e4e4e7",
    surface: "#ffffff",
  },
  teal: {
    accent: "#0f766e",
    accentSoft: "#14b8a6",
    bgStart: "#f0fdfa",
    bgEnd: "#ccfbf1",
    surface: "#f8fffe",
  },
  amber: {
    accent: "#b45309",
    accentSoft: "#f59e0b",
    bgStart: "#fffbeb",
    bgEnd: "#fde68a",
    surface: "#fffdf7",
  },
  coral: {
    accent: "#c2410c",
    accentSoft: "#fb7185",
    bgStart: "#fff7ed",
    bgEnd: "#fecaca",
    surface: "#fffdfa",
  },
  sky: {
    accent: "#0369a1",
    accentSoft: "#38bdf8",
    bgStart: "#f0f9ff",
    bgEnd: "#bae6fd",
    surface: "#fbfdff",
  },
  emerald: {
    accent: "#047857",
    accentSoft: "#34d399",
    bgStart: "#ecfdf5",
    bgEnd: "#bbf7d0",
    surface: "#f8fffb",
  },
  rose: {
    accent: "#be123c",
    accentSoft: "#f43f5e",
    bgStart: "#fff1f2",
    bgEnd: "#fecdd3",
    surface: "#fffafb",
  },
  sand: {
    accent: "#78350f",
    accentSoft: "#d6a15c",
    bgStart: "#fef7ed",
    bgEnd: "#f5e7d3",
    surface: "#fffdf9",
  },
  violet: {
    accent: "#4c1d95",
    accentSoft: "#8b5cf6",
    bgStart: "#f5f3ff",
    bgEnd: "#ddd6fe",
    surface: "#fcfbff",
  },
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `task-${Math.random().toString(36).slice(2, 10)}`;

const createTaskDraft = (): TaskDraft => ({
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
});

const initialTasks: Task[] = [
  {
    id: "t1",
    title: "定义品牌视觉结构",
    description: "",
    priority: "medium",
    dueDate: "",
    status: "todo",
  },
  {
    id: "t2",
    title: "校验对比度可读性",
    description: "",
    priority: "high",
    dueDate: "",
    status: "todo",
  },
  {
    id: "t3",
    title: "实现登录鉴权流程",
    description: "",
    priority: "high",
    dueDate: "",
    status: "in-progress",
    startedAt: Date.now(),
  },
  {
    id: "t4",
    title: "微调标题排印系统",
    description: "",
    priority: "low",
    dueDate: "",
    status: "done",
    completedAt: Date.now() - 86400000,
  },
];

const defaultSettings: UserSettings = {
  theme: "system",
  palette: "graphite",
  notifications: {
    email: true,
    push: false,
    sms: false,
  },
  privacy: {
    telemetry: true,
    shareData: false,
  },
};

export interface DragState {
  activeTaskId: string | null;
}

export interface AppStateData {
  tasks: Task[];
  deletedTasks: Task[];
  taskDraft: TaskDraft;
  settings: UserSettings;
  drag: DragState;
}

export interface AppStateActions {
  setTheme: (theme: ThemeMode) => void;
  setPalette: (palette: ThemePaletteName) => void;
  setNotifications: (updates: StoreUpdater<NotificationSettings>) => void;
  setPrivacy: (updates: StoreUpdater<PrivacySettings>) => void;
  setTaskDraft: (updates: StoreUpdater<TaskDraft>) => void;
  loadTaskDraft: (taskId?: string) => void;
  resetTaskDraft: () => void;
  createTask: () => string;
  updateTask: (taskId: string) => void;
  moveTaskToTask: (activeTaskId: string, overTaskId: string) => void;
  moveTaskToStatus: (activeTaskId: string, status: TaskStatus) => void;
  moveTaskToTrash: (taskId: string) => void;
  restoreTaskFromTrash: (taskId: string) => void;
  permanentlyDeleteTask: (taskId: string) => void;
  startDragging: (taskId: string) => void;
  endDragging: () => void;
}

export type AppState = AppStateData & AppStateActions;

export type PersistedAppState = Pick<AppStateData, "tasks" | "deletedTasks" | "settings">;

export type AppSelector<TSelected> = (state: AppState) => TSelected;

export const createAppSelector = <TSelected>(selector: AppSelector<TSelected>) => selector;

const resolveUpdater = <T extends object>(prev: T, updates: StoreUpdater<T>): T => ({
  ...prev,
  ...(typeof updates === "function" ? updates(prev) : updates),
});

const updateSettingsSlice = <K extends SettingsObjectKey>(
  state: AppStateData,
  key: K,
  updates: StoreUpdater<UserSettings[K]>
): UserSettings => ({
  ...state.settings,
  [key]: resolveUpdater(state.settings[key], updates),
});

const partializeState = (state: AppState): PersistedAppState => ({
  tasks: state.tasks,
  deletedTasks: state.deletedTasks,
  settings: state.settings,
});

const applyStatusTimestamps = (task: Task, status: TaskStatus): Task => {
  if (status === "in-progress") {
    return {
      ...task,
      status,
      startedAt: task.startedAt ?? Date.now(),
      completedAt: undefined,
    };
  }

  if (status === "done") {
    return {
      ...task,
      status,
      completedAt: Date.now(),
    };
  }

  return {
    ...task,
    status,
    startedAt: undefined,
    completedAt: undefined,
  };
};

const insertTaskByStatus = (tasks: Task[], task: Task): Task[] => {
  const nextTasks = tasks.filter((item) => item.id !== task.id);

  let insertIndex = nextTasks.length;
  for (let index = nextTasks.length - 1; index >= 0; index -= 1) {
    if (nextTasks[index].status === task.status) {
      insertIndex = index + 1;
      break;
    }
  }

  nextTasks.splice(insertIndex, 0, task);
  return nextTasks;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      deletedTasks: [],
      taskDraft: createTaskDraft(),
      settings: defaultSettings,
      drag: { activeTaskId: null },
      setTheme: (theme) =>
        set((state) => ({
          settings: {
            ...state.settings,
            theme,
          },
        })),
      setPalette: (palette) =>
        set((state) => ({
          settings: {
            ...state.settings,
            palette,
          },
        })),
      setNotifications: (updates) =>
        set((state) => ({
          settings: updateSettingsSlice(state, "notifications", updates),
        })),
      setPrivacy: (updates) =>
        set((state) => ({
          settings: updateSettingsSlice(state, "privacy", updates),
        })),
      setTaskDraft: (updates) =>
        set((state) => ({
          taskDraft: resolveUpdater(state.taskDraft, updates),
        })),
      loadTaskDraft: (taskId) => {
        if (!taskId) {
          set({ taskDraft: createTaskDraft() });
          return;
        }

        const task = get().tasks.find((item) => item.id === taskId);
        set({
          taskDraft: task
            ? {
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate,
              }
            : createTaskDraft(),
        });
      },
      resetTaskDraft: () => set({ taskDraft: createTaskDraft() }),
      createTask: () => {
        const draft = get().taskDraft;
        const id = createId();

        set((state) => ({
          tasks: [
            {
              id,
              ...draft,
              status: "todo",
            },
            ...state.tasks,
          ],
          taskDraft: createTaskDraft(),
        }));

        return id;
      },
      updateTask: (taskId) => {
        const draft = get().taskDraft;
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  ...draft,
                }
              : task
          ),
        }));
      },
      moveTaskToTask: (activeTaskId, overTaskId) =>
        set((state) => {
          const activeTask = state.tasks.find((task) => task.id === activeTaskId);
          const overIndex = state.tasks.findIndex((task) => task.id === overTaskId);

          if (!activeTask || overIndex === -1) {
            return state;
          }

          const nextTasks = state.tasks.filter((task) => task.id !== activeTaskId);
          const targetTask = state.tasks[overIndex];
          const movedTask = applyStatusTimestamps(activeTask, targetTask.status);
          const insertIndex = nextTasks.findIndex((task) => task.id === overTaskId);

          nextTasks.splice(insertIndex, 0, movedTask);

          return {
            tasks: nextTasks,
          };
        }),
      moveTaskToStatus: (activeTaskId, status) =>
        set((state) => {
          const activeTask = state.tasks.find((task) => task.id === activeTaskId);

          if (!activeTask) {
            return state;
          }

          const movedTask = applyStatusTimestamps(activeTask, status);

          return {
            tasks: insertTaskByStatus(state.tasks, movedTask),
          };
        }),
      moveTaskToTrash: (taskId) =>
        set((state) => {
          const task = state.tasks.find((item) => item.id === taskId);

          if (!task) {
            return state;
          }

          const deletedTask = {
            ...task,
            deletedAt: Date.now(),
          };

          return {
            tasks: state.tasks.filter((item) => item.id !== taskId),
            deletedTasks: [deletedTask, ...state.deletedTasks.filter((item) => item.id !== taskId)],
          };
        }),
      restoreTaskFromTrash: (taskId) =>
        set((state) => {
          const deletedTask = state.deletedTasks.find((item) => item.id === taskId);

          if (!deletedTask) {
            return state;
          }

          const restoredTask = {
            ...deletedTask,
            deletedAt: undefined,
          };

          return {
            tasks: insertTaskByStatus(state.tasks, restoredTask),
            deletedTasks: state.deletedTasks.filter((item) => item.id !== taskId),
          };
        }),
      permanentlyDeleteTask: (taskId) =>
        set((state) => ({
          deletedTasks: state.deletedTasks.filter((item) => item.id !== taskId),
        })),
      startDragging: (taskId) => set({ drag: { activeTaskId: taskId } }),
      endDragging: () => set({ drag: { activeTaskId: null } }),
    }),
    {
      name: "todolist-pro-state",
      storage: createJSONStorage(() => localStorage),
      partialize: partializeState,
    }
  )
);

export { createTaskDraft, defaultSettings };