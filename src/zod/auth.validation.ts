import { email, z } from "zod"

export const LoginZodSchema = z.object({
    email: z.email("Invalid email address"),
    password: z
        .string("Password must be a string")
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters")
})

export type ILoginPayload = z.infer<typeof LoginZodSchema>