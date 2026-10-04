import { supabase } from "./supabaseClient";

export async function getCurrentLeaderboard(page: number) {
    const pageSize = 10;

    const { data, error } = await supabase
        .from('Users')
        .select('id, created_at, name, points, current_points, profile_picture, email, officer')
        .order('current_points', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
        console.error("Error fetching current leaderboard:", error);
        return { users: [], error };
    }

    return { users: data || [], error: null };
}
