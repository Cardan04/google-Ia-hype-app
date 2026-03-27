import React, { useEffect, useState } from "react";
import { 
  Trophy, 
  Zap, 
  Calendar, 
  TrendingUp, 
  Star, 
  Clock,
  ArrowUpRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { Event, HypeLog } from "../types";
import { formatDate } from "../lib/utils";

const MOCK_CHART_DATA = [
  { name: "Seg", score: 400 },
  { name: "Ter", score: 600 },
  { name: "Qua", score: 500 },
  { name: "Qui", score: 900 },
  { name: "Sex", score: 1200 },
  { name: "Sáb", score: 1500 },
  { name: "Dom", score: 1800 },
];

const GUEST_LOGS: HypeLog[] = [
  { id: "1", userId: "guest-123", eventId: "e1", points: 150, reason: "Compra de ingresso: HYPE Tech Party", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "2", userId: "guest-123", eventId: "e2", points: 50, reason: "Check-in: Workshop NFT", createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "3", userId: "guest-123", eventId: "e3", points: 200, reason: "Bônus: Primeira Wallet Conectada", createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export function Dashboard() {
  const { user, hypeScore } = useAuth();
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentLogs, setRecentLogs] = useState<HypeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // If guest, use mock logs
      if (user.uid === "guest-123") {
        setRecentLogs(GUEST_LOGS);
      }

      try {
        // Fetch recent events
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);
        
        if (eventsData) {
          setRecentEvents(eventsData.map(e => ({
            id: e.id,
            name: e.name,
            description: e.description,
            location: e.location,
            eventDate: e.event_date,
            category: e.category,
            organizerId: e.organizer_id,
            isPremium: e.is_premium || false,
            createdAt: e.created_at
          } as Event)));
        }

        // Fetch recent hype logs for user
        const { data: logsData } = await supabase
          .from("hype_logs")
          .select("*")
          .eq("user_id", user.uid)
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (logsData) {
          setRecentLogs(logsData.map(l => ({
            id: l.id,
            userId: l.user_id,
            eventId: l.event_id,
            points: l.points,
            reason: l.reason,
            createdAt: l.created_at
          } as HypeLog)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats = [
    { label: "HYPE Score", value: hypeScore?.score || 0, icon: Zap, color: "text-[#00FF00]" },
    { label: "Eventos", value: hypeScore?.totalEvents || 0, icon: Calendar, color: "text-blue-400" },
    { label: "Nível", value: hypeScore?.level || "Bronze", icon: Trophy, color: "text-yellow-400" },
    { label: "Rank Global", value: "#124", icon: Star, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Bem-vindo, {user?.name.split(" ")[0]}!</h1>
          <p className="text-gray-500">Sua jornada épica continua aqui.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <TrendingUp className="w-4 h-4 text-[#00FF00]" />
          <span className="text-sm font-medium">+12% de HYPE esta semana</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#0F0F11] border border-white/10 p-6 rounded-3xl hover:border-[#00FF00]/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
            </div>
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#0F0F11] border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight">Evolução do HYPE</h2>
            <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0F0F11", border: "1px solid #ffffff10", borderRadius: "12px" }}
                  itemStyle={{ color: "#00FF00" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#00FF00" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#0F0F11] border border-white/10 p-6 rounded-3xl">
          <h2 className="text-xl font-bold tracking-tight mb-6">Atividade Recente</h2>
          <div className="space-y-6">
            {recentLogs.length > 0 ? recentLogs.map((log, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.5)]" />
                </div>
                <div>
                  <p className="text-sm font-medium">{log.reason}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(log.createdAt)}
                  </div>
                  <p className="text-xs text-[#00FF00] font-mono mt-1">+{log.points} pts</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">Nenhuma atividade ainda.</p>
                <p className="text-xs text-gray-600 mt-1">Participe de eventos para ganhar pontos!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Events */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Eventos Recomendados</h2>
          <button className="text-[#00FF00] text-sm font-semibold hover:underline">Ver todos</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentEvents.map((event) => (
            <div key={event.id} className="bg-[#0F0F11] border border-white/10 rounded-3xl overflow-hidden group hover:border-[#00FF00]/30 transition-all">
              <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 relative">
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {event.category}
                </div>
                {event.isPremium && (
                  <div className="absolute top-4 left-4 bg-[#00FF00] text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Star className="w-3 h-3 fill-black" />
                    Premium
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2 group-hover:text-[#00FF00] transition-colors">{event.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  {formatDate(event.eventDate)}
                </div>
                <button className="w-full py-3 bg-white/5 hover:bg-[#00FF00] hover:text-black rounded-2xl text-sm font-bold transition-all">
                  Participar
                </button>
              </div>
            </div>
          ))}
          {recentEvents.length === 0 && (
             <div className="col-span-full bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum evento disponível no momento.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
