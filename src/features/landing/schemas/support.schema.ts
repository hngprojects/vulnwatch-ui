import { z } from "zod";
import { EmailSchema } from "@/schemas";

const nameRegex = /^[\p{L}\s'-]+$/u;
const nameMessage = "Only letters, spaces, hyphens, and apostrophes allowed — international characters supported";
const phoneRegex = /^(?=.*\d)[+0-9\s()'-]{7,25}$/;

export const supportSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer").regex(nameRegex, nameMessage),
  email: EmailSchema.shape.email,
  phone: z.string().trim().min(7, "Phone number must be at least 7 characters").max(25, "Phone number must be at most 25 characters").regex(phoneRegex, "Invalid phone number format"),
  requestType: z.string().min(1, "Please select a service"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long"),
});

export type SupportFormData = z.infer<typeof supportSchema>;
