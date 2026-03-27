import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Zap, 
  Calendar, 
  MapPin, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "../supabase";
import { Event } from "../types";
import { cn, formatDate } from "../lib/utils";

interface Message {
  role: "user" | "model";
  text: string;
}

export function HypeBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Olá! Sou o HYPE Bot. Como posso te ajudar a encontrar os melhores eventos hoje?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from("events").select("*");
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
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const eventContext = events.map(e => 
        `- ${e.name}: ${e.category} em ${e.location} no dia ${formatDate(e.eventDate)}. ${e.isPremium ? "Evento Premium (R$ 150)" : "Evento Standard (R$ 50)"}.`
      ).join("\n");

      const systemInstruction = `
        Você é o HYPE Bot, um assistente especializado em eventos e cultura urbana.
        Seu objetivo é ajudar os usuários a encontrar eventos legais, verificar preços e datas.
        
        Aqui está a lista de eventos atuais no banco de dados:
        ${eventContext}
        
        Regras:
        1. Se o usuário perguntar por eventos hoje, verifique a data atual (${new Date().toLocaleDateString()}).
        2. Se perguntar por valor, use os preços: Standard (R$ 50) e Premium (R$ 150).
        3. Seja descolado, use gírias urbanas leves, mas seja profissional.
        4. Se não houver eventos que correspondam à busca, sugira os eventos mais próximos ou convide-o a explorar a aba de Eventos.
        5. Responda sempre em Português.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: messages.concat({ role: "user", text: userMessage }).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction,
        }
      });

      const aiText = response.text || "Desculpe, tive um pequeno curto-circuito. Pode repetir?";
      setMessages(prev => [...prev, { role: "model", text: aiText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "model", text: "Ops, perdi a conexão com a rede HYPE. Tente novamente em instantes!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-16 h-16 rounded-3xl bg-[#00FF00] text-black flex items-center justify-center shadow-[0_20px_40px_rgba(0,255,0,0.3)] hover:scale-110 active:scale-95 transition-all z-50",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <MessageSquare className="w-8 h-8" fill="black" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-ping" />
        </div>
      </button>

      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-[#0F0F11] border border-white/10 rounded-[40px] shadow-2xl flex flex-col z-50 transition-all duration-500 origin-bottom-right",
        !isOpen && "scale-0 opacity-0 pointer-events-none"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#00FF00]/10 to-transparent rounded-t-[40px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00FF00] flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" fill="black" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">HYPE Assistant</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF00] animate-pulse" />
                <span className="text-[10px] font-bold text-[#00FF00] uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
        >
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === "user" ? "ml-auto items-end" : "items-start"
              )}
            >
              <div className={cn(
                "p-4 rounded-3xl text-sm leading-relaxed",
                msg.role === "user" 
                  ? "bg-[#00FF00] text-black font-medium rounded-tr-none" 
                  : "bg-white/5 border border-white/10 text-white rounded-tl-none"
              )}>
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-600 mt-2 font-bold uppercase tracking-widest">
                {msg.role === "user" ? "Você" : "HYPE Bot"}
              </span>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none">
                <Loader2 className="w-5 h-5 text-[#00FF00] animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          <div className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pergunte sobre eventos..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:border-[#00FF00] transition-all text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#00FF00] text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setInput("Quais eventos tem hoje?")}
              className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#00FF00] transition-colors"
            >
              Eventos hoje
            </button>
            <button 
              onClick={() => setInput("Eventos até R$ 50")}
              className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#00FF00] transition-colors"
            >
              Até R$ 50
            </button>
            <button 
              onClick={() => setInput("Eventos Premium")}
              className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#00FF00] transition-colors"
            >
              Premium
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
