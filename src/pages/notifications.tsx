import { useState } from "react";
import { BottomNav } from "../components/shared/bottomNav"
import { TopBar } from "../components/shared/topBar"
import PostCreationScreen from "../components/shared/postCreationScreen";

export const NotificationsPage = () => {
     const [isPosting, setIsPosting] = useState(false);
        
            const handleAddPostClick = () => {
                // TODO: Add authentication check here
                setIsPosting(true);
            };
        
            const handleClosePostCreation = () => {
                setIsPosting(false);
            };
    return (
        <>
            <TopBar />
            <div className="mt-16">
                <h1 className="text-2xl text-white p-4 font-bold bg-gradient-to-br from-green-500 to-green-600 text-left mt-10">Notifications</h1>
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
    )
}