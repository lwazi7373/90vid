import { Search, Bell, Settings } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";

export const NavBar = () => {
  const { } = useAuth();

  return (
    <header className="fixed top-0 w-full z-30 h-16 flex justify-between items-center px-6 lg:pl-[244px] bg-[#0D0E13]/80 backdrop-blur-md border-b border-[#424753]/15">
      {/* Mobile wordmark */}
      <div className="flex items-center gap-4 lg:hidden">
        <span className="text-2xl font-black tracking-[-0.04em] text-[#e3e1e9] font-['Manrope']">
          Vault
        </span>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9497a1] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search the curated archives..."
            className="w-full bg-[#1A1B21] border-none rounded-lg py-2 pl-9 pr-4 text-sm text-[#e3e1e9] placeholder:text-[#9497a1] focus:outline-none focus:ring-1 focus:ring-[#4F8EF7]/50 transition-all duration-200"
          />
        </div>
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
