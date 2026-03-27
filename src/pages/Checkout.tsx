import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Star, 
  Calendar, 
  MapPin,
  Loader2,
  CheckCircle2,
  Hexagon,
  ArrowRight
} from "lucide-react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { Event } from "../types";
import { formatDate } from "../lib/utils";

export function Checkout() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, hypeScore } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenId, setTokenId] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();
        
        if (error) throw error;
        if (data) {
          setEvent({
            id: data.id,
            name: data.name,
            description: data.description,
            location: data.location,
            eventDate: data.event_date,
            category: data.category,
            organizerId: data.organizer_id,
            isPremium: data.is_premium || false,
            createdAt: data.created_at
          } as Event);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handlePurchase = async () => {
    if (!user || !event) return;
    setProcessing(true);
    try {
      // 1. Create ticket
      const { error: ticketError } = await supabase
        .from("tickets")
        .insert({
          user_id: user.uid,
          event_id: event.id,
          status: "confirmed"
        });
      
      if (ticketError) throw ticketError;

      // 2. Generate Attendance NFT
      const newTokenId = `HYPE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setTokenId(newTokenId);
      
      const { error: nftError } = await supabase
        .from("attendance_tokens")
        .insert({
          user_id: user.uid,
          event_id: event.id,
          token_id: newTokenId,
          metadata: {
            event_name: event.name,
            event_date: event.eventDate,
            category: event.category,
            rarity: event.isPremium ? "Epic" : "Common"
          }
        });
      
      if (nftError) throw nftError;

      // 3. Update Hype Score
      const pointsToAdd = event.isPremium ? 150 : 50;
      const newScore = (hypeScore?.score || 0) + pointsToAdd;
      
      await supabase
        .from("hype_scores")
        .update({ 
          score: newScore,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.uid);

      // 4. Log the points
      await supabase
        .from("hype_logs")
        .insert({
          user_id: user.uid,
          event_id: event.id,
          points: pointsToAdd,
          reason: `Compra de ingresso: ${event.name}`
        });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao processar compra. Verifique se as tabelas do Supabase existem.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#00FF00] animate-spin" />
      </div>
    );
  }

  if (!event) return <div>Evento não encontrado.</div>;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#00FF00]/10 border-2 border-[#00FF00] mb-4">
          <CheckCircle2 className="w-12 h-12 text-[#00FF00]" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Compra Confirmada!</h1>
          <p className="text-gray-400 text-lg">Seu ingresso está garantido e seu NFT de participação foi gerado.</p>
        </div>

        <div className="bg-[#0F0F11] border border-white/10 rounded-[40px] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Hexagon className="w-32 h-32 text-[#00FF00]" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10">
              <Hexagon className="w-16 h-16 text-[#00FF00]" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[10px] font-bold text-[#00FF00] uppercase tracking-widest mb-1">NFT Attendance Token</p>
              <h3 className="text-xl font-bold mb-2">{event.name}</h3>
              <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                <span>ID: {tokenId}</span>
                <span>Raridade: {event.isPremium ? "Epic" : "Common"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button 
            onClick={() => navigate("/profile")}
            className="w-full sm:w-auto px-8 py-4 bg-[#00FF00] text-black font-bold rounded-2xl hover:scale-105 transition-all"
          >
            Ver no meu Perfil
          </button>
          <button 
            onClick={() => navigate("/events")}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
          >
            Explorar mais eventos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Voltar para eventos
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Event Info & Payment */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0F0F11] border border-white/10 rounded-[40px] p-8 md:p-10">
            <h1 className="text-3xl font-bold tracking-tighter mb-8">Finalizar Compra</h1>
            
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Método de Pagamento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border-2 border-[#00FF00] text-left">
                    <div className="p-2 rounded-xl bg-black/50">
                      <CreditCard className="w-6 h-6 text-[#00FF00]" />
                    </div>
                    <div>
                      <p className="font-bold">Cartão de Crédito</p>
                      <p className="text-[10px] text-gray-500">Final 4432</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-left opacity-50 cursor-not-allowed">
                    <div className="p-2 rounded-xl bg-black/50">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-bold">PIX</p>
                      <p className="text-[10px] text-gray-500">Em breve</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3 text-[#00FF00]">
                  <ShieldCheck className="w-6 h-6" />
                  <p className="text-sm font-medium">Sua transação é protegida e verificada na rede HYPE.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-6">
          <div className="bg-[#0F0F11] border border-white/10 rounded-[40px] p-8 sticky top-8">
            <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm leading-tight mb-1">{event.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(event.eventDate)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Ingresso {event.isPremium ? "Premium" : "Standard"}</span>
                  <span>R$ {event.isPremium ? "150,00" : "50,00"}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Taxa de Serviço</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-[#00FF00]">R$ {event.isPremium ? "150,00" : "50,00"}</span>
                </div>
              </div>

              <div className="bg-[#00FF00]/10 p-4 rounded-2xl flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#00FF00]" />
                <div>
                  <p className="text-[10px] font-bold text-[#00FF00] uppercase tracking-widest">Recompensa</p>
                  <p className="text-xs font-medium">Você ganhará {event.isPremium ? 150 : 50} HYPE pts</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePurchase}
              disabled={processing}
              className="w-full py-5 bg-[#00FF00] text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(0,255,0,0.1)] flex items-center justify-center gap-2"
            >
              {processing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Confirmar Pagamento
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <p className="text-[10px] text-gray-600 text-center mt-6 uppercase tracking-widest font-bold">
              Secure Checkout by HYPE Pay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
