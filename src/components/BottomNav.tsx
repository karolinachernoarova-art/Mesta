import { NavLink } from "react-router-dom";
import { Home, Map as MapIcon, Calendar, User } from "lucide-react";
import { cn } from "../lib/utils";

export default function BottomNav() {
  const navItems = [
    { to: "/", icon: Home, label: "Каталог" },
    { to: "/map", icon: MapIcon, label: "Карта" },
    { to: "/bookings", icon: Calendar, label: "Мои брони" },
    { to: "/profile", icon: User, label: "Профиль" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border-main)] pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-200",
                isActive ? "text-[var(--brand-primary)] opacity-100" : "text-[var(--text-main)] opacity-40 hover:opacity-70"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-6 h-6", isActive ? "stroke-2 bg-[var(--bg-subtle)] p-1 rounded-lg" : "stroke-2")} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
