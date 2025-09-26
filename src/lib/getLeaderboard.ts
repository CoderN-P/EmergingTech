import { supabase } from "./supabaseClient";


export async function getLeaderboard(page: number){
    const pageSize = 10;

    const { data, error } = await supabase
        .from('Users')
        .select('id, name, points, profile_picture')
        .order('points', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
    
    if (error) {
        console.error("Error fetching leaderboard:", error);
        return { users: [], error };
    }
    
    console.log(data)
    
    return { users: data || [], error: null };
}