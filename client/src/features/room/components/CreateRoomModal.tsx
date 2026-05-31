import { useState, useRef, useCallback, useEffect } from "react";
import { X, Upload, ImagePlus, Info, Loader2 } from "lucide-react";
import { useCreateRoom } from "../room.mutations";
import { useUpdateRoom } from "../room.mutations";
import type { CreateRoomRequest, UpdateRoomRequest } from "../room.types";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Edit mode props
  mode?: "create" | "edit";
  roomId?: number;
  initialData?: {
    roomName: string;
    description: string;
    thumbnailUrl: string;
  };
}

export const CreateRoomModal = ({
  isOpen,
  onClose,
  mode = "create",
  roomId,
  initialData,
}: CreateRoomModalProps) => {
  const isEdit = mode === "edit";

  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createRoom, isPending: isCreating } = useCreateRoom();
  const { mutateAsync: updateRoom, isPending: isUpdating } = useUpdateRoom(roomId ?? 0);
  const isPending = isCreating || isUpdating;

  // Populate fields when opening in edit mode
  useEffect(() => {
    if (isOpen && isEdit && initialData) {
      setRoomName(initialData.roomName);
      setDescription(initialData.description);
      setThumbnailPreview(initialData.thumbnailUrl);
    }
  }, [isOpen, isEdit, initialData]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleRemoveThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation();
    setThumbnail(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!roomName.trim()) return;

    if (isEdit && roomId) {
      const payload: UpdateRoomRequest = {
        roomName: roomName.trim(),
        description: description.trim() || undefined,
        ...(thumbnail ? { thumbnail } : {}),
      };
      await updateRoom(payload);
    } else {
      if (!thumbnail) return;
      const payload: CreateRoomRequest = {
        roomName: roomName.trim(),
        description: description.trim() || undefined,
        thumbnail,
      };
      await createRoom(payload);
    }
    handleClose();
  };

  const handleClose = () => {
    setRoomName("");
    setDescription("");
    setThumbnail(null);
    setThumbnailPreview(null);
    onClose();
  };

  // Create: need name + thumbnail. Edit: need name (thumbnail optional)
  const canSubmit =
    roomName.trim().length > 0 &&
    (isEdit || thumbnail !== null) &&
    !isPending;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-[520px] bg-[#1A1B21] rounded-2xl border border-[#424753]/20 shadow-[0_32px_64px_rgba(0,0,0,0.6)] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-8 pb-6">
            <div>
              <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-[#e3e1e9]">
                {isEdit ? "Edit Room" : "Create New Room"}
              </h2>
              <p className="text-sm text-[#9497a1] mt-1">
                {isEdit
                  ? "Update the details of this vault."
                  : "Define the parameters for your next digital collection."}
              </p>
            </div>
            <button onClick={handleClose} className="text-[#9497a1] hover:text-[#e3e1e9] transition-colors mt-0.5 shrink-0">
              <X size={20} />
            </button>
          </div>

          <div className="px-8 pb-6 flex flex-col gap-5">
            {/* Room Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4F8EF7]">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Project Obsidian"
                className="w-full bg-[#0d0e13] border border-[#424753]/30 rounded-xl px-4 py-3 text-sm text-[#e3e1e9] placeholder:text-[#9497a1]/50 focus:outline-none focus:border-[#4F8EF7]/50 focus:ring-1 focus:ring-[#4F8EF7]/20 transition-all"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4F8EF7]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the contents of this vault..."
                rows={4}
                className="w-full bg-[#0d0e13] border border-[#424753]/30 rounded-xl px-4 py-3 text-sm text-[#e3e1e9] placeholder:text-[#9497a1]/50 focus:outline-none focus:border-[#4F8EF7]/50 focus:ring-1 focus:ring-[#4F8EF7]/20 transition-all resize-none"
              />
            </div>

            {/* Thumbnail upload */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4F8EF7]">
                Thumbnail {isEdit && <span className="text-[#9497a1] normal-case tracking-normal font-normal">(leave unchanged to keep current)</span>}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`relative w-full h-[140px] rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
                  ${isDragging
                    ? "border-[#4F8EF7] bg-[#4F8EF7]/10"
                    : thumbnailPreview
                    ? "border-[#424753]/30"
                    : "border-[#424753]/30 hover:border-[#4F8EF7]/50 hover:bg-[#4F8EF7]/5"
                  }`}
              >
                {thumbnailPreview ? (
                  <>
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e13]/60 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Upload size={14} /> Replace image
                      </span>
                    </div>
                    {/* Only show remove if it's a newly selected file (not the existing URL) */}
                    {thumbnail && (
                      <button
                        onClick={handleRemoveThumbnail}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#0d0e13]/80 border border-[#424753]/40 flex items-center justify-center text-[#9497a1] hover:text-[#e3e1e9] transition-colors"
                      >
                        <X size={13} />
                      </button>
                    )}
                    {thumbnail && (
                      <span className="absolute bottom-2 left-3 text-[10px] text-[#e3e1e9]/70 font-medium truncate max-w-[80%]">
                        {thumbnail.name}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#9497a1]">
                    <div className="w-10 h-10 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center text-[#acc7ff]">
                      <ImagePlus size={20} strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-[#e3e1e9]/70">
                        Drop an image or <span className="text-[#4F8EF7]">browse</span>
                      </p>
                      <p className="text-[10px] text-[#9497a1]/60 mt-0.5">PNG, JPG, WEBP</p>
                    </div>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
            </div>

            {/* Info banner — create mode only */}
            {!isEdit && (
              <div className="flex items-start gap-3 bg-[#4F8EF7]/8 border border-[#4F8EF7]/15 rounded-xl px-4 py-3">
                <Info size={15} className="text-[#4F8EF7] mt-0.5 shrink-0" />
                <p className="text-xs text-[#9497a1] leading-relaxed">
                  Rooms are private by default. You can configure permission protocols once the vault is initialized.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-8 py-6 pt-2">
            <button onClick={handleClose} className="px-5 py-2.5 text-sm font-semibold text-[#9497a1] hover:text-[#e3e1e9] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2.5 text-sm font-bold bg-[#4F8EF7] text-white rounded-xl hover:bg-[#6ba3f9] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Room")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
