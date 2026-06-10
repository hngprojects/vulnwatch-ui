"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useProfile } from "../../hooks/useProfile";
import { profileService } from "../../services/profile.service";
import DeleteAccountSection from "./DeleteAccountSection";
import EditProfilePictureModal from "./EditProfilePictureModal";
import PersonalInfoCard from "./PersonalInfoCard";
import SettingsErrorState from "./SettingsErrorState";
import SettingsSectionSkeleton from "./SettingsSectionSkeleton";
import { profileFormSchema, type ProfileForm } from "./types";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <h2 className="text-xl font-semibold text-[#2B2B2B]">{title}</h2>
      <p className="text-[14px] leading-6 text-[#666666] sm:text-[16px]">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  checkmark = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  checkmark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-[#CCCCCC] bg-white px-3 text-left text-sm text-[#2B2B2B] transition hover:border-primary"
      aria-pressed={checked}
    >
      <span>{label}</span>
      <span
        className={`flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition ${checked ? "bg-primary" : "bg-[#E5E7EB]"
          }`}
      >
        {checkmark ? (
          <span
            className={`grid h-5 w-5 place-items-center rounded-md transition ${checked
              ? "translate-x-4 bg-primary text-white"
              : "translate-x-0 bg-white text-transparent"
              }`}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span
            className={`h-5 w-5 rounded-full bg-white transition ${checked ? "translate-x-4" : "translate-x-0"
              }`}
          />
        )}
      </span>
    </button>
  );
}

const GeneralSettings = () => {
  const router = useRouter();
  const { profile, loading, error, refetch, update } = useProfile();

  if (loading) return <SettingsSectionSkeleton label="Loading profile..." />;

  if (error) {
    return <SettingsErrorState message={error} onRetry={() => void refetch()} />;
  }

  if (!profile) {
    return <SettingsErrorState message="Profile data is unavailable." onRetry={() => void refetch()} />;
  }

  return (
    <GeneralSettingsContent
      key={profile.updatedAt}
      profile={profile}
      router={router}
      update={update}
    />
  );
};

const GeneralSettingsContent = ({
  profile,
  router,
  update,
}: {
  profile: NonNullable<ReturnType<typeof useProfile>["profile"]>;
  router: ReturnType<typeof useRouter>;
  update: ReturnType<typeof useProfile>["update"];
}) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    emailAlerts: profile.notificationPreferences?.emailAlerts ?? false,
    slackAlerts: profile.notificationPreferences?.slackAlerts ?? false,
    pushNotifications: profile.notificationPreferences?.pushNotifications ?? false,
  });

  const handleTogglePreference = (
    key: "emailAlerts" | "slackAlerts" | "pushNotifications"
  ) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [key]: !prev[key] };
      
      profileService.updateNotificationPreferences(newPrefs)
        .then(() => toast.success("Preferences updated successfully"))
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update preferences");
          setPreferences((current) => ({ ...current, [key]: prev[key] }));
        });

      return newPrefs;
    });
  };

  const initialForm: ProfileForm = useMemo(() => ({
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    email: profile.email ?? "",
  }), [profile]);

  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

  const isDirty = useMemo(() => {
    return (
      form.firstName !== initialForm.firstName ||
      form.lastName !== initialForm.lastName ||
      form.email !== initialForm.email
    );
  }, [form, initialForm]);

  const handleCancelEdit = () => {
    if (saving) return;

    setForm(initialForm);
    setErrors({});
  };

  const handleSave = async () => {
    const result = profileFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProfileForm, string>> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof ProfileForm;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const updated = await update({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });

      setForm({
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        email: updated.email ?? "",
      });

      const currentPicture = useAuthStore.getState().picture;
      useAuthStore.getState().updateProfile(
        updated.firstName,
        updated.lastName,
        updated.profilePictureUrl || currentPicture
      );
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await profileService.deleteProfile();
      toast.success("Account deleted.");
      useAuthStore.getState().logout();
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <PersonalInfoCard 
        form={form} 
        pictureUrl={profile.profilePictureUrl || useAuthStore.getState().picture} 
        saving={saving}
        isDirty={isDirty}
        errors={errors}
        onFormChange={(newForm) => {
          setForm(newForm);
          setErrors({});
        }}
        onCancel={handleCancelEdit}
        onSave={handleSave}
        onEditPicture={() => setIsPictureModalOpen(true)}
      />

      <Section
        title="Preferences"
        subtitle="Customize how VulnWatch works for you"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Toggle
            label="Email Notifications"
            checked={preferences.emailAlerts}
            onChange={() => handleTogglePreference("emailAlerts")}
          />
          <Toggle
            label="Slack Notifications"
            checked={preferences.slackAlerts}
            onChange={() => handleTogglePreference("slackAlerts")}
          />
          <Toggle
            label="Push Notifications"
            checked={preferences.pushNotifications}
            onChange={() => handleTogglePreference("pushNotifications")}
          />
        </div>
      </Section>

      <EditProfilePictureModal
        open={isPictureModalOpen}
        onOpenChange={setIsPictureModalOpen}
      />

      <DeleteAccountSection
        deleting={deleting}
        showDeleteConfirm={showDeleteConfirm}
        onShowDeleteConfirm={setShowDeleteConfirm}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default GeneralSettings;
