import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "../../permission/components/ConfirmModal";
import { ImageViewer } from "./ImageViewer";
import { useGetImages } from "../media.queries";
import { useRemoveImage } from "../media.mutations";
import type { Image } from "../media.types";

interface ImageGridProps {
  roomId: number;
}

export const ImageGrid = ({ roomId }: ImageGridProps) => {
  const { data, isLoading, isError } = useGetImages(roomId);
  const { mutateAsync: removeImage, isPending } = useRemoveImage(roomId);
  const [targetImage, setTargetImage] = useState<Image | null>(null);
  const [viewingImage, setViewingImage] = useState<Image | null>(null);

  const handleConfirmDelete = async () => {
    if (!targetImage) return;
    await removeImage(targetImage.imageId);
    setTargetImage(null);
  };

  if (isLoading) {
    return (
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gridAutoRows: "200px" }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`rounded-xl bg-[#1E1F25] animate-pulse ${i % 3 === 2 ? "row-span-2" : ""}`} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-[#9497a1] text-sm">Failed to load images.</p>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-[#9497a1] text-sm">No images in this room yet.</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gridAutoRows: "200px" }}
      >
        {data.results.map((image, i) => (
          <div
            key={image.imageId}
            onClick={() => setViewingImage(image)}
            className={`group relative overflow-hidden rounded-xl bg-[#292a2f] cursor-pointer ${i % 3 === 2 ? "row-span-2" : ""}`}
          >
            <img
              src={image.thumbnailUrl ?? image.fileUrl}
              alt={`Image ${image.imageId}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-[#0d0e13]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); setTargetImage(image); }}
                className="absolute top-4 right-4 p-2 bg-[#ffb4ab]/20 text-[#ffb4ab] hover:bg-[#ffb4ab]/30 rounded-lg backdrop-blur-md transition-colors"
              >
                <Trash2 size={18} />
              </button>

              {/* Uploader info */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#292a2f] border border-[#424753]/30 flex items-center justify-center text-[9px] font-bold text-[#acc7ff] shrink-0">
                  {image.uploadedByName.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] text-[#9497a1]">
                  Uploaded by @{image.uploadedByName}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image viewer */}
      <ImageViewer
        image={viewingImage}
        onClose={() => setViewingImage(null)}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!targetImage}
        onClose={() => setTargetImage(null)}
        onConfirm={handleConfirmDelete}
        isPending={isPending}
        icon={<Trash2 size={22} className="text-[#ffb4ab]" />}
        iconBg="bg-[#93000a]/20"
        title="Delete Image"
        description={
          <>
            This action is irreversible. This image will be{" "}
            <span className="text-[#ffb4ab] font-medium">permanently deleted</span> from the vault.
          </>
        }
        cancelLabel="Keep Image"
        confirmLabel="Delete Permanently"
        confirmClassName="bg-[#ffb4ab] text-[#690005] shadow-lg shadow-[#ffb4ab]/20"
      />
    </>
  );
};