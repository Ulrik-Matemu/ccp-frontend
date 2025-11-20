import { BottomNav } from "../components/shared/bottomNav"
import { TopBar } from "../components/shared/topBar"
import FeedContainer from "../components/shared/feedContainer"
import PostCreationScreen from "../components/shared/postCreationScreen"
import { useState } from "react"

const LEADER_INFO = {
    name: "Hon. Salim Mussa",
    avatarUrl: "YOUR_LEADER_AVATAR_URL_HERE", // Replace with actual URL
};


export const HomeFeedPage = () => {
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
            <div className="">
                <TopBar />
                <FeedContainer />
                <BottomNav onAddClick={handleAddPostClick} />

                {isPosting && (
                <PostCreationScreen
                    leaderName={LEADER_INFO.name}
                    leaderAvatarUrl={LEADER_INFO.avatarUrl}
                    onClose={handleClosePostCreation}
                />
            )}
            </div>
        </>
    )
}