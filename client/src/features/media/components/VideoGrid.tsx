import { useState } from "react";
import { Play, Trash2 } from "lucide-react";
import { ConfirmModal } from "../../permission/components/ConfirmModal";
import { useGetVideos } from "../media.queries";
import { useRemoveVideo } from "../media.mutations";
import type { Video } from "../media.types";

interface VideoGridProps {
  roomId: number;
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatRelativeDate = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const VideoGrid = ({ roomId }: VideoGridProps) => {
  const { data, isLoading, isError } = useGetVideos(roomId);
  const { mutateAsync: removeVideo, isPending } = useRemoveVideo(roomId);
  const [targetVideo, setTargetVideo] = useState<Video | null>(null);

  const handleConfirmDelete = async () => {
    if (!targetVideo) return;
    await removeVideo(targetVideo.videoId);
    setTargetVideo(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-[#1E1F25] animate-pulse aspect-video" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-[#9497a1] text-sm">Failed to load videos.</p>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-[#9497a1] text-sm">No videos in this room yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {data.results.map((video) => (
          <div
            key={video.videoId}
            className="group relative flex flex-col bg-[#1E1F25] rounded-xl overflow-hidden border border-[#424753]/5 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-[#292a2f] flex items-center justify-center">
                  <Play size={32} className="text-[#424753]" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

              {/* Duration badge */}
              {video.durationSeconds != null && (
                <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-bold text-white tracking-widest">
                  {formatDuration(video.durationSeconds)}
                </div>
              )}

              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-[#508ff8]/90 rounded-full flex items-center justify-center shadow-xl">
                  <Play size={20} className="text-white fill-white" />
                </div>
              </div>

              {/* Delete button — appears on hover */}
              <button
                onClick={() => setTargetVideo(video)}
                className="absolute top-3 right-3 p-2 bg-[#ffb4ab]/90 hover:bg-[#ffb4ab] text-[#690005] rounded-lg shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-1 group-hover:translate-y-0"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Card footer */}
            <div className="p-4 flex flex-col gap-1">
              <h3 className="font-['Manrope'] font-bold text-[#e3e1e9] line-clamp-1">{video.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#292a2f] border border-[#424753]/20 flex items-center justify-center text-[9px] font-bold text-[#acc7ff] shrink-0">
                    {video.uploadedByName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] text-[#9497a1] font-medium">{video.uploadedByName}</span>
                </div>
                <span className="text-[10px] text-[#9497a1]/60">{formatRelativeDate(video.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!targetVideo}
        onClose={() => setTargetVideo(null)}
        onConfirm={handleConfirmDelete}
        isPending={isPending}
        icon={<Trash2 size={22} className="text-[#ffb4ab]" />}
        iconBg="bg-[#93000a]/20"
        title="Delete Video"
        description={
          <>
            This action is irreversible.{" "}
            <span className="text-[#ffb4ab] font-medium">"{targetVideo?.title}"</span> will be permanently
            removed from the vault.
          </>
        }
        cancelLabel="Keep Video"
        confirmLabel="Delete Permanently"
        confirmClassName="bg-[#ffb4ab] text-[#690005] shadow-lg shadow-[#ffb4ab]/20"
      />
    </>
  );
};
