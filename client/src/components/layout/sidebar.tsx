import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@/lib/types";

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "ri-dashboard-line" },
    { href: "/training", label: "Training", icon: "ri-brain-line" },
    { href: "/problem-solver", label: "Problem Solver", icon: "ri-question-line" },
    { href: "/thinking-process", label: "Thinking Process", icon: "ri-lightbulb-line" },
    { href: "/analytics", label: "Analytics", icon: "ri-bar-chart-box-line" },
    { href: "/achievements", label: "Achievements", icon: "ri-medal-line" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
          </svg>
          <h1 className="text-xl font-bold font-heading text-primary">ThinkTrainer</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium transition-colors",
              location === item.href
                ? "bg-primary/5 text-primary hover:bg-primary/10"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <i className={cn(item.icon, "text-xl opacity-90")}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <i className="ri-user-line text-gray-500"></i>
            </div>
            <div>
              <p className="font-medium">{user.displayName}</p>
              <p className="text-sm text-gray-500">{user.level}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
