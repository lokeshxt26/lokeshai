import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  LogOut,
  Bot,
  Settings,
} from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const {
    sessions,
    currentSessionId,
    selectSession,
    createNewChat,
    deleteSession,
    renameSession,
    clearAllSessions,
  } = useChat();

  const { user, logout } = useAuth();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartRename = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingTitle.trim()) {
      renameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Slide-out Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-neutral-950 border-r border-neutral-800/80 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & New Chat button */}
        <div className="p-3 border-b border-neutral-800/60">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white text-sm">AskMe AI</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              createNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800/90 border border-neutral-800 hover:border-neutral-700 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Your Conversations
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No chats yet. Start a new one!
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isEditing = session.id === editingId;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    selectSession(session.id);
                    onClose();
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition ${
                    isActive
                      ? 'bg-neutral-800/90 text-white font-medium shadow-sm'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                    
                    {isEditing ? (
                      <form onSubmit={(e) => handleSaveRename(session.id, e)} className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          autoFocus
                          className="w-full bg-neutral-900 border border-emerald-500 text-white text-xs px-1.5 py-0.5 rounded focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleSaveRename(session.id, e)}
                          className="p-1 hover:text-emerald-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          className="p-1 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate">{session.title}</span>
                    )}
                  </div>

                  {/* Actions (Rename / Delete) */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleStartRename(session.id, session.title, e)}
                        className="p-1 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-700/50 rounded"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-neutral-700/50 rounded"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Clear All Chats Option */}
        {sessions.length > 0 && (
          <div className="px-3 py-1 border-t border-neutral-800/40">
            <button
              onClick={() => {
                if (window.confirm('Delete all chat history?')) {
                  clearAllSessions();
                }
              }}
              className="w-full py-1.5 text-left text-[11px] text-neutral-500 hover:text-rose-400 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear all chats</span>
            </button>
          </div>
        )}

        {/* User Profile & Actions Footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-neutral-700 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-medium text-white truncate">{user?.name || 'User'}</div>
                <div className="text-[10px] text-neutral-400 truncate">{user?.email || ''}</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    logout();
                  }
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
