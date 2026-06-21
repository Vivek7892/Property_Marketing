import { useEffect, useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { chatAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/chat/ChatWindow';
import { FiMessageSquare, FiSearch, FiHome, FiChevronLeft } from 'react-icons/fi';

const ROLE_COLORS = {
  seller: 'bg-blue-50 text-blue-700',
  agent:  'bg-purple-50 text-purple-700',
  buyer:  'bg-emerald-50 text-emerald-700',
  admin:  'bg-red-50 text-red-600',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Avatar({ name, photo, size = 'md' }) {
  const dim = size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs';
  if (photo) return <img src={photo} alt={name} className={`${dim} rounded-2xl object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} bg-gray-900 rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  const loadRooms = useCallback(() => {
    chatAPI.getRooms()
      .then(({ data }) => {
        const roomList = data.results || data;
        setRooms(roomList);
        if (location.state?.roomId) {
          const target = roomList.find((r) => r.id === location.state.roomId) || roomList[0];
          setActiveRoom(target);
          if (target) setShowSidebar(false);
        } else if (!activeRoom && roomList.length > 0) {
          setActiveRoom(roomList[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [location.state, activeRoom]);

  useEffect(() => { loadRooms(); }, []);  // eslint-disable-line

  const getOther = (room) => room.buyer?.id === user?.id ? room.seller : room.buyer;

  const filtered = rooms.filter((r) => {
    const other = getOther(r);
    const q = search.toLowerCase();
    return !q
      || other?.full_name?.toLowerCase().includes(q)
      || r.property_title?.toLowerCase().includes(q);
  });

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    setShowSidebar(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lph-card overflow-hidden flex" style={{ height: 'calc(100vh - 140px)', minHeight: 500 }}>

          {/* ── Sidebar ─────────────────────────────── */}
          <div className={`
            flex-shrink-0 border-r border-gray-100 flex flex-col bg-white
            w-full sm:w-80
            ${!showSidebar ? 'hidden sm:flex' : 'flex'}
          `}>
            {/* Sidebar header */}
            <div className="px-4 py-4 border-b border-gray-100">
              <h1 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                <FiMessageSquare size={17} /> Messages
              </h1>
              <div className="relative">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm placeholder-gray-400 outline-none focus:border-gray-200 transition-colors"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Room list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <FiMessageSquare size={20} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {search ? 'No results found' : 'No conversations yet'}
                  </p>
                  {!search && (
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                      Start a chat from any property page
                    </p>
                  )}
                  {!search && (
                    <Link to="/properties" className="btn-primary text-xs px-4 py-2">
                      Browse Properties
                    </Link>
                  )}
                </div>
              ) : filtered.map((room) => {
                const other = getOther(room);
                const isActive = activeRoom?.id === room.id;
                const roleColor = ROLE_COLORS[other?.user_type] || 'bg-gray-100 text-gray-500';

                return (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-50 transition-all duration-150 ${
                      isActive ? 'bg-gray-50 border-l-2 border-l-gray-900' : 'hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={other?.full_name} photo={other?.profile_photo} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`text-sm font-semibold truncate ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                              {other?.full_name}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize flex-shrink-0 ${roleColor}`}>
                              {other?.user_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                            {room.unread_count > 0 && (
                              <span className="w-5 h-5 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {room.unread_count > 9 ? '9+' : room.unread_count}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              {timeAgo(room.last_message?.created_at || room.updated_at)}
                            </span>
                          </div>
                        </div>

                        {/* Property context */}
                        <div className="flex items-center gap-1 mb-1">
                          <FiHome size={9} className="text-gray-300 flex-shrink-0" />
                          <span className="text-[10px] text-gray-400 truncate">{room.property_title}</span>
                        </div>

                        {/* Last message */}
                        {room.last_message && (
                          <p className={`text-xs truncate ${room.unread_count > 0 ? 'font-semibold text-gray-700' : 'text-gray-400'}`}>
                            {String(room.last_message.sender?.id) === String(user?.id) ? 'You: ' : ''}
                            {room.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Chat Panel ─────────────────────────── */}
          <div className={`
            flex-1 flex flex-col min-w-0
            ${showSidebar ? 'hidden sm:flex' : 'flex'}
          `}>
            {activeRoom ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-gray-100 bg-white flex items-center gap-3">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="sm:hidden p-1.5 hover:bg-gray-100 rounded-xl transition-colors mr-1"
                  >
                    <FiChevronLeft size={18} />
                  </button>

                  {(() => {
                    const other = getOther(activeRoom);
                    const roleColor = ROLE_COLORS[other?.user_type] || 'bg-gray-100 text-gray-500';
                    return (
                      <>
                        <Avatar name={other?.full_name} photo={other?.profile_photo} size="lg" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{other?.full_name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${roleColor}`}>
                              {other?.user_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <FiHome size={10} className="text-gray-400" />
                            <Link
                              to={`/properties/${activeRoom.property}`}
                              className="text-xs text-blue-600 hover:text-blue-700 truncate transition-colors"
                            >
                              {activeRoom.property_title}
                            </Link>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Chat window */}
                <div className="flex-1 overflow-hidden">
                  <ChatWindow room={activeRoom} key={activeRoom.id} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                  <FiMessageSquare size={28} className="text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-1">Select a conversation</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Choose a conversation from the left to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
