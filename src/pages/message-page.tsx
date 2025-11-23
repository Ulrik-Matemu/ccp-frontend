// src/pages/MessagesPage.tsx
import { useState } from "react";
import { useSocket } from "../hook/useSocket";
import MessagingComponent from "../components/shared/chatWindow";
import { TopBar } from "../components/shared/topBar";
import { BottomNav } from "../components/shared/bottomNav";
import PostCreationScreen from "../components/shared/postCreationScreen";

export default function MessagesPage({ token, myUserId }: { token: string, myUserId: number }) {
     const [isPosting, setIsPosting] = useState(false);
    
        const handleAddPostClick = () => {
            // TODO: Add authentication check here
            setIsPosting(true);
        };
    
        const handleClosePostCreation = () => {
            setIsPosting(false);
        };
    const socketRef = useSocket(token);
    const socket = socketRef.current;

    return (
        <>
            <TopBar />
            <div className="mt-14">
                <MessagingComponent 
                    token={token} 
                    socket={socket} 
                    myUserId={myUserId} 
                />
            </div>
            <BottomNav onAddClick={handleAddPostClick} />
            {isPosting && (
                <PostCreationScreen
                    leaderName={"Hon. Salim Mussa"}
                    leaderAvatarUrl={"/images/salim-mussa.jpeg"}
                    onClose={handleClosePostCreation}
                />
            )}
        </>
    );
}