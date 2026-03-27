import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  LogOut, 
  Zap, 
  Trophy, 
  Menu, 
  X 
} from "lucide-react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { HypeBot } from "./HypeBot";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, hypeScore, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Eventos", path: "/events", icon: Calendar },
    { name: "Perfil", path: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0A0B] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-[#00FF00]" fill="#00FF00" />
          <span className="font-bold text-xl tracking-tighter">HYPE</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[#0F0F11] border-r border-white/10 flex flex-col z-40 transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-2">
          <Zap className="w-8 h-8 text-[#00FF00]" fill="#00FF00" />
          <span className="font-bold text-2xl tracking-tighter">HYPE</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path 
                  ? "bg-[#00FF00] text-black font-semibold shadow-[0_0_20px_rgba(0,255,0,0.2)]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {user && (
            <div className="bg-white/5 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF00] to-[#00CC00] flex items-center justify-center text-black font-bold">
                  {user.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold truncate w-32">{user.name}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-gray-500">{hypeScore?.level || "Bronze"}</p>
                    {user.walletAddress && <div className="w-1 h-1 rounded-full bg-[#00FF00]" />}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">HYPE Score</span>
                <span className="text-[#00FF00] font-mono">{hypeScore?.score || 0}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-[#00FF00] h-full transition-all duration-500" 
                  style={{ width: `${Math.min(((hypeScore?.score || 0) % 1000) / 10, 100)}%` }}
                />
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* HYPE Bot */}
      <HypeBot />
    </div>
  );
}
