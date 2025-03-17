import { useState } from "react";
import { Switch, Route } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Dashboard from "@/pages/dashboard";
import Training from "@/pages/training";
import ProblemSolver from "@/pages/problem-solver";
import ThinkingProcess from "@/pages/thinking-process";
import Analytics from "@/pages/analytics";
import Achievements from "@/pages/achievements";
import NotFound from "@/pages/not-found";

// Components
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

// Types
import { User } from "@/lib/types";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/users/current"],
    retry: false,
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background text-gray-800">
        <Sidebar user={currentUser || null} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={currentUser || null} onToggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/training" component={Training} />
              <Route path="/problem-solver" component={ProblemSolver} />
              <Route path="/thinking-process" component={ThinkingProcess} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/achievements" component={Achievements} />
              <Route component={NotFound} />
            </Switch>
          </main>
          
          <MobileNav />
        </div>
      </div>
      
      <Toaster />
    </>
  );
}

export default App;
