import React, { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { User, HypeScore } from "../types";

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  hypeScore: HypeScore | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  uid: "guest-123",
  name: "Explorador HYPE",
  email: "guest@hype.com",
  walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  createdAt: new Date().toISOString()
};

const MOCK_SCORE: HypeScore = {
  userId: "guest-123",
  score: 1250,
  level: "Silver",
  totalEvents: 12,
  updatedAt: new Date().toISOString()
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hypeScore, setHypeScore] = useState<HypeScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check local storage for guest session
    const guestSession = localStorage.getItem("hype_guest_session");
    if (guestSession === "true") {
      setIsGuest(true);
      setUser(MOCK_USER);
      setHypeScore(MOCK_SCORE);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isGuest) {
        setSupabaseUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isGuest]);

  useEffect(() => {
    if (!supabaseUser || isGuest) {
      return;
    }

    const fetchUserData = async () => {
      // Fetch user profile
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();
      
      if (userData) {
        setUser({
          uid: userData.id,
          name: userData.name,
          email: userData.email,
          walletAddress: userData.wallet_address,
          createdAt: userData.created_at
        } as User);
      }

      // Fetch hype score
      const { data: scoreData } = await supabase
        .from("hype_scores")
        .select("*")
        .eq("user_id", supabaseUser.id)
        .single();
      
      if (scoreData) {
        setHypeScore({
          userId: scoreData.user_id,
          score: scoreData.score,
          level: scoreData.level,
          updatedAt: scoreData.updated_at
        } as any);
      }
    };

    fetchUserData();

    // Set up real-time listeners
    const userChannel = supabase
      .channel("user-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "users", filter: `id=eq.${supabaseUser.id}` }, (payload) => {
        const userData = payload.new as any;
        setUser(prev => prev ? { ...prev, ...userData, uid: userData.id, walletAddress: userData.wallet_address } : null);
      })
      .subscribe();

    const scoreChannel = supabase
      .channel("score-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "hype_scores", filter: `user_id=eq.${supabaseUser.id}` }, (payload) => {
        const scoreData = payload.new as any;
        setHypeScore({
          userId: scoreData.user_id,
          score: scoreData.score,
          level: scoreData.level,
          updatedAt: scoreData.updated_at
        } as any);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(scoreChannel);
    };
  }, [supabaseUser]);

  const connectWallet = async () => {
    if (!supabaseUser) return;
    try {
      const mockAddress = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      
      const { error } = await supabase
        .from("users")
        .update({ wallet_address: mockAddress })
        .eq("id", supabaseUser.id);
      
      if (error) throw error;
      
      alert(`Wallet conectada: ${mockAddress}`);
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar wallet.");
    }
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    setUser(MOCK_USER);
    setHypeScore(MOCK_SCORE);
    localStorage.setItem("hype_guest_session", "true");
  };

  const logout = async () => {
    if (isGuest) {
      setIsGuest(false);
      setUser(null);
      setHypeScore(null);
      localStorage.removeItem("hype_guest_session");
    } else {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, hypeScore, loading, connectWallet, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
