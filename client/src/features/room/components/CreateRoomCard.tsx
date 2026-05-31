import { Plus } from "lucide-react";

interface CreateRoomCardProps {
  onClick: () => void;
}

export const CreateRoomCard = ({ onClick }: CreateRoomCardProps) => {
  return (
    <button
      onClick={onClick}
      className="col-span-1 md:col-span-2 group relative overflow-hidden flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#424753]/30 bg-[#1E1F25]/20 hover:bg-[#1E1F25]/40 hover:border-[#4F8EF7]/50 transition-all duration-500 w-full h-full"
    >
      {/* Plus icon circle */}
      <div className="w-16 h-16 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center text-[#acc7ff] group-hover:scale-110 group-hover:bg-[#4F8EF7] group-hover:text-white transition-all duration-300">
        <Plus size={28} strokeWidth={1.75} />
      </div>

      {/* Text */}
      <div className="text-center">
        <span className="block text-xl font-bold font-['Manrope'] text-[#e3e1e9]">
          Create a new room
        </span>
        <span className="text-sm text-[#9497a1]">
          Define a new curated space for your assets
        </span>
      </div>

      {/* Decorative glow blob */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#4F8EF7]/5 rounded-full blur-3xl group-hover:bg-[#4F8EF7]/10 transition-colors pointer-events-none" />
    </button>
  );
};
