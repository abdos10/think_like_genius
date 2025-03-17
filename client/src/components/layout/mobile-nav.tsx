import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "ri-dashboard-line" },
    { href: "/training", label: "Training", icon: "ri-brain-line" },
    { href: "/problem-solver", label: "Problems", icon: "ri-question-line" },
    { href: "/analytics", label: "Analytics", icon: "ri-bar-chart-line" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around z-10">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center",
            location === item.href ? "text-primary" : "text-gray-500"
          )}
        >
          <i className={cn(item.icon, "text-xl")}></i>
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
