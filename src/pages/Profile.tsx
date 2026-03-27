import React, { useEffect, useState } from "react";
import { 
  User, 
  Settings, 
  Trophy, 
  Calendar, 
  Gift, 
  Wallet, 
  Hexagon, 
  Cpu, 
  Star,
  ExternalLink,
  Loader2,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { AttendanceToken, Event, Reward } from "../types";
import { formatDate } from "../lib/utils";

const MOCK_NFTS: AttendanceToken[] = [
  { id: "n1", userId: "guest-123", eventId: "e1", tokenId: "HYPE-X92B1", metadata: { event_name: "HYPE Tech Party", rarity: "Epic" }, createdAt: new Date().toISOString() },
  { id: "n2", userId: "guest-123", eventId: "e2", tokenId: "HYPE-A11Z0", metadata: { event_name: "Workshop NFT", rarity: "Common" }, createdAt: new Date().toISOString() },
];

const MOCK_REWARDS: Reward[] = [
  { id: "r1", userId: "guest-123", name: "VIP Lounge Access", description: "Acesso exclusivo ao lounge VIP no próximo evento.", pointsCost: 500, isClaimed: false, createdAt: new Date().toISOString() },
];

export function Profile() {
  const { user, hypeScore, connectWallet } = useAuth();
  const [activeTab, setActiveTab] = useState("nfts");
  const [tickets, setTickets] = useState<Event[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [nfts, setNfts] = useState<AttendanceToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      if (user.uid === "guest-123") {
        setNfts(MOCK_NFTS);
        setRewards(MOCK_REWARDS);
      }
      
      try {
        // Fetch tickets
        const { data: ticketsData } = await supabase
          .from("tickets")
          .select("*, events(*)")
          .eq("user_id", user.uid);
        
        if (ticketsData) {
          setTickets(ticketsData.map(t => ({
            id: t.events.id,
            name: t.events.name,
            description: t.events.description,
            location: t.events.location,
            eventDate: t.events.event_date,
            category: t.events.category,
            organizerId: t.events.organizer_id,
            isPremium: t.events.is_premium || false,
            createdAt: t.events.created_at
          } as Event)));
        }

        // Fetch rewards
        const { data: rewardsData } = await supabase
          .from("rewards")
          .select("*")
          .eq("user_id", user.uid);
        
        if (rewardsData) {
          setRewards(rewardsData.map(r => ({
            id: r.id,
            userId: r.user_id,
            name: r.name,
            description: r.description,
            pointsCost: r.points_cost,
            isClaimed: r.is_claimed,
            createdAt: r.created_at
          } as Reward)));
        }

        // Fetch NFTs (Attendance Tokens)
        const { data: nftsData } = await supabase
          .from("attendance_tokens")
          .select("*")
          .eq("user_id", user.uid);
        
        if (nftsData) {
          setNfts(nftsData.map(n => ({
            id: n.id,
            userId: n.user_id,
            eventId: n.event_id,
            tokenId: n.token_id,
            metadata: n.metadata,
            createdAt: n.created_at
          } as AttendanceToken)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  const tabs = [
    { id: "nfts", label: "NFTs", icon: Hexagon },
    { id: "tickets", label: "Ingressos", icon: Calendar },
    { id: "rewards", label: "Recompensas", icon: Gift },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Profile Header */}
      <div className="bg-[#0F0F11] border border-white/10 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF00]/10 blur-[100px] rounded-full -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-[#00FF00] to-blue-500 p-1">
              <div className="w-full h-full rounded-[38px] bg-[#0A0A0B] flex items-center justify-center overflow-hidden">
                <User className="w-16 h-16 text-gray-700" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#00FF00] text-black p-2 rounded-2xl shadow-lg">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-4xl font-bold tracking-tighter">{user.name}</h1>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                Nível {hypeScore?.level || "Bronze"}
              </div>
            </div>
            <p className="text-gray-500 mb-6">{user.email}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-[#00FF00]/10 border border-[#00FF00]/20 px-5 py-2.5 rounded-2xl">
                <Zap className="w-5 h-5 text-[#00FF00]" />
                <span className="text-lg font-bold text-[#00FF00]">{hypeScore?.score || 0} HYPE pts</span>
              </div>
              
              {user.walletAddress ? (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl text-gray-400">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm font-mono">{user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(38)}</span>
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-[#00FF00] transition-all"
                >
                  <Wallet className="w-5 h-5" />
                  Conectar Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#0F0F11] border border-white/10 p-2 rounded-3xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? "bg-white text-black shadow-lg" 
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-[#00FF00] animate-spin" />
            <p className="text-gray-500">Recuperando dados da blockchain...</p>
          </div>
        ) : (
          <>
            {activeTab === "nfts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft) => (
                  <div key={nft.id} className="bg-[#0F0F11] border border-white/10 rounded-[32px] p-1 group hover:border-[#00FF00]/30 transition-all">
                    <div className="aspect-square rounded-[30px] bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden mb-6">
                      {/* NFT Visual Art */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <Hexagon className="w-48 h-48 text-[#00FF00]" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-2 border-[#00FF00]/30 flex items-center justify-center animate-pulse">
                          <Cpu className="w-16 h-16 text-[#00FF00]" />
                        </div>
                      </div>
                      
                      {/* NFT Badge */}
                      <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                        {nft.metadata?.rarity || "Common"}
                      </div>
                      
                      {/* Token ID */}
                      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                        <div className="text-[10px] font-mono text-white/50 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg">
                          {nft.tokenId}
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/30" />
                      </div>
                    </div>
                    
                    <div className="px-6 pb-6">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-[#00FF00] transition-colors">{nft.metadata?.event_name}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">{nft.metadata?.category}</p>
                      <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                        <span>Minted: {formatDate(nft.createdAt)}</span>
                        <span className="text-[#00FF00]">Verified</span>
                      </div>
                    </div>
                  </div>
                ))}
                {nfts.length === 0 && (
                  <div className="col-span-full bg-white/5 border border-dashed border-white/10 rounded-[40px] p-16 text-center">
                    <Hexagon className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                    <h3 className="text-xl font-bold mb-2">Sua coleção está vazia</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Participe de eventos para gerar seus primeiros Attendance Tokens (NFTs).</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="space-y-4">
                {tickets.map((event) => (
                  <div key={event.id} className="bg-[#0F0F11] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold uppercase text-gray-500">Mês</span>
                        <span className="text-xl font-bold">{new Date(event.eventDate).getDate()}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{event.name}</h3>
                        <p className="text-sm text-gray-500">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-1">Status</p>
                        <p className="text-sm font-bold text-[#00FF00]">Confirmado</p>
                      </div>
                      <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all">
                        Ver QR Code
                      </button>
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-[40px] p-16 text-center">
                    <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                    <h3 className="text-xl font-bold mb-2">Nenhum ingresso</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Você ainda não se inscreveu em nenhum evento.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "rewards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rewards.map((reward) => (
                  <div key={reward.id} className="bg-[#0F0F11] border border-white/10 rounded-3xl p-6 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-yellow-400/10 text-yellow-400">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold">{reward.name}</h3>
                        <p className="text-xs text-gray-500">{reward.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-yellow-400">{reward.pointsCost} pts</p>
                      <p className="text-[10px] font-bold uppercase text-gray-600 mt-1">Disponível</p>
                    </div>
                  </div>
                ))}
                {rewards.length === 0 && (
                  <div className="col-span-full bg-white/5 border border-dashed border-white/10 rounded-[40px] p-16 text-center">
                    <Gift className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                    <h3 className="text-xl font-bold mb-2">Sem recompensas</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Acumule mais HYPE pts para desbloquear recompensas exclusivas.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-[#0F0F11] border border-white/10 rounded-[40px] p-8 md:p-12">
                <h3 className="text-2xl font-bold mb-8">Preferências da Conta</h3>
                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome de Exibição</label>
                    <input 
                      type="text" 
                      defaultValue={user.name}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#00FF00] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 opacity-50 cursor-not-allowed"
                    />
                  </div>
                  <button className="w-full bg-[#00FF00] text-black font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
