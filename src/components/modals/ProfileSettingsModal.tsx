import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  RotateCcw,
  Check,
  User,
  Briefcase,
  Shield,
  Sparkles,
  Users,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ROLE_DEFAULT_AVATARS } from '../../auth/demoUsers';
import { UserRole } from '../../types';

export const ProfileSettingsModal: React.FC = () => {
  const {
    currentUser,
    userRole,
    setUserRole,
    updateUserProfile,
    resetUserAvatar,
    isProfileModalOpen,
    setIsProfileModalOpen,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [titleInput, setTitleInput] = useState(currentUser?.title || '');
  const [activeTab, setActiveTab] = useState<'info' | 'roles'>('info');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Keep inputs updated when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setNameInput(currentUser.name);
      setTitleInput(currentUser.title || '');
    }
  }, [currentUser]);

  if (!isProfileModalOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateUserProfile({ avatarUrl: dataUrl });
      showToast('Custom profile photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    resetUserAvatar();
    showToast('Restored default role profile photo.');
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    updateUserProfile({ name: nameInput.trim(), title: titleInput.trim() });
    showToast('Profile details updated successfully!');
  };

  const rolesList: { role: UserRole; label: string; name: string; title: string; color: string }[] = [
    { role: 'sales_rep', label: 'Sales Rep', name: 'P. Mehta', title: 'Sales Representative', color: 'bg-blue-600' },
    { role: 'sales_manager', label: 'Sales Manager', name: 'M. Shah', title: 'Sales Manager', color: 'bg-purple-600' },
    { role: 'finance', label: 'Finance & Ops', name: 'R. Iyer', title: 'Finance & Operations Lead', color: 'bg-emerald-600' },
    { role: 'customer', label: 'Customer Portal', name: 'Acme Procurement', title: 'Client Account (Acme Corp)', color: 'bg-indigo-600' },
    { role: 'admin', label: 'Administrator', name: 'System Admin', title: 'System Administrator', color: 'bg-slate-700' },
  ];

  const currentRoleInfo = rolesList.find((r) => r.role === userRole) || rolesList[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Profile & Photo Settings
              </h2>
              <p className="text-xs text-blue-200/80 font-medium">
                Upload your photo, pick role avatars, or customize credentials
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Current Active User Profile Banner Card */}
        <div className="p-6 pb-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-4 card-3d">
            {/* Big Avatar with Edit Overlay */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full ring-4 ring-white shadow-md overflow-hidden bg-slate-200 flex items-center justify-center border border-slate-300">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ROLE_DEFAULT_AVATARS[userRole] || '';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-slate-600">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>

              {/* Camera Trigger */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#0176D3] text-white shadow-md hover:bg-blue-700 transition cursor-pointer border-2 border-white"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Details & Role Indicator */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {currentUser?.name || 'Active User'}
                </h3>
                <span
                  className={`text-[10px] font-extrabold uppercase text-white px-2 py-0.5 rounded-full shadow-2xs ${currentRoleInfo.color}`}
                >
                  {userRole.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {currentUser?.title || currentRoleInfo.title}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                {currentUser?.email}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0176D3] text-white hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs btn-3d"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Custom Photo
                </button>
                <button
                  onClick={handleResetAvatar}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Reset to role default avatar"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" /> Reset Default
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher: Edit Info | Switch Demo Role */}
        <div className="px-6 border-b border-slate-200 flex gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 text-xs font-bold transition cursor-pointer border-b-2 ${
              activeTab === 'info'
                ? 'text-[#0176D3] border-[#0176D3]'
                : 'text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            Edit Name & Title
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-3 text-xs font-bold transition cursor-pointer border-b-2 ${
              activeTab === 'roles'
                ? 'text-[#0176D3] border-[#0176D3]'
                : 'text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            Switch Role (Demo Showcase)
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 pt-4 max-h-80 overflow-y-auto">

          {/* TAB 2: EDIT INFO */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0176D3]" /> Display Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Nandish Patel"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-[#0176D3] focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#0176D3]" /> Job Title / Department
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Senior Commercial Executive"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-[#0176D3] focus:bg-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0176D3] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer btn-3d"
              >
                <Check className="w-4 h-4" /> Save Profile Details
              </button>
            </form>
          )}

          {/* TAB 3: SWITCH ROLE FOR SHOWCASE */}
          {activeTab === 'roles' && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Instant Role Switching (Demonstrates All User Roles & Avatars):
              </span>
              <div className="space-y-2">
                {rolesList.map((r) => {
                  const isCurrent = userRole === r.role;
                  const defaultPic = ROLE_DEFAULT_AVATARS[r.role];
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        setUserRole(r.role);
                        showToast(`Switched active workspace role to ${r.label}!`);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between card-hover-3d ${
                        isCurrent
                          ? 'border-[#0176D3] bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-300 shadow-2xs shrink-0">
                          <img
                            src={defaultPic}
                            alt={r.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{r.name}</span>
                            <span
                              className={`text-[9px] font-bold uppercase text-white px-1.5 py-0.2 rounded ${r.color}`}
                            >
                              {r.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{r.title}</span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-[#0176D3] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 hover:text-slate-700">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-xs btn-3d"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
