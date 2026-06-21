import { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FiSend, FiWifi, FiWifiOff } from 'react-icons/fi';

const WS_BASE = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

function groupMessages(messages) {
  const groups = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    const currTime = new Date(msg.created_at);
    const prevTime = prev ? new Date(prev.created_at) : null;
    const showTime = !prevTime || (currTime - prevTime) > 5 * 60 * 1000; // 5 min gap
    const sameAuthor = prev && String(prev.sender?.id) === String(msg.sender?.id) && !showTime;
    groups.push({ ...msg, showTime, sameAuthor });
  });
  return groups;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatGroupTime(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return formatTime(dateStr);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${formatTime(dateStr)}`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + formatTime(dateStr);
}

const ROLE_COLORS = {
  seller: 'bg-blue-50 text-blue-700',
  agent:  'bg-purple-50 text-purple-700',
  buyer:  'bg-emerald-50 text-emerald-700',
  admin:  'bg-red-50 text-red-600',
};

export default function ChatWindow({ room }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const ws = useRef(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const inputRef = useRef(null);
  const reconnectTimer = useRef(null);
  const isMounted = useRef(true);
  const userIdRef = useRef(user?.id);

  useEffect(() => { userIdRef.current = user?.id; }, [user?.id]);

  const loadMessages = useCallback(async () => {
    try {
      const { data } = await chatAPI.getMessages(room.id);
      if (isMounted.current) setMessages(data.results || data);
    } catch { /* ignore */ }
  }, [room.id]);

  const connectWS = useCallback(() => {
    if (!isMounted.current) return;
    const token = localStorage.getItem('access_token');
    const socket = new WebSocket(`${WS_BASE}/ws/chat/${room.id}/?token=${token}`);

    socket.onopen = () => { if (isMounted.current) setConnected(true); };

    socket.onclose = () => {
      if (!isMounted.current) return;
      setConnected(false);
      reconnectTimer.current = setTimeout(connectWS, 3000);
    };

    socket.onerror = () => { if (isMounted.current) setConnected(false); };

    socket.onmessage = (e) => {
      if (!isMounted.current) return;
      const data = JSON.parse(e.data);
      if (data.type === 'typing') {
        if (String(data.sender_id) !== String(userIdRef.current)) {
          setOtherTyping(true);
          setTimeout(() => setOtherTyping(false), 2500);
        }
        return;
      }
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.message_id)) return prev;
        return [...prev, {
          id: data.message_id,
          content: data.message,
          sender: { id: data.sender_id, full_name: data.sender_name, user_type: data.sender_type },
          created_at: data.created_at,
          is_read: false,
        }];
      });
    };

    ws.current = socket;
  }, [room.id]);

  useEffect(() => {
    isMounted.current = true;
    loadMessages();
    connectWS();
    return () => {
      isMounted.current = false;
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [room.id]); // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const sendTyping = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'typing' }));
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    if (!typing) {
      setTyping(true);
      sendTyping();
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 2000);
  };

  const send = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ message: trimmed }));
    setText('');
    setTyping(false);
    inputRef.current?.focus();
  };

  const grouped = groupMessages(messages);
  const other = room.buyer?.id === user?.id ? room.seller : room.buyer;

  return (
    <div className="flex flex-col h-full">
      {/* Connection status */}
      {!connected && (
        <div className="flex items-center justify-center gap-2 py-2 bg-amber-50 border-b border-amber-100">
          <FiWifiOff size={13} className="text-amber-500" />
          <span className="text-xs text-amber-600 font-medium">Reconnecting...</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <FiSend size={18} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Start the conversation</p>
            <p className="text-xs text-gray-400 mt-1">
              Ask about {room.property_title}
            </p>
          </div>
        )}

        {grouped.map((msg) => {
          const isMine = String(msg.sender?.id) === String(user?.id);
          const roleColor = ROLE_COLORS[msg.sender?.user_type] || 'bg-gray-100 text-gray-500';

          return (
            <div key={msg.id}>
              {/* Time separator */}
              {msg.showTime && (
                <div className="flex items-center justify-center my-3">
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {formatGroupTime(msg.created_at)}
                  </span>
                </div>
              )}

              <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar — only show on first of group */}
                <div className={`flex-shrink-0 ${msg.sameAuthor ? 'opacity-0' : ''}`}>
                  {msg.sender?.profile_photo ? (
                    <img src={msg.sender.profile_photo} alt="" className="w-7 h-7 rounded-xl object-cover" />
                  ) : (
                    <div className="w-7 h-7 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {msg.sender?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                <div className={`flex flex-col gap-0.5 max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                  {/* Sender name + role badge — first message only */}
                  {!msg.sameAuthor && !isMine && (
                    <div className="flex items-center gap-1.5 px-1 mb-0.5">
                      <span className="text-xs font-semibold text-gray-700">{msg.sender?.full_name}</span>
                      {msg.sender?.user_type && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${roleColor}`}>
                          {msg.sender.user_type}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? 'bg-gray-900 text-white rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Time + read */}
                  <div className={`flex items-center gap-1 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                    {isMine && (
                      <span className={`text-[10px] ${msg.is_read ? 'text-blue-500' : 'text-gray-300'}`}>
                        {msg.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {otherTyping && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] font-bold text-gray-500">
              {other?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <form onSubmit={send} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-300 focus:bg-white transition-all duration-200"
              placeholder={connected ? `Message about ${room.property_title}...` : 'Reconnecting...'}
              value={text}
              onChange={handleInput}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(e)}
              disabled={!connected}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || !connected}
            className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center flex-shrink-0 hover:bg-gray-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <FiSend size={15} />
          </button>
        </form>

        {/* Status bar */}
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[10px] text-gray-300">
            {connected
              ? <span className="flex items-center gap-1"><FiWifi size={9} className="text-emerald-400" /> Connected</span>
              : <span className="flex items-center gap-1"><FiWifiOff size={9} className="text-amber-400" /> Reconnecting...</span>
            }
          </span>
          {text.length > 0 && (
            <span className="text-[10px] text-gray-300">{text.length}/500</span>
          )}
        </div>
      </div>
    </div>
  );
}
