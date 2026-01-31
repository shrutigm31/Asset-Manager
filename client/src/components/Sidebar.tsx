import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, FileText, MessageSquareText, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Applications", href: "/applications", icon: FileText },
  { label: "Program Advisor", href: "/advisor", icon: MessageSquareText },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-white transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Area */}
          <div className="flex h-20 items-center justify-center border-b border-white/10 px-6">
            <h1 className="font-display text-2xl font-bold tracking-wider text-amber-400">
              IRON LADY
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-8">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors cursor-pointer",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                AD
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Admin User</span>
                <span className="text-xs text-slate-400">Iron Lady Team</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
