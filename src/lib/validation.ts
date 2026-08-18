import { z } from "zod";
import { TOPICS } from "@/types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email is too long")
    .regex(emailRegex, "Invalid email address"),
  name: z.string().max(100, "Name is too long").optional(),
  topics: z.array(z.enum(TOPICS)).min(1, "Select at least one topic").max(9, "Too many topics"),
  deliveryTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):00$/, "Delivery time must be in HH:00 format (00:00-23:00)"),
});

export const preferenceUpdateSchema = z.object({
  topics: z
    .array(z.enum(TOPICS))
    .min(1, "Select at least one topic")
    .max(9, "Too many topics")
    .optional(),
  deliveryTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):00$/, "Delivery time must be in HH:00 format (00:00-23:00)")
    .optional(),
});

export const unsubscribeSchema = z.object({
  email: z.string().min(1, "Email is required").regex(emailRegex, "Invalid email address"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type PreferenceUpdateInput = z.infer<typeof preferenceUpdateSchema>;
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;
