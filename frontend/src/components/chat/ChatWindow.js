import { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FaPaperPlane } from 'react-icons/fa';

export default function ChatWindow({ room }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const ws = useRef(null);
  const bottomRef = useRef(null);

  const loadMessages = useCallback(async () => {
    const { data } = await chatAPI.getMessages(room.id);
    setMessages(data.results || data);
  }, [room.id]);

  useEffect(() => {
    loadMessages();
    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/ws/chat/${room.id}/?token=${localStorage.getItem('access_token')}`;
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, {
        id: data.message_id,
        content: data.message,
        sender: { id: data.sender_id, full_name: data.sender_name },
        created_at: data.created_at,
      }]);
    };
    return () => ws.current?.close();
  }, [room.id, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ message: text.trim() }));
    setText('');
  };

  return (
    <div className="d-flex flex-column" style={{ height: '70vh' }}>
      <div className="flex-grow-1 overflow-auto p-3 bg-light rounded mb-2">
        {messages.map((msg) => {
          const isMine = String(msg.sender?.id) === String(user?.id);
          return (
            <div key={msg.id} className={`d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
              <div className={`px-3 py-2 rounded-3 ${isMine ? 'bg-primary text-white' : 'bg-white border'}`} style={{ maxWidth: '70%' }}>
                {!isMine && <div className="small fw-semibold mb-1">{msg.sender?.full_name}</div>}
                <div>{msg.content}</div>
                <div className={`small mt-1 ${isMine ? 'text-white-50' : 'text-muted'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="d-flex gap-2">
        <input
          className="form-control"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary px-3" type="submit"><FaPaperPlane /></button>
      </form>
    </div>
  );
}
