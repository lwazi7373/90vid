import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Settings, Key, Trash2, Image, Film, ArrowLeft } from "lucide-react";
import { NavBar } from "../../../shared/Components/NavBar";
import { SideBar } from "../../../shared/Components/SideBar";
import { ImageGrid } from "../../media/components/ImageGrid";
import { VideoGrid } from "../../media/components/VideoGrid";
import { PermissionsDrawer } from "../../permission/components/PermissionsDrawer";
import { UploadModal } from "../../media/components/UploadModal";
import { ConfirmModal } from "../../permission/components/ConfirmModal";
import { CreateRoomModal } from "../components/CreateRoomModal";
import { useGetRoom } from "../room.queries";
import { useDeleteRoom } from "../room.mutations";
import { useAuth } from "../../../features/auth/context/AuthContext";

type Tab = "images" | "videos";
 
export const RoomView = () => {
  const { roomId: roomIdParam } = useParams<{ roomId: string }>();
  const roomId = Number(roomIdParam);
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const [activeTab, setActiveTab] = useState<Tab>("images");
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
 
  const { data: roomData, isLoading, isError } = useGetRoom(roomId);
  const { mutateAsync: deleteRoom, isPending: isDeleting } = useDeleteRoom();
 
  const isCreator = !!user && !!roomData && user.userId === roomData.creatorId;
 
  // Check if user has been granted permission to this room
  const isPermitted = !!user && user.rooms.permitted.some(
    (p) => p.roomId === roomId
  );
 
  // Can upload if they are the creator OR a permitted user
  const canUpload = isCreator || isPermitted;
 
  const handleDeleteRoom = async () => {
    await deleteRoom(roomId);
    navigate("/rooms/mine");
  };
 
  // Loading state
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
 
  // Error state
  if (isError || !roomData) {
    return (
      <div className="bg-[#0d0e13] min-h-screen text-[#e3e1e9]">
        <SideBar />
        <NavBar />
        <main className="lg:pl-[220px] pt-16 min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-[#9497a1] text-sm">Failed to load room.</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs text-[#4F8EF7] hover:underline"
          >
            <ArrowLeft size={14} /> Go back
          </button>
        </main>
      </div>
    );
  }
 
  return (
    <div className="bg-[#0d0e13] min-h-screen text-[#e3e1e9] font-['Inter']">
      <SideBar />
      <NavBar />
 
      <main className="lg:pl-[220px] pt-16 min-h-screen pb-24 lg:pb-12">
        <div className="pt-10 px-6 lg:px-12 max-w-7xl mx-auto">
 
          {/* Room header */}
          <section className="pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 
              {/* Left — info */}
              <div className="space-y-2 max-w-2xl">
                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tighter font-['Manrope'] text-[#e3e1e9]">
                  {roomData.roomName}
                </h2>
                {roomData.description && (
                  <p className="text-[#9497a1] font-['Inter'] leading-relaxed">
                    {roomData.description}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#3f465b] rounded-full">
                    <div className="w-4 h-4 rounded-full bg-[#292a2f] border border-[#424753]/30 flex items-center justify-center text-[8px] font-bold text-[#acc7ff]">
                      {roomData.creatorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-[#acc7ff]">{roomData.creatorName}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9497a1] font-medium">
                    Created{" "}
                    {new Date(roomData.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
 
              {/* Right — actions */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Permissions + Edit — creator only */}
                {isCreator && (
                  <>
                    <button
                      onClick={() => setIsPermissionsOpen(true)}
                      className="px-5 py-2.5 bg-[#292a2f] hover:bg-[#38393f] text-[#e3e1e9] text-sm font-semibold rounded-xl transition-all border border-[#424753]/10 flex items-center gap-2"
                    >
                      <Key size={15} />
                      Permissions
                    </button>
                    <button
                      onClick={() => setIsEditOpen(true)}
                      className="px-5 py-2.5 bg-[#292a2f] hover:bg-[#38393f] text-[#e3e1e9] text-sm font-semibold rounded-xl transition-all border border-[#424753]/10 flex items-center gap-2"
                    >
                      <Settings size={15} />
                      Edit Room
                    </button>
                    <button
                      onClick={() => setIsDeleteOpen(true)}
                      className="px-5 py-2.5 bg-[#93000a]/20 hover:bg-[#93000a]/30 text-[#ffb4ab] text-sm font-semibold rounded-xl transition-all border border-[#ffb4ab]/10 flex items-center gap-2"
                    >
                      <Trash2 size={15} />
                      Delete Room
                    </button>
                  </>
                )}
 
                {/* Upload — creator or permitted users only */}
                {canUpload && (
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="px-5 py-2.5 bg-[#4F8EF7] hover:bg-[#6ba3f9] text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                  >
                    <Upload size={15} />
                    Upload
                  </button>
                )}
              </div>
            </div>
          </section>
 
          {/* Tab navigation */}
          <div className="flex items-center gap-8 border-b border-[#424753]/10 mb-8">
            <button
              onClick={() => setActiveTab("images")}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === "images"
                  ? "text-[#4F8EF7] border-[#4F8EF7]"
                  : "text-[#9497a1] border-transparent hover:text-[#e3e1e9]"
              }`}
            >
              <Image size={16} />
              Images
              <span className={`px-1.5 py-0.5 text-[10px] rounded ml-1 ${
                activeTab === "images" ? "bg-[#4F8EF7]/10 text-[#4F8EF7]" : "bg-[#292a2f] text-[#9497a1]"
              }`}>
                {roomData.imageCount}
              </span>
            </button>
 
            <button
              onClick={() => setActiveTab("videos")}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === "videos"
                  ? "text-[#4F8EF7] border-[#4F8EF7]"
                  : "text-[#9497a1] border-transparent hover:text-[#e3e1e9]"
              }`}
            >
              <Film size={16} />
              Videos
              <span className={`px-1.5 py-0.5 text-[10px] rounded ml-1 ${
                activeTab === "videos" ? "bg-[#4F8EF7]/10 text-[#4F8EF7]" : "bg-[#292a2f] text-[#9497a1]"
              }`}>
                {roomData.videoCount}
              </span>
            </button>
          </div>
 
          {/* Tab content */}
          {activeTab === "images" ? (
            <ImageGrid roomId={roomId} />
          ) : (
            <VideoGrid roomId={roomId} />
          )}
 
        </div>
      </main>
 
      {/* Modals & drawer */}
      <PermissionsDrawer
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        roomId={roomId}
      />
 
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        roomId={roomId}
        mode={activeTab === "images" ? "image" : "video"}
      />
 
      {/* Edit room — reuses CreateRoomModal, just different title */}
      <CreateRoomModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        roomId={roomId}
        mode="edit"
        initialData={{
          roomName: roomData.roomName,
          description: roomData.description ?? "",
          thumbnailUrl: roomData.thumbnailUrl,
        }}
      />
 
      {/* Delete room confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteRoom}
        isPending={isDeleting}
        icon={<Trash2 size={22} className="text-[#ffb4ab]" />}
        iconBg="bg-[#93000a]/20"
        title="Delete Vault Room"
        description={
          <>
            This action is irreversible. Deleting{" "}
            <span className="text-[#ffb4ab] font-medium">'{roomData.roomName}'</span> will permanently
            scrub all the data.
          </>
        }
        cancelLabel="Keep Room"
        confirmLabel="Delete Permanently"
        confirmClassName="bg-[#ffb4ab] text-[#690005] shadow-lg shadow-[#ffb4ab]/20"
      />
    </div>
  );
};