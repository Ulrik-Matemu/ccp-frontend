import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";

export default function MessagingComponent({
  token,
  socket,
  myUserId
}: {
  token: string;
  socket: Socket | null;
  myUserId: number;
}) {
  const [inbox, setInbox] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // const isLeader = localStorage.getItem("isLeader");
  let userId = myUserId;

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to bottom
  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load inbox
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}api/messages/inbox/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        // Remove duplicates by grouping by other user ID
        const uniqueInbox = new Map();
        data.forEach((msg: any) => {
          const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
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

  // Load conversation when user is selected
  useEffect(() => {
    if (!selectedUser) return;

    fetch(`${import.meta.env.VITE_API_URL}api/messages/conversation/${selectedUser}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setMessages);
  }, [selectedUser, token]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onMsg = (m: any) => {
      // Update messages if it's for the current conversation
      if (
        (m.sender_id === selectedUser && m.receiver_id === myUserId) ||
        (m.sender_id === myUserId && m.receiver_id === selectedUser)
      ) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(msg => msg.id === m.id)) return prev;
          return [...prev, m];
        });
      }

      // Update inbox - find the other user ID
      const otherUserId = m.sender_id === myUserId ? m.receiver_id : m.sender_id;

      setInbox(prev => {
        // Remove any existing conversation with this user
        const filtered = prev.filter(item => {
          const itemOtherId = item.sender_id === myUserId ? item.receiver_id : item.sender_id;
          return itemOtherId !== otherUserId;
        });

        // Add the new message at the top
        return [m, ...filtered];
      });
    };

    socket.on("private_message", onMsg);
    socket.on("message_sent", onMsg);

    return () => {
      socket.off("private_message", onMsg);
      socket.off("message_sent", onMsg);
    };
  }, [socket, selectedUser, myUserId]);

  const handleSelectUser = (userId: number) => {
    setSelectedUser(userId);
    setText("");
  };

  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  const send = () => {
    if (!socket || !text.trim() || !selectedUser) return;
    socket.emit("private_message", { to: selectedUser, message: text });
    setText("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showChatWindow = selectedUser && (!isMobileView || (isMobileView && selectedUser));
  const showChatList = !isMobileView || (isMobileView && !selectedUser);

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl overflow-hidden md:shadow-xl max-w-7xl mx-auto">
      {/* Chat List */}
      {showChatList && (
        <div className={`w-full md:w-96 border-r border-green-50 flex flex-col bg-gradient-to-b from-green-50/30 to-white ${selectedUser && isMobileView ? 'hidden' : ''}`}>
          <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
            <div className="text-sm opacity-90 mt-1">{inbox.length} conversations</div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
            {inbox.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-4xl mb-4">
                  💬
                </div>
                <div className="text-lg font-semibold text-green-800 mb-2">No messages yet</div>
                <div className="text-sm text-green-600 opacity-80">Start a conversation</div>
              </div>
            ) : (
              inbox.map(m => {
                const other = m.sender_id === myUserId ? m.receiver_id : m.sender_id;
                const isSelected = selectedUser === other;

                return (
                  <div
                    key={`${other}-${m.id}`}
                    onClick={() => handleSelectUser(other)}
                    className={`bg-white rounded-xl p-3.5 mb-2 flex items-center cursor-pointer transition-all duration-200 border-2 ${
                      isSelected 
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-50/50 shadow-md' 
                        : 'border-transparent hover:bg-green-50/50 hover:translate-x-1'
                    }`}
                  >
                    <div className="relative w-12 h-12 min-w-[3rem] rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg mr-3 shadow-md">
                      {String(other).charAt(0)}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-semibold text-green-900">
                          {Number(other) === 1 ? "Hon. Salim Mussa" : `User ${other}`}
                        </div>
                        <div className="text-xs text-green-500 font-medium">
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="text-sm text-green-700 opacity-85 truncate">
                        {m.message.slice(0, 50)}...
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Chat Window */}
      {showChatWindow ? (
        <div className={`flex-1 flex flex-col bg-gradient-to-b from-green-50/20 to-white ${!selectedUser && isMobileView ? 'hidden' : ''}`}>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 flex items-center shadow-lg">
            {isMobileView && (
              <button 
                onClick={handleBack} 
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg mr-3 transition-all"
              >
                ←
              </button>
            )}
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-300 to-green-400 flex items-center justify-center text-white font-bold text-lg mr-3.5 shadow-md">
              {String(selectedUser).charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                {selectedUser === 1 ? "Hon. Salim Mussa" : `User ${selectedUser}`}
              </h2>
              <div className="text-sm text-white/90">Active 1hr ago</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-10 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-5xl mb-5">
                  👋
                </div>
                <div className="text-xl font-semibold text-green-800 mb-2">Start the conversation</div>
                <div className="text-sm text-green-600 opacity-80">Send a message to begin</div>
              </div>
            ) : (
              messages.map((m, index) => {
                const isMine = m.sender_id === myUserId;
                const showDate = index === 0 ||
                  new Date(messages[index - 1].created_at).toDateString() !==
                  new Date(m.created_at).toDateString();

                return (
                  <div key={m.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="bg-green-100 px-4 py-1.5 rounded-xl text-xs text-green-700 font-semibold shadow-sm">
                          {new Date(m.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: new Date(m.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                          })}
                        </span>
                      </div>
                    )}
                    <div className={`flex flex-col max-w-[100%] md:max-w-[100%] animate-[slideIn_0.3s_ease] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-md ${
                        isMine 
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-sm' 
                          : 'bg-white text-gray-800 border border-green-100 rounded-bl-sm'
                      }`}>
                        {m.message}
                      </div>
                      <div className={`text-xs mt-1 px-1 opacity-70 ${isMine ? 'text-green-700' : 'text-green-600'}`}>
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          <div className="p-5 fixed bottom-18 w-full md:w-[900px]  border-t border-green-100 flex items-center gap-3">
            <div className="flex-1 flex items-center bg-[#a5d6bc] rounded-full border-2 border-transparent focus-within:border-green-500 focus-within:bg-white focus-within:shadow-lg transition-all">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className=" flex-1 px-5 py-3 h-12 bg-transparent outline-none text-[15px] text-gray-800 placeholder-gray-400"
              />
            </div>
            <button
              onClick={async () => {
                if (!text.trim() || !selectedUser) return;

                if (socket) {
                  send();
                  return;
                }

                // Fallback to HTTP POST
                try {
                  const res = await fetch(`${import.meta.env.VITE_LOCAL_API_URL}api/messages/send`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      senderId: myUserId,
                      receiverId: selectedUser,
                      message: text
                    })
                  });

                  if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);

                  const data = await res.json();

                  // Prevent duplicate
                  setMessages(prev => {
                    if (prev.some(msg => msg.id === data.id)) return prev;
                    return [...prev, data];
                  });

                  // Update inbox
                  setInbox(prev => {
                    const otherUserId = data.sender_id === myUserId ? data.receiver_id : data.sender_id;
                    const filtered = prev.filter(item => {
                      const itemOtherId = item.sender_id === myUserId ? item.receiver_id : item.sender_id;
                      return itemOtherId !== otherUserId;
                    });
                    return [data, ...filtered];
                  });

                  setText("");
                  inputRef.current?.focus();
                } catch (err) {
                  console.error(err);
                }
              }}
              disabled={!text.trim()}
              className="w-12 h-12 min-w-[3rem] rounded-full bg-gradient-to-br from-green-500 to-[#a5d6bc] disabled:from-gray-300 disabled:to-gray-400 flex items-center justify-center text-white text-xl shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:shadow-none transition-all"
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        !isMobileView && (
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col items-center justify-center h-full px-10 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-5xl mb-5">
                💬
              </div>
              <div className="text-xl font-semibold text-green-800 mb-2">Select a conversation</div>
              <div className="text-sm text-green-600 opacity-80">Choose a chat from the list to start messaging</div>
            </div>
          </div>
        )
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
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