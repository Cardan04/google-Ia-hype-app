import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, User, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";

export function Signup() {
  const { loginAsGuest } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGuestLogin = () => {
    setGuestLoading(true);
    setTimeout(() => {
      loginAsGuest();
      navigate("/");
    }, 800);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("rate limit")) {
          throw new Error("Limite de tentativas excedido. Por favor, aguarde alguns minutos ou use o 'Acesso de Teste' abaixo.");
        }
        throw signUpError;
      }
      if (!data.user) throw new Error("Erro ao criar usuário.");

      // Create user record in our custom users table
      const { error: userError } = await supabase
        .from("users")
        .insert({
          id: data.user.id,
          name: name,
          email: email,
        });
      
      if (userError) {
        console.error("User table error:", userError);
        throw new Error(`Erro ao salvar perfil: ${userError.message}. Certifique-se de que a tabela 'users' existe.`);
      }

      // Initialize Hype Score
      const { error: scoreError } = await supabase
        .from("hype_scores")
        .insert({
          user_id: data.user.id,
          score: 0,
          level: "Bronze",
        });
      
      if (scoreError) {
        console.error("Score table error:", scoreError);
        throw new Error(`Erro ao inicializar HYPE Score: ${scoreError.message}. Certifique-se de que a tabela 'hype_scores' existe.`);
      }

      navigate("/");
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Verifique os dados.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#00FF00] mb-6 shadow-[0_0_40px_rgba(0,255,0,0.3)]">
            <Zap className="w-8 h-8 text-black" fill="black" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">HYPE</h1>
          <p className="text-gray-400">Crie sua identidade digital no HYPE.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00FF00] transition-all"
                placeholder="Seu Nome"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00FF00] transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00FF00] transition-all"
                placeholder="•••••••• (mín. 6 caracteres)"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00FF00] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(0,255,0,0.2)]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Cadastrar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[#0A0A0B] px-4 text-gray-500 font-bold">Ou teste agora</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            {guestLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Acesso de Teste (Convidado)
                <Sparkles className="w-4 h-4 text-[#00FF00]" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 text-sm">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-[#00FF00] font-semibold hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
