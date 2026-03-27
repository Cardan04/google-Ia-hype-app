import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  Zap, 
  Star,
  CheckCircle2,
  Loader2,
  Hexagon,
  Cpu,
  ArrowRight
} from "lucide-react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { Event } from "../types";
import { formatDate } from "../lib/utils";

export function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTickets, setUserTickets] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchUserTickets();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setEvents(data.map(e => ({
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTickets = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("event_id")
        .eq("user_id", user.uid);
      
      if (error) throw error;
      if (data) {
        setUserTickets(data.map(t => t.event_id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleParticipate = (event: Event) => {
    // Navigate to checkout regardless of being a real user or guest for testing purposes
    navigate(`/checkout/${event.id}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Explorar Eventos</h1>
          <p className="text-gray-500">Descubra experiências que elevam seu HYPE.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar eventos..."
              className="bg-[#0F0F11] border border-white/10 rounded-2xl py-3 pl-12 pr-4 w-full md:w-64 focus:outline-none focus:border-[#00FF00] transition-all"
            />
          </div>
          <button className="p-3 bg-[#0F0F11] border border-white/10 rounded-2xl hover:border-white/20 transition-all">
            <Filter className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        {["Todos", "Tecnologia", "Design", "Música", "Web3", "Networking", "Arte"].map((cat, i) => (
          <button 
            key={i}
            className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              i === 0 ? "bg-[#00FF00] text-black" : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#00FF00] animate-spin" />
          <p className="text-gray-500 animate-pulse">Sincronizando com a rede...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.map((event) => {
            const isRegistered = userTickets.includes(event.id);
            return (
              <div key={event.id} className="bg-[#0F0F11] border border-white/10 rounded-[32px] overflow-hidden group hover:border-[#00FF00]/30 transition-all flex flex-col">
                <div className="h-56 bg-gradient-to-br from-gray-800 to-gray-900 relative">
                  <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    {event.category}
                  </div>
                  {event.isPremium && (
                    <div className="absolute top-6 left-6 bg-[#00FF00] text-black px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,255,0,0.3)]">
                      <Star className="w-3.5 h-3.5 fill-black" />
                      Premium
                    </div>
                  )}
                  
                  {/* Visual NFT indicator */}
                  <div className="absolute bottom-4 left-6 flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-tighter">
                    <Hexagon className="w-3 h-3 text-[#00FF00]" />
                    NFT Attendance Enabled
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-[#00FF00] transition-colors leading-tight">{event.name}</h3>
                  
                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="p-2 rounded-lg bg-white/5">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{formatDate(event.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="p-2 rounded-lg bg-white/5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="p-2 rounded-lg bg-white/5">
                        <Zap className="w-4 h-4 text-[#00FF00]" />
                      </div>
                      <span className="text-sm font-medium text-[#00FF00]">+{event.isPremium ? 150 : 50} HYPE pts</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => !isRegistered && handleParticipate(event)}
                    disabled={isRegistered}
                    className={`w-full py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      isRegistered 
                        ? "bg-white/5 text-gray-500 cursor-default" 
                        : "bg-[#00FF00] text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(0,255,0,0.1)]"
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Inscrito
                      </>
                    ) : (
                      <>
                        Garantir Ingresso
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
