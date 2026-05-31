import { useNavigate } from "react-router-dom";
import { NavBar } from "../../../shared/Components/NavBar";
import { SideBar } from "../../../shared/Components/SideBar";
import { RoomCard } from "../components/RoomCard";
import { useGetRooms } from "../room.queries";

export const AllRooms = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetRooms();

  const handleRoomClick = (roomId: number) => {
    navigate(`/rooms/${roomId}`);
  };

  return (
    <div className="bg-[#0d0e13] min-h-screen text-[#e3e1e9] font-['Inter']">
      <SideBar />
      <NavBar />

      <main className="lg:pl-[220px] pt-16 min-h-screen">
        <div className="max-w-[1400px] mx-auto p-8 lg:p-12">

          {/* Hero header */}
          <header className="mb-12">
            <h2 className="font-['Manrope'] text-5xl font-extrabold tracking-[-0.04em] text-[#e3e1e9] mb-2">
              Discover
            </h2>
            <p className="text-[#9497a1] max-w-2xl font-['Inter'] leading-relaxed">
              Explore high-value digital artifacts curated for the obsidian vault. A private
              gallery of inspiration across architecture, technology, and nature.
            </p>
          </header>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-[420px]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#1E1F25] border border-[#424753]/10 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <span className="material-symbols-outlined text-5xl text-[#9497a1] mb-4">
                error_outline
              </span>
              <p className="text-[#9497a1] text-sm">
                Failed to load rooms. Please try again later.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && data?.results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <span className="material-symbols-outlined text-5xl text-[#9497a1] mb-4">
                folder_open
              </span>
              <p className="text-[#9497a1] text-sm">
                No rooms have been created yet.
              </p>
            </div>
          )}

          {/* Room grid */}
          {!isLoading && !isError && data && data.results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-[420px]">
              {data.results.map((room) => (
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
    </div>
  );
};
