import { useState, useEffect, useRef } from "react";
import { Search, Bell, Settings, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchRooms } from "../../features/search/search.queries";
import type { SearchedRoom } from "../../features/search/search.types";

// Simple debounce hook
const useDebounce = (value: string, delay: number): string => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export const NavBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useSearchRooms(debouncedQuery);

  // Open dropdown when we have a query
  useEffect(() => {
    setIsOpen(debouncedQuery.trim().length > 0);
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (room: SearchedRoom) => {
    navigate(`/rooms/${room.roomId}`);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
  };

  const results = data?.results ?? [];

  return (
    <header className="fixed top-0 w-full z-30 h-16 flex justify-between items-center px-6 lg:pl-[244px] bg-[#0D0E13]/80 backdrop-blur-md border-b border-[#424753]/15">
      {/* Mobile wordmark */}
      <div className="flex items-center gap-4 lg:hidden">
        <span className="text-2xl font-black tracking-[-0.04em] text-[#e3e1e9] font-['Manrope']">
          Vault
        </span>
      </div>

      {/* Search bar */}
      <div ref={containerRef} className="flex-1 max-w-xl mx-4 relative">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9497a1] pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (debouncedQuery.trim().length > 0) setIsOpen(true); }}
            placeholder="Search the curated archives..."
            className="w-full bg-[#1A1B21] border-none rounded-lg py-2 pl-9 pr-9 text-sm text-[#e3e1e9] placeholder:text-[#9497a1] focus:outline-none focus:ring-1 focus:ring-[#4F8EF7]/50 transition-all duration-200"
          />
          {/* Clear button */}
          {query.length > 0 && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9497a1] hover:text-[#e3e1e9] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#1A1B21] border border-[#424753]/20 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-[#4F8EF7]/30 border-t-[#4F8EF7] rounded-full animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-[#9497a1]">No rooms found for</p>
                <p className="text-sm font-semibold text-[#e3e1e9] mt-0.5">"{debouncedQuery}"</p>
              </div>
            ) : (
              <div className="py-2 max-h-[320px] overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#424753 transparent" }}
              >
                {/* Results count */}
                <div className="px-4 py-2 border-b border-[#424753]/15">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#9497a1]">
                    {data?.count} Room{data?.count !== 1 ? "s" : ""} found
                  </span>
                </div>

                {results.map((room) => (
                  <button
                    key={room.roomId}
                    onClick={() => handleSelect(room)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#292a2f] transition-colors text-left group"
                  >
                    {/* Room initial tile */}
                    <div className="w-8 h-8 rounded-lg bg-[#4F8EF7]/10 flex items-center justify-center shrink-0 group-hover:bg-[#4F8EF7]/20 transition-colors">
                      <span className="text-xs font-bold text-[#4F8EF7]">
                        {room.roomName.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Room info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#e3e1e9] truncate">
                        {room.roomName}
                      </p>
                      {room.description && (
                        <p className="text-[10px] text-[#9497a1] truncate mt-0.5">
                          {room.description}
                        </p>
                      )}
                    </div>

                    {/* Creator */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#292a2f] border border-[#424753]/30 flex items-center justify-center text-[8px] font-bold text-[#acc7ff]">
                        {room.creatorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[10px] text-[#9497a1] hidden sm:block">
                        {room.creatorName}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-4">
        <button className="text-[#9497a1] hover:text-[#4F8EF7] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#acc7ff] rounded-full border-2 border-[#0d0e13]" />
        </button>
        <button className="text-[#9497a1] hover:text-[#4F8EF7] transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};
