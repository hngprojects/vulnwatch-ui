import { z } from "zod";

// Base rules for names: Letters, spaces, hyphens, and apostrophes only
const nameRegex = /^[A-Za-z\s-']+$/;
const nameMessage = "Only letters, spaces, hyphens, and apostrophes allowed";

// Reusable strict password schema
export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must have at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol");

// Reusable strict email schema
export const EmailSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email address format"),
});

export const RegisterSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50).regex(nameRegex, nameMessage),
  last_name: z.string().trim().min(1, "Last name is required").max(50).regex(nameRegex, nameMessage),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address format"),
  password: passwordSchema,
});

export const ProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50).regex(nameRegex, nameMessage),
  lastName: z.string().trim().min(1, "Last name is required").max(50).regex(nameRegex, nameMessage),
});

export const SecuritySettingsSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100).regex(nameRegex, nameMessage),
  company: z.string().trim().min(1, "Company is required").max(100),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address format"),
});
