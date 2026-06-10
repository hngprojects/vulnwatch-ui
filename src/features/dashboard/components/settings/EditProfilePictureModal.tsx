import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Clock } from "lucide-react";

type EditProfilePictureModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditProfilePictureModal({ open, onOpenChange }: EditProfilePictureModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="top-0 left-0 w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[85vh] sm:w-[90vw] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-[#E5E7EB] sm:p-6">
        <div className="relative flex h-full flex-col px-4 pb-5 pt-6 sm:p-0">
          <DialogClose aria-label="Close profile picture modal" className="cursor-pointer absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-[#F3F4F6]">
            <X className="h-5 w-5" />
          </DialogClose>

          <DialogHeader className="mt-10 space-y-2 text-left sm:mt-0">
            <DialogTitle className="text-xl font-semibold text-[#2B2B2B] sm:text-2xl">
              Upload Profile Picture
            </DialogTitle>
            <DialogDescription className="text-sm text-[#666666]">
              Choose a new picture for your workspace profile.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-4">
              <Clock size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-medium text-[#2B2B2B] mb-2">Coming Soon</h3>
            <p className="text-sm text-[#666666] max-w-[250px]">
              The ability to upload profile pictures is currently being finalized by our team and will be available shortly.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="py-2.5 px-5 text-sm font-semibold text-[#666666] border border-[#EDEDED] rounded-lg transition-colors hover:bg-[#F9FAFB]"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
