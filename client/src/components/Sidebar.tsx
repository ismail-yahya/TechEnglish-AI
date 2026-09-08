import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Settings,
  LogOut,
  Sparkles,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/stories", icon: BookOpen, label: "Stories" },
  { to: "/vocabulary", icon: Brain, label: "Vocabulary" },
  { to: "/profile", icon: Settings, label: "Profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Manage open/close state. On mobile, start closed. On desktop, start open.
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button (Visible only on mobile when sidebar is closed) */}
      {isMobile && !isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 rounded-full glass bg-background/50 border-border/50 shadow-md text-primary"
        >
          <Menu size={20} />
        </Button>
      )}

      <aside
        className={`
          flex flex-col
          ${isOpen ? "w-64" : "w-20"}
          ${isMobile ? "fixed left-0 top-0 bottom-0 z-50" : "relative sticky top-0 h-screen"}
          bg-background/60 dark:bg-background/40
          backdrop-blur-xl border-r border-border/40 shadow-xl
          transition-all duration-300 ease-in-out
          ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Toggle Button for Desktop - Floating on the right edge */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3.5 top-8 p-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary shadow-lg hover:bg-primary hover:text-primary-foreground hover:shadow-primary/50 transition-all z-10"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}

        {/* Logo Section */}
        <div className="flex items-center gap-3 p-5 h-[88px] shrink-0 border-b border-border/20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Sparkles size={20} className="text-primary-foreground" />
          </div>
          <div
            className={`flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 ${
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            <span className="font-extrabold text-lg leading-tight tracking-tight text-foreground">
              Langflow
            </span>
            <span className="text-[0.65rem] font-medium text-accent uppercase tracking-widest">
              AI App
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto mt-2 styled-scrollbar">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              title={!isOpen ? label : undefined}
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap
                ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(var(--primary),0.05)] border border-primary/10 font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
                }
              `}
            >
              <Icon size={22} className="shrink-0" />
              <span
                className={`transition-all duration-300 delay-100 ${
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 hidden"
                }`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="shrink-0 pt-4 pb-6 px-3 border-t border-border/20 flex flex-col gap-4">
          {/* Theme Toggle */}
          <div
            className={`flex items-center ${isOpen ? "justify-between px-3" : "justify-center"} overflow-hidden transition-all duration-300`}
            title={
              !isOpen
                ? theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
                : undefined
            }
          >
            <div
              className={`flex items-center gap-3 text-sm font-medium text-muted-foreground whitespace-nowrap transition-all duration-300`}
              style={!isOpen ? { display: "none" } : {}}
            >
              {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </div>

            {isOpen ? (
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-primary shadow-sm"
              />
            ) : (
              <button
                onClick={() => toggleTheme()}
                className="p-2.5 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                title={
                  theme === "dark"
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode"
                }
              >
                {theme === "dark" ? <Moon size={22} /> : <Sun size={22} />}
              </button>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center justify-between px-2 overflow-hidden bg-background/40 backdrop-blur-md rounded-2xl border border-border/40 p-2 shadow-sm transition-all duration-300">
            <div
              className={`flex flex-col whitespace-nowrap transition-all duration-300 ${
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"
              }`}
            >
              <span className="font-semibold text-sm text-foreground truncate max-w-[120px]">
                {user?.name?.split(" ")[0]}
              </span>
              <span className="text-xs font-bold text-primary">
                {user?.currentLevel || "A0"}
              </span>
            </div>
            <button
              className={`
                flex items-center justify-center rounded-xl transition-all
                hover:bg-destructive/10 hover:text-destructive
                ${isOpen ? "p-2 text-muted-foreground" : "p-2 w-full text-muted-foreground hover:neon-glow border border-transparent hover:border-destructive/20"}
              `}
              onClick={handleLogout}
              title={!isOpen ? "Logout" : undefined}
            >
              <LogOut size={20} className={isOpen ? "ml-1" : ""} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
