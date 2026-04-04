"use client";

import React, { useState } from "react";

// Base Settings Type
type SystemSettings = {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    telemetry: boolean;
    shareData: boolean;
  };
  dangerZone: {
    deleteAccount: boolean;
  };
};

// Advanced Utility: DeepPartial
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Advanced Utility: Omit
export type UserSettings = Omit<SystemSettings, "dangerZone">;

const defaultSettings: UserSettings = {
  theme: "system",
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [dirty, setDirty] = useState(false);

  // Using DeepPartial to allow partial updates of nested objects
  const updateSettings = (updates: DeepPartial<UserSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev };

      if (updates.theme !== undefined) {
        merged.theme = updates.theme as UserSettings["theme"];
      }

      if (updates.notifications) {
        merged.notifications = {
          ...prev.notifications,
          ...updates.notifications,
        } as UserSettings["notifications"];
      }

      if (updates.privacy) {
        merged.privacy = {
          ...prev.privacy,
          ...updates.privacy,
        } as UserSettings["privacy"];
      }

      return merged;
    });
    setDirty(true);
  };

  const handleSave = () => {
    setDirty(false);
    alert("Settings synchronized.");
  };

  return (
    <div className="flex flex-col gap-12 max-w-3xl w-full pt-8 pb-32 min-h-screen animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-end justify-between border-b border-zinc-200/50 pb-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extralight tracking-tight text-zinc-900">
            Preferences
          </h1>
          <p className="text-zinc-500 font-light text-lg mt-4">
            Curate your experience. Tune your environment.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty}
          className={\`px-6 py-3 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase transition-all duration-300 
            \${dirty ? "bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 hover:bg-black scale-105" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}\`}
        >
          Save Changes
        </button>
      </header>

      <section className="space-y-16">
        {/* Theme Settings */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-800">Interface</h2>
            <p className="text-sm font-light text-zinc-500">Configure visual appearance.</p>
          </div>
          <div className="flex gap-4 p-2 bg-zinc-100/50 rounded-2xl border border-zinc-100">
            {["light", "dark", "system"].map((themeOpt) => (
              <button
                key={themeOpt}
                onClick={() => updateSettings({ theme: themeOpt as any })}
                className={\`flex-1 py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-[0.1em] transition-all duration-300
                  \${settings.theme === themeOpt 
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/50" 
                    : "text-zinc-400 hover:text-zinc-800"}\`}
              >
                {themeOpt}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-800">Alerts</h2>
            <p className="text-sm font-light text-zinc-500">Manage communication channels.</p>
          </div>
          <div className="space-y-1 border border-zinc-100 bg-white/40 backdrop-blur-md rounded-3xl p-2">
            {(Object.keys(settings.notifications) as Array<keyof UserSettings["notifications"]>).map((key) => (
              <label key={key} className="flex items-center justify-between p-4 hover:bg-zinc-50/50 rounded-2xl cursor-pointer group transition-colors">
                <span className="text-sm font-light text-zinc-700 capitalize group-hover:text-zinc-900">{key} Notifications</span>
                <div 
                  className={\`w-12 h-6 rounded-full p-1 transition-colors duration-500 \${settings.notifications[key] ? "bg-zinc-900" : "bg-zinc-200"}\`}
                >
                  <div 
                    className={\`w-4 h-4 bg-white rounded-full transition-transform duration-500 shadow-sm \${settings.notifications[key] ? "translate-x-6" : "translate-x-0"}\`} 
                  />
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={settings.notifications[key]}
                  onChange={(e) => updateSettings({ notifications: { [key]: e.target.checked } })}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-800">Privacy</h2>
            <p className="text-sm font-light text-zinc-500">Control data telemetry.</p>
          </div>
          <div className="space-y-1 border border-zinc-100 bg-white/40 backdrop-blur-md rounded-3xl p-2">
            <label className="flex items-center justify-between p-4 hover:bg-zinc-50/50 rounded-2xl cursor-pointer group transition-colors border-b border-zinc-50">
              <span className="text-sm font-light text-zinc-700 group-hover:text-zinc-900">Allow Telemetry</span>
              <div className={\`w-12 h-6 rounded-full p-1 transition-colors duration-500 \${settings.privacy.telemetry ? "bg-zinc-900" : "bg-zinc-200"}\`}>
                <div className={\`w-4 h-4 bg-white rounded-full transition-transform duration-500 shadow-sm \${settings.privacy.telemetry ? "translate-x-6" : "translate-x-0"}\`} />
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={settings.privacy.telemetry}
                onChange={(e) => updateSettings({ privacy: { telemetry: e.target.checked } })}
              />
            </label>
            <label className="flex items-center justify-between p-4 hover:bg-zinc-50/50 rounded-2xl cursor-pointer group transition-colors">
              <span className="text-sm font-light text-zinc-700 group-hover:text-zinc-900">Share Anonymous Data</span>
              <div className={\`w-12 h-6 rounded-full p-1 transition-colors duration-500 \${settings.privacy.shareData ? "bg-zinc-900" : "bg-zinc-200"}\`}>
                <div className={\`w-4 h-4 bg-white rounded-full transition-transform duration-500 shadow-sm \${settings.privacy.shareData ? "translate-x-6" : "translate-x-0"}\`} />
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={settings.privacy.shareData}
                onChange={(e) => updateSettings({ privacy: { shareData: e.target.checked } })}
              />
            </label>
          </div>
        </div>

      </section>

      {/* Excluded Danger Zone visually represented as not accessible in UserSettings */}
      <section className="mt-24 pt-8 border-t border-zinc-200 border-dashed opacity-50 grayscale select-none pointer-events-none hidden">
         <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-red-800">Danger Zone</h2>
         <p className="text-sm">Account deletion is handled via advanced admin panel, omitted from UserSettings.</p>
      </section>
    </div>
  );
}