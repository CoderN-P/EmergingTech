import { toast } from "svelte-sonner";
import { supabase } from "./supabaseClient";
import { user } from "./stores";

export async function attendMeeting(meetingId: string, userId: string) {
    console.log("Attending meeting with ID:", meetingId, "for user ID:", userId);
    const { data, error } = await supabase.rpc("attend_meeting", {
        uid: userId,
        mid: meetingId
    });

    if (error) {
        toast.error("Sorry, something went wrong.");
        return false;
    } else if (data === 'Attendance recorded successfully') {
        toast.success("Successfully attended meeting!");
        user.update(u => {
            if (u) {
                u.points += 10; 
                u.current_points += 10;
            }
            return u;
        });
        
        return true;
            
    } else {
       toast.error("Unable to attend meeting.");
       return false;
    }
}