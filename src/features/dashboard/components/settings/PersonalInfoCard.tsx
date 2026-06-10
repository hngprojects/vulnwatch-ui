import Image from "next/image";
import { Loader2, Plus } from "lucide-react";
import type { ProfileForm } from "./types";

type PersonalInfoCardProps = {
  form: ProfileForm;
  pictureUrl?: string | null;
  saving: boolean;
  isDirty: boolean;
  errors?: Partial<Record<keyof ProfileForm, string>>;
  onFormChange: (form: ProfileForm) => void;
  onCancel: () => void;
  onSave: () => void;
  onEditPicture: () => void;
};

const PersonalInfoCard = ({
  form,
  pictureUrl,
  saving,
  isDirty,
  errors,
  onFormChange,
  onCancel,
  onSave,
  onEditPicture,
}: PersonalInfoCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-brand-dark">Personal Information</h2>
      <p className="text-[16px] text-brand-gray mt-0.5">
        Update your personal details visible across the workspace.
      </p>

      <div className="flex items-center gap-4 mt-5">
        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
          {pictureUrl ? (
            <Image 
              src={pictureUrl} 
              alt="Profile" 
              width={96}
              height={96}
              className="w-full h-full object-cover" 
            />
          ) : form.firstName || form.lastName ? (
            <span className="text-2xl font-semibold text-gray-500">
              {form.firstName.charAt(0).toUpperCase()}
              {form.lastName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="40" cy="40" r="40" fill="#E5E7EB" />
              <circle cx="40" cy="30" r="13" fill="#9CA3AF" />
              <ellipse cx="40" cy="68" rx="22" ry="16" fill="#9CA3AF" />
            </svg>
          )}
        </div>
        
        <button
          onClick={onEditPicture}
          className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-[16px] font-semibold text-white transition-colors bg-primary cursor-pointer"
        >
          <Plus className="w-5 h-5 text-white" />
          Edit profile picture
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstNameInput" className="block text-[16px] font-normal text-brand-dark mb-1.5">First Name</label>
            <input
              id="firstNameInput"
              type="text"
              value={form.firstName}
              onChange={(e) => onFormChange({ ...form, firstName: e.target.value })}
              className={`w-full border ${errors?.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary'} rounded-lg px-3 py-2.5 text-sm text-brand-dark outline-none focus:ring-1`}
              placeholder="First name"
              aria-invalid={!!errors?.firstName}
              aria-describedby={errors?.firstName ? "firstNameError" : undefined}
            />
            {errors?.firstName && <p id="firstNameError" className="mt-1.5 text-xs text-red-500">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastNameInput" className="block text-[16px] font-normal text-brand-dark mb-1.5">Last Name</label>
            <input
              id="lastNameInput"
              type="text"
              value={form.lastName}
              onChange={(e) => onFormChange({ ...form, lastName: e.target.value })}
              className={`w-full border ${errors?.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary'} rounded-lg px-3 py-2.5 text-sm text-brand-dark outline-none focus:ring-1`}
              placeholder="Last name"
              aria-invalid={!!errors?.lastName}
              aria-describedby={errors?.lastName ? "lastNameError" : undefined}
            />
            {errors?.lastName && <p id="lastNameError" className="mt-1.5 text-xs text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="emailInput" className="block text-[16px] font-normal text-brand-dark mb-1.5">Email Address</label>
          <input
            id="emailInput"
            type="email"
            value={form.email}
            disabled
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-brand-dark bg-gray-50 outline-none opacity-70 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={!isDirty || saving}
          className="min-w-[140px] py-2.5 px-5 text-sm sm:text-[16px] font-semibold text-brand-gray border border-brand-light-gray rounded-lg transition-colors cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || !isDirty}
          className="min-w-[140px] py-2.5 px-5 text-sm sm:text-[16px] font-semibold text-white bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoCard;
