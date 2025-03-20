import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@/lib/types";

interface HeaderProps {
  user: User | null;
  onToggleSidebar: () => void;
}

export function Header({ user, onToggleSidebar }: HeaderProps) {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/training":
        return "Training";
      case "/problem-solver":
        return "Problem Solver";
      case "/thinking-process":
        return "Thinking Process";
      case "/analytics":
        return "Analytics";
      case "/achievements":
        return "Achievements";
      default:
        return "Think like genius";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden text-gray-500 hover:text-gray-700"
        onClick={onToggleSidebar}
      >
        <i className="ri-menu-line text-2xl"></i>
      </button>
      
      <h1 className="text-xl font-bold font-heading text-primary lg:hidden">{getPageTitle()}</h1>
      
      {/* Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-lg mx-4">
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search exercises, problems..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
        </div>
      </div>
      
      {/* Header Actions */}
      <div className="flex items-center space-x-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <i className="ri-notification-3-line text-2xl"></i>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center lg:hidden">
          <i className="ri-user-line text-gray-500"></i>
        </div>
      </div>
    </header>
  );
}
