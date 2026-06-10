import { useState } from "react";
import { Mail, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { MonitoredEmail } from "../../types/compliance.types";
import { useActiveDomainId, useDeleteMonitoredEmail } from "../../hooks/use-compliance";

export function BreachCard({ breach }: { breach: MonitoredEmail }) {
  const isSafe = !breach.isBreached || breach.breachCount === 0;
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { activeDomainId } = useActiveDomainId();
  const { mutateAsync: deleteEmail, isPending: isDeleting } = useDeleteMonitoredEmail();

  const handleDelete = async () => {
    if (!activeDomainId) return;
    try {
      await deleteEmail({ domainId: activeDomainId, emailId: breach.id });
      toast.success("Email removed from monitoring");
      setIsDialogOpen(false);
    } catch {
      // Error handled by react-query / global toast
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-brand-light-gray bg-brand-dashboard-bg p-6">
        {/* Top row: email + status */}
        <div className="flex flex-wrap items-center gap-4">
          <Mail className="h-6 w-6 shrink-0 text-brand-dark" strokeWidth={1.5} />
          <span className="text-base font-normal text-brand-dark">
            {breach.emailAddress}
          </span>
          {/* Status badge */}
          {isSafe ? (
            <span className="rounded-[9.6px] bg-brand-green/10 text-brand-green px-3.5 py-2 text-sm font-medium leading-none flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              No Breaches
            </span>
          ) : (
            <span className="rounded-[9.6px] bg-brand-failed-bg text-brand-failed-text px-3.5 py-2 text-sm font-medium leading-none flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {breach.breachCount} Breaches Detected
            </span>
          )}
        </div>

        {/* Breach date info if available */}
        {breach.latestDetectionAt && (
          <p className="text-sm text-brand-gray tracking-wide">
            Latest Detection:{" "}
            <span>
              {new Date(breach.latestDetectionAt).toLocaleString()}
            </span>
          </p>
        )}

        {/* View Details -> Remove */}
        <div>
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="rounded-lg border border-red-500 px-6 py-3.5 text-base font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[401px] p-6 gap-6 rounded-xl bg-white border-0 shadow-xl [&>button]:hidden">
          <DialogHeader className="p-0 m-0 space-y-0 text-left">
            <DialogTitle className="text-xl font-semibold leading-5 tracking-tight text-brand-dark">
              Are you sure you want to remove?
            </DialogTitle>
            <DialogDescription className="sr-only">
              This will remove {breach.emailAddress} from monitoring.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-row items-center gap-4 w-full">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
              className="flex-1 flex flex-row justify-center items-center px-6 py-4 h-12 border border-brand-light-gray rounded-lg text-base font-medium leading-none tracking-tight text-brand-gray hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 flex flex-row justify-center items-center px-6 py-4 h-12 bg-primary rounded-lg text-base font-medium leading-none tracking-tight text-white hover:bg-primary-hover transition-colors gap-2"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
