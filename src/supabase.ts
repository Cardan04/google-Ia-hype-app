import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://huavlihrvsrskgbmrltv.supabase.co";
const supabaseAnonKey = "sb_publishable_7EPN_O4Udj_NEe5iFuqeVg_I-qdCVhh";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
