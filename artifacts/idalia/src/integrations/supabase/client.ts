// Compatibility shim: supabase has been replaced by Clerk + Express API.
// Any remaining import here is a migration leftover and should call apiFetch instead.
export const supabase: any = new Proxy({}, {
  get() {
    throw new Error("Supabase has been removed. Use apiFetch from @/lib/api instead.");
  },
});
export const isSupabaseConfigured = false;
