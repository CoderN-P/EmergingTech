import { z } from "zod";

export const meetingSchema = z.object({
    id: z.string(),
    date: z.string(), // timestamp with mode: 'string'
});


export type Meeting = z.infer<typeof meetingSchema>;