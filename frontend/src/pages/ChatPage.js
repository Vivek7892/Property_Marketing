import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatAPI.getRooms()
      .then(({ data }) => {
        const roomList = data.results || data;
        setRooms(roomList);
        if (location.state?.roomId) {
          setActiveRoom(roomList.find((r) => r.id === location.state.roomId) || roomList[0]);
        } else {
          setActiveRoom(roomList[0] || null);
        }
      })
      .finally(() => setLoading(false));
  }, [location.state]);

  if (loading) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="container my-4">
      <h4 className="fw-bold mb-4">Messages</h4>
      <div className="row g-0 border rounded-3 overflow-hidden shadow-sm" style={{ minHeight: '75vh' }}>
        {/* Room List */}
        <div className="col-md-4 border-end bg-white">
          <div className="p-3 border-bottom bg-light">
            <h6 className="mb-0 fw-semibold">Conversations</h6>
          </div>
          <div className="overflow-auto" style={{ maxHeight: '65vh' }}>
            {rooms.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>No conversations yet.</p>
                <small>Start a chat from a property page.</small>
              </div>
            ) : rooms.map((room) => {
              const other = room.buyer?.id === user?.id ? room.seller : room.buyer;
              return (
                <div key={room.id}
                  className={`p-3 border-bottom cursor-pointer ${activeRoom?.id === room.id ? 'bg-primary bg-opacity-10' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveRoom(room)}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="fw-semibold small">{other?.full_name}</div>
                    {room.unread_count > 0 && (
                      <span className="badge bg-primary rounded-pill">{room.unread_count}</span>
                    )}
                  </div>
                  <div className="text-muted small text-truncate">{room.property_title}</div>
                  {room.last_message && (
                    <div className="text-muted" style={{ fontSize: '0.75rem' }} >{room.last_message.content?.slice(0, 35)}...</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-md-8 bg-white">
          {activeRoom ? (
            <div className="d-flex flex-column h-100">
              <div className="p-3 border-bottom bg-light">
                <h6 className="mb-0 fw-semibold">
                  {activeRoom.buyer?.id === user?.id ? activeRoom.seller?.full_name : activeRoom.buyer?.full_name}
                </h6>
                <small className="text-muted">{activeRoom.property_title}</small>
              </div>
              <div className="p-3 flex-grow-1">
                <ChatWindow room={activeRoom} />
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
