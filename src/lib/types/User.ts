import { z } from "zod";


export const userSchema = z.object({
    id: z.uuid(),
    created_at: z.string(), // timestamp with mode: 'string'
    name: z.string(),
    email: z.string(),
    profile_picture: z.string(),
    officer: z.boolean().default(false),
    current_points: z.number().int().default(0),
    points: z.number().int().default(0),
});


export type User = z.infer<typeof userSchema>;