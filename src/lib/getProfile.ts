import { supabase } from "./supabaseClient";
import type { Meeting } from "./types";
import type { User } from "./types";

type AttendanceRow = {
    meeting_id: string;
    attended_at: string;
};

export type AttendedMeeting = {
    meeting_id: string;
    attended_at: string;
    meeting: Meeting | null;
};

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from("Users")
        .select("id, created_at, name, email, profile_picture, officer, current_points, points")
        .eq("id", userId);

    if (error) {
        console.error("Error fetching profile:", error);
        return { profile: null as User | null, error };
    }

    return { profile: (data?.[0] as User | undefined) ?? null, error: null };
}

export async function getAttendedMeetings(userId: string) {
    const { data: attendanceRows, error: attendanceError } = await supabase
        .from("Attendance")
        .select("meeting_id, attended_at")
        .eq("user_id", userId)
        .order("attended_at", { ascending: false });

    if (attendanceError) {
        console.error("Error fetching attended meetings:", attendanceError);
        return { meetings: [] as AttendedMeeting[], error: attendanceError };
    }
    
    console.log(attendanceRows);

    const rows = (attendanceRows ?? []) as AttendanceRow[];
    const meetingIds = [...new Set(rows.map((row) => row.meeting_id))];

    if (meetingIds.length === 0) {
        return { meetings: [], error: null };
    }

    const { data: meetingRows, error: meetingError } = await supabase
        .from("Meetings")
        .select("id, date")
        .in("id", meetingIds);

    if (meetingError) {
        console.error("Error fetching meeting details:", meetingError);
        return { meetings: [] as AttendedMeeting[], error: meetingError };
    }

    const meetingsById = new Map((meetingRows ?? []).map((meeting) => [meeting.id, meeting]));

    return {
        meetings: rows.map((row) => ({
            meeting_id: row.meeting_id,
            attended_at: row.attended_at+'Z',
            meeting: meetingsById.get(row.meeting_id) ?? null
        })),
        error: null
    };
}
