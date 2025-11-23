import { useEffect, useState } from "react";

export default function ChatList({ token, onSelect }: { token: string; onSelect: (id: number) => void }) {
  const [inbox, setInbox] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const userId = localStorage.getItem("leaderId");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}api/messages/inbox/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        // Remove duplicates by grouping by other user ID
        const uniqueInbox = new Map();
        data.forEach((msg: any) => {
          const otherId = msg.sender_id == userId ? msg.receiver_id : msg.sender_id;
          // Keep only the most recent message per conversation
          if (!uniqueInbox.has(otherId) || new Date(msg.created_at) > new Date(uniqueInbox.get(otherId).created_at)) {
            uniqueInbox.set(otherId, msg);
          }
        });
        setInbox(Array.from(uniqueInbox.values()).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      });
  }, [token, userId]);

  const handleSelect = (id: number) => {
    setSelectedChat(id);
    onSelect(id);
  };

  return (
    <div className="h-full bg-gradient-to-b from-green-50/50 to-white flex flex-col overflow-hidden">
      <div className="p-5 md:p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Messages</h1>
        <div className="text-sm opacity-90">{inbox.length} conversations</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
        {inbox.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-4xl mb-4">
              💬
            </div>
            <div className="text-lg font-semibold text-green-800 mb-2">No messages yet</div>
            <div className="text-sm text-green-600 opacity-80">Start a conversation to see it here</div>
          </div>
        ) : (
          inbox.map(m => {
            const other = m.sender_id == userId ? m.receiver_id : m.sender_id;
            const isSelected = selectedChat === other;

            return (
              <div
                key={`${other}-${m.id}`}
                onClick={() => handleSelect(other)}
                className={`bg-white rounded-2xl p-3.5 mb-2.5 flex items-center cursor-pointer transition-all duration-200 shadow-sm border-2 ${
                  isSelected 
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-50/70 shadow-lg -translate-y-0.5' 
                    : 'border-transparent hover:-translate-y-0.5 hover:shadow-md hover:border-green-100'
                }`}
              >
                <div className="relative w-13 h-13 min-w-[3.25rem] rounded-full bg-gradient-to-br from-green-400 to-green-600 mr-3.5 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {String(other).charAt(0)}
                  <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-base text-green-900 m-0">User {other}</h3>
                    <span className="text-xs text-green-500 font-medium">
                      {new Date(m.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-green-700 opacity-85 truncate leading-tight">
                    {m.message.slice(0, 65)}...
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thumb-green-200::-webkit-scrollbar-thumb {
          background: #a7f3d0;
          border-radius: 3px;
        }
        .scrollbar-thumb-green-200::-webkit-scrollbar-thumb:hover {
          background: #6ee7b7;
        }
      `}</style>
    </div>
  );
}