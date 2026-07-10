// import { createClient, type SupabaseClient } from "@supabase/supabase-js";
// import type { Database } from "../types/database.types";

// type AppSupabaseClient = SupabaseClient<Database> | null;

// export default defineNuxtPlugin<{ supabase: AppSupabaseClient }>(() => {
//     const config = useRuntimeConfig();
//     const supabaseUrl = config.public.supabaseUrl;
//     const supabaseAnonKey = config.public.supabaseAnonKey;

//     if (!supabaseUrl || !supabaseAnonKey) {
//         console.warn("Supabase client is missing public runtime config.");
//         return {
//             provide: {
//                 supabase: null,
//             },
//         };
//     }

//     const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

//     return {
//         provide: {
//             supabase,
//         },
//     };
// });
