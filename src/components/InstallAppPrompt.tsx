import { useEffect, useState } from "react";
import { Download, Plus, Share, Smartphone, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"browser" | "ios">("browser");

  useEffect(() => {
    const isIosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

    if (isIosDevice && !isStandalone && localStorage.getItem("iosInstallPromptDismissed") !== "true") {
      setMode("ios");
      window.setTimeout(() => setVisible(true), 1200);
      return;
    }

    if (localStorage.getItem("installPromptDismissed") === "true") return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setMode("browser");
      setInstallEvent(event as InstallPromptEvent);
      window.setTimeout(() => setVisible(true), 1200);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const close = () => {
    localStorage.setItem(mode === "ios" ? "iosInstallPromptDismissed" : "installPromptDismissed", "true");
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem("installPromptDismissed", "true");
    }
    setVisible(false);
    setInstallEvent(null);
  };

  if (!visible || (mode === "browser" && !installEvent)) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-md animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="rounded-3xl border border-[#E2E2D1] bg-white shadow-2xl shadow-black/15 overflow-hidden">
        <div className="p-5 flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#5A5A40]/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#3A3A2F] leading-tight">
                  {mode === "ios" ? "Добавить на экран «Домой»" : "Установить Mesta NSTU"}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[#8E8E8E]">
                  {mode === "ios"
                    ? "В Safari нажмите «Поделиться», затем выберите «На экран Домой». Сайт откроется как отдельное приложение."
                    : "Откроется как отдельное приложение: быстрее доступ к бронированиям, карте и избранным местам."}
                </p>
              </div>
              <button onClick={close} className="w-8 h-8 rounded-full bg-[#F5F5F0] text-[#8E8E8E] flex items-center justify-center hover:text-[#3A3A2F] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {mode === "ios" && (
              <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 rounded-2xl bg-[#F5F5F0] p-4 text-sm text-[#3A3A2F]">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#5A5A40]">
                  <Share className="w-4 h-4" />
                </div>
                <div className="font-bold leading-8">Нажмите «Поделиться»</div>
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#5A5A40]">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="font-bold leading-8">Выберите «На экран Домой»</div>
              </div>
            )}
            <div className="mt-5 flex gap-3">
              {mode === "browser" && (
                <button onClick={install} className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5A5A40] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#5A5A40]/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  <Download className="w-4 h-4" />
                  Установить
                </button>
              )}
              <button onClick={close} className="rounded-2xl bg-[#F5F5F0] px-4 py-3 text-sm font-bold text-[#5A5A40] hover:bg-[#ECECE1] transition-colors">
                {mode === "ios" ? "Понятно" : "Позже"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
