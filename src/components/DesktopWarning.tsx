import { useEffect, useState } from "react";
import { MonitorSmartphone, X } from "lucide-react";

export default function DesktopWarning() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("desktopWarningDismissed") === "true";
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop && !dismissed) {
      const timer = window.setTimeout(() => setVisible(true), 700);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const close = () => {
    localStorage.setItem("desktopWarningDismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="hidden lg:flex fixed inset-0 z-[90] items-center justify-center bg-black/45 p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E2E2D1] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6 flex gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shrink-0">
            <MonitorSmartphone className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#3A3A2F] leading-tight">Лучше открыть на телефоне</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#8E8E8E]">
                  Mesta NSTU спроектирован как мобильное приложение: бронирование, карта, установка на экран и профиль удобнее работают со смартфона.
                </p>
              </div>
              <button onClick={close} className="w-9 h-9 rounded-full bg-[#F5F5F0] text-[#8E8E8E] flex items-center justify-center hover:text-[#3A3A2F]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-6 flex items-center gap-5">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=152x152&margin=10&data=https%3A%2F%2Fmesta-nstu.duckdns.org"
                alt="QR код сайта Mesta NSTU"
                className="w-36 h-36 rounded-2xl border border-[#E2E2D1] bg-white p-2"
              />
              <div className="space-y-3">
                <p className="text-sm font-bold text-[#3A3A2F]">Отсканируйте QR-код камерой телефона</p>
                <p className="text-xs leading-relaxed text-[#8E8E8E]">Откроется мобильная версия сайта, после чего браузер сможет предложить установить мини-приложение.</p>
                <button onClick={close} className="px-5 py-3 rounded-2xl bg-[#5A5A40] text-white text-sm font-bold">Продолжить на ПК</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
