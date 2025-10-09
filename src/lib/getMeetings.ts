import { supabase } from "./supabaseClient";


export async function getMeetings(){
    const { data, error } = await supabase
        .from('Meetings')
        .select('id, date')
        .order('date', { ascending: false });

    if (error) {
        console.error("Error fetching leaderboard:", error);
        return { meetings: [], error };
    }

    console.log(data)

    return { meetings: data || [], error: null };
}