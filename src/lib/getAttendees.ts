import {supabase} from "$lib/supabaseClient";

export async function getAttendees(meetingId: string) {
    const { data, error } = await supabase.rpc("attendees", {
        mid: meetingId
    });
    
    if (error) {
        console.error("Error fetching attendees:", error);
        return { users: [], error  };
    }
    
    console.log(data)
    
    return { users: data || [], error: null };

}