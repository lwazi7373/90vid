import { useNavigate } from "react-router-dom";
import { Mail, Phone, Calendar, Shield, Image, Video, Clock, ChevronRight, Upload, Pencil, Trash2 } from "lucide-react";
import { NavBar } from "../../../shared/Components/NavBar";
import { SideBar } from "../../../shared/Components/SideBar";
import { useAuth } from "../context/AuthContext";

const formatDuration = (totalSeconds: string): string => {
  const s = Number(totalSeconds);
  if (isNaN(s) || s === 0) return "0m";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const UserProfile = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-[#0d0e13] min-h-screen text-[#e3e1e9]">
        <SideBar />
        <NavBar />
        <main className="lg:pl-[220px] pt-16 min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#4F8EF7]/30 border-t-[#4F8EF7] rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!user) return null;

  const initial = user.userName.charAt(0).toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-[#0d0e13] min-h-screen text-[#e3e1e9] font-['Inter']">
      <SideBar />
      <NavBar />

      <main className="lg:pl-[220px] pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">

          {/* Page heading */}
          <header className="mb-10 space-y-1">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#acc7ff]">
              Account
            </span>
            <h2 className="font-['Manrope'] text-5xl font-extrabold tracking-[-0.04em] text-[#e3e1e9]">
              User Profile
            </h2>
          </header>

          {/* ── Identity card ─────────────────────────────────────────── */}
          <section className="bg-[#1E1F25] rounded-2xl border border-[#424753]/15 p-8 mb-6 flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Avatar tile */}
            <div className="shrink-0 w-32 h-32 rounded-2xl bg-[#292a2f] border border-[#4F8EF7]/30 flex items-center justify-center shadow-[0_0_32px_rgba(79,142,247,0.15)] relative">
              {/* Inner glow ring */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#4F8EF7]/20" />
              <span className="font-['Manrope'] text-6xl font-extrabold text-[#acc7ff] select-none">
                {initial}
              </span>
            </div>

            {/* Identity info */}
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              <div>
                <h3 className="font-['Manrope'] text-3xl font-extrabold tracking-tight text-[#e3e1e9]">
                  {user.userName}
                </h3>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 text-[10px] font-bold uppercase tracking-widest text-[#4F8EF7]"
                    >
                      <Shield size={9} strokeWidth={2.5} />
                      {role}
                    </span>
                  ))}
                  {user.isActive && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 text-sm text-[#9497a1]">
                  <Mail size={14} className="text-[#424753] shrink-0" />
                  {user.emailAddress}
                </div>
                {user.contactNo && (
                  <div className="flex items-center gap-2.5 text-sm text-[#9497a1]">
                    <Phone size={14} className="text-[#424753] shrink-0" />
                    {user.contactNo}
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm text-[#9497a1]">
                  <Calendar size={14} className="text-[#424753] shrink-0" />
                  Member since {memberSince}
                </div>
              </div>
            </div>
          </section>

          {/* ── Stats row ─────────────────────────────────────────────── */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Images */}
            <div className="bg-[#1E1F25] rounded-xl border border-[#424753]/15 p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center shrink-0">
                <Image size={20} className="text-[#4F8EF7]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-['Manrope'] text-2xl font-extrabold text-[#e3e1e9]">
                  {user.uploadStats.totalImages}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-[#9497a1] font-bold mt-0.5">
                  Images Uploaded
                </p>
              </div>
            </div>

            {/* Videos */}
            <div className="bg-[#1E1F25] rounded-xl border border-[#424753]/15 p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#acc7ff]/10 flex items-center justify-center shrink-0">
                <Video size={20} className="text-[#acc7ff]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-['Manrope'] text-2xl font-extrabold text-[#e3e1e9]">
                  {user.uploadStats.totalVideos}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-[#9497a1] font-bold mt-0.5">
                  Videos Uploaded
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-[#1E1F25] rounded-xl border border-[#424753]/15 p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-emerald-400" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-['Manrope'] text-2xl font-extrabold text-[#e3e1e9]">
                  {formatDuration(user.uploadStats.totalDurationSeconds)}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-[#9497a1] font-bold mt-0.5">
                  Total Duration
                </p>
              </div>
            </div>
          </section>

          {/* ── Rooms grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Created rooms */}
            <section className="bg-[#1E1F25] rounded-2xl border border-[#424753]/15 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-['Manrope'] text-lg font-bold text-[#e3e1e9]">
                  Rooms Created
                </h4>
                <span className="text-[10px] bg-[#292a2f] px-2 py-0.5 rounded text-[#9497a1] font-bold">
                  {user.rooms.created.length}
                </span>
              </div>

              {user.rooms.created.length === 0 ? (
                <p className="text-xs text-[#9497a1] py-6 text-center">
                  You haven't created any rooms yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {user.rooms.created.map((room) => (
                    <button
                      key={room.roomId}
                      onClick={() => navigate(`/rooms/${room.roomId}`)}
                      className="w-full flex items-center justify-between p-4 bg-[#0d0e13] hover:bg-[#292a2f] rounded-xl border border-[#424753]/10 hover:border-[#424753]/30 transition-all duration-200 group text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#4F8EF7]/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#4F8EF7]">
                            {room.roomName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#e3e1e9] truncate">
                            {room.roomName}
                          </p>
                          {room.description && (
                            <p className="text-[10px] text-[#9497a1] truncate mt-0.5">
                              {room.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-[#424753] group-hover:text-[#4F8EF7] transition-colors shrink-0 ml-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Permitted rooms */}
            <section className="bg-[#1E1F25] rounded-2xl border border-[#424753]/15 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-['Manrope'] text-lg font-bold text-[#e3e1e9]">
                  Permitted Rooms
                </h4>
                <span className="text-[10px] bg-[#292a2f] px-2 py-0.5 rounded text-[#9497a1] font-bold">
                  {user.rooms.permitted.length}
                </span>
              </div>

              {user.rooms.permitted.length === 0 ? (
                <p className="text-xs text-[#9497a1] py-6 text-center">
                  You haven't been granted access to any rooms yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {user.rooms.permitted.map((room) => (
                    <button
                      key={room.permissionId}
                      onClick={() => navigate(`/rooms/${room.roomId}`)}
                      className="w-full flex items-center justify-between p-4 bg-[#0d0e13] hover:bg-[#292a2f] rounded-xl border border-[#424753]/10 hover:border-[#424753]/30 transition-all duration-200 group text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#acc7ff]/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#acc7ff]">
                            {room.roomName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#e3e1e9] truncate">
                            {room.roomName}
                          </p>
                          {/* Permission dots */}
                          <div className="flex items-center gap-1.5 mt-1">
                            {room.canUpload === 1 && (
                              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                                <Upload size={8} strokeWidth={2.5} /> Upload
                              </span>
                            )}
                            {room.canEditRoom === 1 && (
                              <span className="flex items-center gap-1 text-[9px] text-[#4F8EF7] font-bold">
                                <Pencil size={8} strokeWidth={2.5} /> Edit
                              </span>
                            )}
                            {room.canDelete === 1 && (
                              <span className="flex items-center gap-1 text-[9px] text-rose-400 font-bold">
                                <Trash2 size={8} strokeWidth={2.5} /> Delete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-[#424753] group-hover:text-[#acc7ff] transition-colors shrink-0 ml-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};