"use client";

import { useAppStore, themePaletteNames, themePalettes } from "@/lib/app-store";

export default function SettingsPage() {
  const settings = useAppStore((state) => state.settings);
  const setTheme = useAppStore((state) => state.setTheme);
  const setPalette = useAppStore((state) => state.setPalette);
  const setNotifications = useAppStore((state) => state.setNotifications);
  const setPrivacy = useAppStore((state) => state.setPrivacy);

  return (
    <div className="flex flex-col gap-12 max-w-3xl w-full pt-8 pb-32 min-h-screen animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-end justify-between border-b border-zinc-200/50 pb-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extralight tracking-tight text-zinc-900">
            偏好设置
          </h1>
          <p className="text-zinc-500 font-light text-lg mt-4">
            保持克制的界面，保留你真正需要的开关。
          </p>
        </div>
      </header>

      <section className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-800">界面</h2>
            <p className="text-sm font-light text-zinc-500">配置界面视觉风格。</p>
          </div>
          <div className="flex gap-4 p-2 bg-zinc-100/50 rounded-2xl border border-zinc-100">
            {["light", "dark", "system"].map((themeOpt) => (
              <button
                key={themeOpt}
                onClick={() => setTheme(themeOpt as typeof settings.theme)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-[0.1em] transition-all duration-300
                  ${settings.theme === themeOpt 
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/50" 
                    : "text-zinc-400 hover:text-zinc-800"}`}
              >
                {themeOpt === "light" ? "浅色" : themeOpt === "dark" ? "深色" : "跟随系统"}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-800">通知</h2>
            <p className="text-sm font-light text-zinc-500">管理消息通知渠道。</p>
          </div>
          <div className="space-y-1 border border-zinc-100 bg-white/40 backdrop-blur-md rounded-3xl p-2">
            {(Object.keys(settings.notifications) as Array<keyof typeof settings.notifications>).map((key) => (
              <label key={key} className="flex items-center justify-between p-4 hover:bg-zinc-50/50 rounded-2xl cursor-pointer group transition-colors">
                <span className="text-sm font-light text-zinc-700 capitalize group-hover:text-zinc-900">{key === "email" ? "邮件通知" : key === "push" ? "推送通知" : "短信通知"}</span>
                <div 
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-500 ${settings.notifications[key] ? "bg-zinc-900" : "bg-zinc-200"}`}
                >
                  <div 
                    className={`w-4 h-4 bg-white rounded-full transition-transform duration-500 shadow-sm ${settings.notifications[key] ? "translate-x-6" : "translate-x-0"}`} 
                  />
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={settings.notifications[key]}
                  onChange={(e) => setNotifications({ [key]: e.target.checked })}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-800">隐私</h2>
            <p className="text-sm font-light text-zinc-500">控制数据采集范围。</p>
          </div>
          <div className="space-y-1 border border-zinc-100 bg-white/40 backdrop-blur-md rounded-3xl p-2">
            <label className="flex items-center justify-between p-4 hover:bg-zinc-50/50 rounded-2xl cursor-pointer group transition-colors border-b border-zinc-50">
              <span className="text-sm font-light text-zinc-700 group-hover:text-zinc-900">允许遥测数据</span>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-500 ${settings.privacy.telemetry ? "bg-zinc-900" : "bg-zinc-200"}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-500 shadow-sm ${settings.privacy.telemetry ? "translate-x-6" : "translate-x-0"}`} />
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={settings.privacy.telemetry}
                onChange={(e) => setPrivacy({ telemetry: e.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between p-4 hover:bg-zinc-50/50 rounded-2xl cursor-pointer group transition-colors">
              <span className="text-sm font-light text-zinc-700 group-hover:text-zinc-900">共享匿名数据</span>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-500 ${settings.privacy.shareData ? "bg-zinc-900" : "bg-zinc-200"}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-500 shadow-sm ${settings.privacy.shareData ? "translate-x-6" : "translate-x-0"}`} />
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={settings.privacy.shareData}
                onChange={(e) => setPrivacy({ shareData: e.target.checked })}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-800">主题色</h2>
            <p className="text-sm font-light text-zinc-500">切换应用主色与背景氛围，动效由 GSAP 驱动。</p>
          </div>
          <div className="rounded-3xl border border-zinc-100 p-5 bg-white/60 backdrop-blur-md">
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              {themePaletteNames.map((name) => {
                const palette = themePalettes[name];
                const active = settings.palette === name;

                return (
                  <button
                    key={name}
                    onClick={() => {
                      setPalette(name);
                    }}
                    className={`rounded-2xl border px-3 py-3 text-left transition-all duration-300 ${
                      active ? "border-zinc-300 shadow-md" : "border-zinc-200/70 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accent }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accentSoft }} />
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-zinc-600">
                      {name === "graphite" ? "石墨" : name === "teal" ? "青绿" : "琥珀"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-4 rounded-2xl border border-zinc-100 bg-white/70">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-3">预览</div>
              <div
                className="h-14 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${themePalettes[settings.palette].bgStart}, ${themePalettes[settings.palette].bgEnd})`,
                }}
              />
            </div>
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