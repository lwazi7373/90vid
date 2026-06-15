import { useState } from "react";
import { X, Key, UserPlus, UserMinus, Search, Loader2 } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";
import { useGetPermittedUsers } from "../../../features/permission/permission.queries";
import { usePermitUser, useRevokeUser } from "../../../features/permission/permission.mutations";
import { useSearchUsers } from "../../../features/search/search.queries";
import type { PermittedUser } from "../../../features/permission/permission.types";
import type { SearchedUser } from "../../../features/search/search.types";

interface PermissionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
}

export const PermissionsDrawer = ({ isOpen, onClose, roomId }: PermissionsDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [grantTarget, setGrantTarget] = useState<SearchedUser | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<PermittedUser | null>(null);

  const { data: permittedData, isLoading: isLoadingPermitted } = useGetPermittedUsers(roomId, isOpen);
  const { data: searchData, isLoading: isSearching } = useSearchUsers(searchQuery);

  const { mutateAsync: permitUser, isPending: isGranting } = usePermitUser(roomId);
  const { mutateAsync: revokeUser, isPending: isRevoking } = useRevokeUser(roomId);

  const handleGrant = async () => {
    if (!grantTarget) return;
    await permitUser({
      userId: grantTarget.userId,
      canUpload: 1,
      canDelete: 1,
      canEditRoom: 1,
    });
    setGrantTarget(null);
    setSearchQuery("");
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    await revokeUser(revokeTarget.userId);
    setRevokeTarget(null);
  };

  // Filter out already-permitted users from search results
  const permittedUserIds = new Set(permittedData?.results.map((u) => u.userId) ?? []);
  const filteredSearchResults = searchData?.results.filter((u) => !permittedUserIds.has(u.userId)) ?? [];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-[#0D0E13]/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[380px] z-50 bg-[#0D0E13]/90 backdrop-blur-xl border-l border-[#424753]/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-8 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#acc7ff]/10 rounded-lg">
              <Key size={20} className="text-[#acc7ff]" />
            </div>
            <h2 className="font-['Manrope'] text-xl font-extrabold tracking-tight text-[#e3e1e9]">
              Manage Permissions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#292a2f] transition-colors text-[#9497a1]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-10"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#424753 transparent" }}
        >
          {/* Search section */}
          <section>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9497a1] mb-3 block">
              Add New User
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9497a1] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full bg-[#1A1B21] border border-[#424753]/20 rounded-xl py-3 pl-10 pr-4 text-sm text-[#e3e1e9] placeholder:text-[#9497a1]/50 focus:outline-none focus:border-[#4F8EF7]/50 focus:ring-1 focus:ring-[#4F8EF7]/20 transition-all"
              />
              {isSearching && (
                <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9497a1] animate-spin" />
              )}
            </div>

            {/* Search results */}
            {searchQuery.trim().length > 0 && (
              <div className="mt-3 space-y-2">
                {filteredSearchResults.length === 0 && !isSearching && (
                  <p className="text-xs text-[#9497a1] text-center py-3">No users found.</p>
                )}
                {filteredSearchResults.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-4 bg-[#292a2f] rounded-xl border border-[#424753]/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1E1F25] border border-[#424753]/30 flex items-center justify-center text-xs font-bold text-[#acc7ff]">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#e3e1e9]">@{user.userName}</p>
                        <p className="text-[10px] text-[#9497a1]">{user.emailAddress}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setGrantTarget(user)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4F8EF7]/10 text-[#4F8EF7] hover:bg-[#4F8EF7]/20 rounded-lg text-xs font-bold transition-colors"
                    >
                      <UserPlus size={13} />
                      Grant
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Currently permitted */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#9497a1]">
                Currently Permitted
              </label>
              <span className="text-[10px] bg-[#1E1F25] px-2 py-0.5 rounded text-[#9497a1]">
                {permittedData?.count ?? 0} Members
              </span>
            </div>

            {isLoadingPermitted && (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#9497a1]" />
              </div>
            )}

            {!isLoadingPermitted && permittedData?.results.length === 0 && (
              <p className="text-xs text-[#9497a1] text-center py-6">
                No users have been granted access yet.
              </p>
            )}

            <div className="space-y-3">
              {permittedData?.results.map((user) => (
                <div
                  key={user.permissionId}
                  className="p-4 bg-[#1E1F25] rounded-xl border border-[#424753]/5 hover:border-[#424753]/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#292a2f] border border-[#424753]/30 flex items-center justify-center text-xs font-bold text-[#acc7ff] shrink-0">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#e3e1e9]">@{user.userName}</p>
                        {/* Permission dots */}
                        <div className="flex gap-1.5 mt-1.5">
                          {user.canUpload === 1 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Upload" />
                          )}
                          {user.canEditRoom === 1 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7]" title="Edit" />
                          )}
                          {user.canDelete === 1 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Delete" />
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setRevokeTarget(user)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-[#ffb4ab]/60 hover:text-[#ffb4ab] uppercase tracking-wider transition-colors"
                    >
                      <UserMinus size={13} />
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Grant confirmation */}
      <ConfirmModal
        isOpen={!!grantTarget}
        onClose={() => setGrantTarget(null)}
        onConfirm={handleGrant}
        isPending={isGranting}
        icon={<Key size={22} className="text-[#acc7ff]" />}
        iconBg="bg-[#acc7ff]/10"
        title="Grant Access"
        description={
          <>
            Confirming this will allow{" "}
            <span className="text-[#acc7ff]">{grantTarget?.userName}</span> to upload, delete and edit
            within this vault.
          </>
        }
        confirmLabel="Grant Access"
        confirmClassName="bg-gradient-to-br from-[#acc7ff] to-[#508ff8] text-[#002f68] shadow-lg shadow-[#acc7ff]/20"
      />

      {/* Revoke confirmation */}
      <ConfirmModal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        isPending={isRevoking}
        icon={<UserMinus size={22} className="text-[#c0c6da]" />}
        iconBg="bg-[#3f465b]/30"
        title="Revoke Permission"
        description={
          <>
            Are you sure you want to revoke permissions for{" "}
            <span className="text-[#e3e1e9] font-medium">{revokeTarget?.userName}</span>?
          </>
        }
        confirmLabel="Confirm Revoke"
        confirmClassName="bg-[#e3e1e9] text-[#0d0e13]"
      />
    </>
  );
};
