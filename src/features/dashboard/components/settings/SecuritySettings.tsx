"use client";

import { useState, type ChangeEvent } from "react";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { privateApi } from "@/lib/axios";
import { SecuritySettingsSchema } from "@/schemas";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ChangePasswordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ChangePasswordModal = ({ open, onOpenChange }: ChangePasswordModalProps) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const toggleShow = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const closeModal = () => {
    if (loading) return;
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const result = SecuritySettingsSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      await privateApi.post("/api/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmPassword,
      });
      toast.success("Password updated successfully.");
      resetForm();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        isAxiosError(err) ? err.response?.data?.error?.message ?? err.response?.data?.message : undefined;
      toast.error(message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : closeModal())}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[85vh] sm:w-[70vw] sm:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-[#E5E7EB] sm:p-6"
      >
        <div className="relative flex h-full flex-col overflow-y-auto px-4 pb-5 pt-6 sm:p-0">
          <DialogClose
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-[#F3F4F6]"
            aria-label="Close password modal"
          >
            <X className="h-5 w-5" />
          </DialogClose>

          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
            <DialogHeader className="mt-10 space-y-2 text-left sm:mt-0">
              <DialogTitle className="text-xl leading-[42px] font-semibold text-[#2B2B2B] md:text-2xl md:leading-[38px]">
                Change Password
              </DialogTitle>
              <DialogDescription className="text-[16px] leading-7 text-[#666666]">
                Update your password using your current password and a new secure password.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="currentPassword" className="mb-2 block text-[16px] font-normal text-[#2B2B2B]">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showPasswords.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    autoComplete="current-password"
                    placeholder="Current password"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-3 pr-10 text-sm text-[#2B2B2B] outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow("currentPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                    aria-label={showPasswords.currentPassword ? "Hide password" : "Show password"}
                  >
                    {showPasswords.currentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-2 block text-[16px] font-normal text-[#2B2B2B]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    autoComplete="new-password"
                    placeholder="New password"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-3 pr-10 text-sm text-[#2B2B2B] outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow("newPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                    aria-label={showPasswords.newPassword ? "Hide password" : "Show password"}
                  >
                    {showPasswords.newPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-[16px] font-normal text-[#2B2B2B]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-3 pr-10 text-sm text-[#2B2B2B] outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow("confirmPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                    aria-label={showPasswords.confirmPassword ? "Hide password" : "Show password"}
                  >
                    {showPasswords.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-7">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="min-w-[140px] rounded-lg border border-[#EDEDED] px-5 py-3 text-sm font-semibold text-[#666666] transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:text-[16px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex min-w-[190px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[16px]"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? "Updating..." : "Update password"}
                </button>
              </div>
            </div>
          </div>

          <DialogClose className="sr-only">Close</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
