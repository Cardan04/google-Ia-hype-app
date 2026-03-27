import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, Loader2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { loginAsGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou senha incorretos. Verifique seus dados e tente novamente.");
        }
        if (error.message.includes("rate limit")) {
          throw new Error("Limite de tentativas excedido. Por favor, aguarde alguns minutos ou use o 'Acesso Agora (Teste)' acima.");
        }
        throw error;
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Email ou senha incorretos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setGuestLoading(true);
    setTimeout(() => {
      loginAsGuest();
      navigate("/");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Side - Visual/Editorial */}
      <div className="hidden md:flex flex-1 relative bg-[#0A0A0B] items-center justify-center p-12 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#00FF00_0%,transparent_50%)] blur-[120px]" />
        </div>
        
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00FF00]">
            <Sparkles className="w-3 h-3" />
            Next Gen Experience
          </div>
          
          <h1 className="text-[120px] font-black leading-[0.85] tracking-tighter uppercase italic">
            HY<span className="text-[#00FF00]">PE</span>
          </h1>
          
          <p className="text-xl text-gray-400 font-medium leading-relaxed">
            A plataforma definitiva para quem vive o agora. Conecte-se, participe e eleve seu status digital.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <Zap className="w-8 h-8 text-[#00FF00] mb-4" />
              <h3 className="font-bold mb-1">Hype Score</h3>
              <p className="text-xs text-gray-500">Gamificação real do seu lifestyle.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <ShieldCheck className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="font-bold mb-1">Web3 Native</h3>
              <p className="text-xs text-gray-500">Seus ingressos agora são ativos digitais.</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-12 left-12 flex items-center gap-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
          <span>Ver. 2.0.4</span>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <span>Encrypted Session</span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-10">
          <div className="md:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#00FF00] mb-6 shadow-[0_0_40px_rgba(0,255,0,0.3)]">
              <Zap className="w-8 h-8 text-black" fill="black" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">HYPE</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h2>
            <p className="text-gray-500">Escolha como deseja acessar a plataforma.</p>
          </div>

          {/* Quick Access Button - REQUESTED */}
          <button
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="group relative w-full bg-white text-black font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FF00] to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
            {guestLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span className="text-lg uppercase tracking-tight">Acessar Agora (Teste)</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-[#050505] px-4 text-gray-500 font-bold">Ou use sua conta</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:border-[#00FF00] transition-all placeholder:text-gray-700"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:border-[#00FF00] transition-all placeholder:text-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Entrar com Email"
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm">
            Novo por aqui?{" "}
            <Link to="/signup" className="text-[#00FF00] font-bold hover:underline">
              Criar Identidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
