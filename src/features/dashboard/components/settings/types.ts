import { z } from "zod";
import { ProfileSchema } from "@/schemas";

// Extend ProfileSchema if we need email for the form type, though email is disabled in the UI
export const profileFormSchema = ProfileSchema.extend({
  email: z.string().optional().or(z.literal("")),
});

export type ProfileForm = z.infer<typeof profileFormSchema>;

export const EMPTY_PROFILE_FORM: ProfileForm = {
  firstName: "",
  lastName: "",
  email: "",
};
