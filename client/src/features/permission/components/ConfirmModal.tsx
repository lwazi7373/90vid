import { Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;

  // Content
  icon: React.ReactNode;
  iconBg: string;       // e.g. "bg-error-container/20"
  title: string;
  description: React.ReactNode;

  // Button labels + style
  cancelLabel?: string;
  confirmLabel: string;
  confirmClassName: string; // full tailwind string for confirm button
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  icon,
  iconBg,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  confirmClassName,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md bg-[#1E1F25] rounded-xl border border-[#424753]/15 shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Body */}
          <div className="p-8">
            <div className="flex items-start gap-5">
              <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                {icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-['Manrope'] text-xl font-bold tracking-tight text-[#e3e1e9]">
                  {title}
                </h3>
                <p className="text-[#9497a1] text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#292a2f]/50 px-6 py-5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-[#9497a1] hover:text-[#e3e1e9] transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] ${confirmClassName}`}
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
