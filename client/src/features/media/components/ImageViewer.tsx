import { X } from "lucide-react";
import type { Image } from "../media.types";

interface ImageViewerProps {
  image: Image | null;
  onClose: () => void;
}

export const ImageViewer = ({ image, onClose }: ImageViewerProps) => {
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0d0e13]/95 backdrop-blur-xl">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 h-20 shrink-0">
        <span className="font-['Manrope'] text-xl font-black tracking-[-0.04em] text-[#e3e1e9]">
          The Vault
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-[#292a2f]/40 hover:bg-[#292a2f] transition-colors rounded-lg group"
        >
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#9497a1] group-hover:text-[#e3e1e9]">
            Close
          </span>
          <X size={16} className="text-[#9497a1] group-hover:text-[#e3e1e9]" />
        </button>
      </header>

      {/* Image */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-4 overflow-hidden">
        <div className="relative w-full max-w-7xl flex justify-center items-center rounded-xl overflow-hidden bg-[#1a1b21] shadow-[0_24px_48px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-[#424753]/15">
          <img
            src={image.fileUrl}
            alt={`Image ${image.imageId}`}
            className="max-h-[75vh] w-auto object-contain select-none"
          />
        </div>

        {/* Meta */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#9497a1]">Uploaded by</span>
              <span className="text-sm font-semibold text-[#acc7ff]">{image.uploadedByName}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-[#424753]" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#9497a1]">On</span>
              <span className="text-sm font-medium text-[#e3e1e9]">
                {new Date(image.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
