import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../../../shared/Components/NavBar";
import { SideBar } from "../../../shared/Components/SideBar";
import { RoomCard } from "../components/RoomCard";
import { CreateRoomCard } from "../components/CreateRoomCard";
import { CreateRoomModal } from "../components/CreateRoomModal";
import { useGetMyRooms } from "../room.queries";

export const UsersRooms = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetMyRooms();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRoomClick = (roomId: number) => {
    navigate(`/rooms/${roomId}`);
  };

  return (
    <div className="bg-[#0d0e13] min-h-screen text-[#e3e1e9] font-['Inter']">
      <SideBar />
      <NavBar />

      <main className="lg:pl-[220px] pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">

          {/* Page header */}
          <div className="mb-12 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#acc7ff]">
              Private Collection
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold font-['Manrope'] tracking-tight text-[#e3e1e9]">
              My Rooms
            </h2>
            <p className="text-[#9497a1] max-w-2xl font-['Inter'] leading-relaxed">
              Explore high-value digital artifacts curated for the obsidian vault. A private
              gallery of inspiration across architecture, technology, and nature.
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[280px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-xl bg-[#1E1F25] border border-[#424753]/10 animate-pulse ${i === 0 ? "md:col-span-2" : ""}`}
                />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <span className="text-5xl mb-4">⚠</span>
              <p className="text-[#9497a1] text-sm">
                Failed to load your rooms. Please try again later.
              </p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[280px]">
              <CreateRoomCard onClick={() => setIsModalOpen(true)} />

              {data?.results.map((room) => (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  onClick={handleRoomClick}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};