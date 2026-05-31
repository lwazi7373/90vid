import { Image, Video, Upload, Pencil, Trash2 } from "lucide-react";
import type { Room, MyRoom, PermittedRoom } from "../room.types";

export type RoomCardData = Room | MyRoom | PermittedRoom;

const hasCreator = (room: RoomCardData): room is Room | PermittedRoom =>
  "creatorName" in room && typeof (room as Room).creatorName === "string";

const isPermittedRoom = (room: RoomCardData): room is PermittedRoom =>
  "canUpload" in room;

interface PermissionBadgeProps {
  icon: React.ReactNode;
  label: string;
  granted: boolean;
}

const PermissionBadge = ({ icon, label, granted }: PermissionBadgeProps) => (
  <span
    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all
      ${granted
        ? "bg-[#0d0e13]/70 border-[#424753]/40 text-[#e3e1e9]"
        : "bg-[#0d0e13]/40 border-[#424753]/20 text-[#9497a1]/40 line-through"
      }`}
  >
    <span className={granted ? "text-[#4F8EF7]" : "text-[#9497a1]/30"}>
      {icon}
    </span>
    {label}
  </span>
);

interface RoomCardProps {
  room: RoomCardData;
  onClick?: (roomId: number) => void;
}

export const RoomCard = ({ room, onClick }: RoomCardProps) => {
  const permitted = isPermittedRoom(room);

  return (
    <div
      onClick={() => onClick?.(room.roomId)}
      className="group relative overflow-hidden rounded-xl bg-[#1E1F25] border border-[#424753]/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_15px_-5px_rgba(79,142,247,0.4)] cursor-pointer"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={room.thumbnailUrl}
          alt={room.roomName}
          className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e13] via-[#0d0e13]/40 to-transparent" />
      </div>

      {/* Permission badges — top left, PermittedRoom only */}
      {permitted && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
          <PermissionBadge
            icon={<Upload size={8} strokeWidth={2.5} />}
            label="Upload"
            granted={room.canUpload === 1}
          />
          <PermissionBadge
            icon={<Pencil size={8} strokeWidth={2.5} />}
            label="Edit"
            granted={room.canEditRoom === 1}
          />
          <PermissionBadge
            icon={<Trash2 size={8} strokeWidth={2.5} />}
            label="Delete"
            granted={room.canDelete === 1}
          />
        </div>
      )}

      {/* Card content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
        {/* Room name */}
        <h3 className="font-['Manrope'] text-2xl font-bold leading-tight mb-2 text-[#e3e1e9]">
          {room.roomName}
        </h3>

        {/* Description */}
        {room.description && (
          <p className="text-[#9497a1] text-sm line-clamp-2 mb-6 font-['Inter']">
            {room.description}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-[#424753]/20 pt-4">
          {/* Creator — Room & PermittedRoom only */}
          {hasCreator(room) ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#292a2f] border border-[#424753]/30 flex items-center justify-center text-[10px] font-bold text-[#acc7ff] shrink-0">
                {room.creatorName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-[#e3e1e9]">
                {room.creatorName}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#acc7ff]/60">
              My Room
            </span>
          )}

          {/* Image + video counts */}
          <div className="flex items-center gap-3 text-[10px] font-bold text-[#9497a1]">
            <span className="flex items-center gap-1">
              <Image size={12} strokeWidth={2} />
              {room.imageCount}
            </span>
            <span className="flex items-center gap-1">
              <Video size={12} strokeWidth={2} />
              {room.videoCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};