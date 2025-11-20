import React, { useEffect, useState } from 'react';
// ⚠️ IMPORTANT: You must install React Icons if you haven't: npm install react-icons
import { 
    IoHeartOutline, 
    IoChatbubbleOutline, 
    IoShareSocialOutline, 
    IoBookmarkOutline,
    IoEllipsisVertical
} from 'react-icons/io5'; 
import './FeedContainer.css'; // Import the CSS file

// --- TYPES (Keep these as they match the backend) ---
interface PostMedia {
    media_url: string;
    media_type: 'image' | 'video' | 'document';
}

interface Post {
    id: string; 
    leader_id: number;
    leader_name: string;
    leader_profile_pic: string; 
    body: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    media: PostMedia[];
}

// --- UTILITIES (Reused) ---

const formatStatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
};

const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return postDate.toLocaleDateString();
};


// --- POST CARD COMPONENT ---

const PostCard: React.FC<{ item: Post }> = ({ item }) => {
    const hasMedia = item.media && item.media.length > 0;
    const mainImage = hasMedia ? item.media[0].media_url : null;

    // Fallback avatar URL if leader_profile_pic is missing
    const avatarUrl = item.leader_profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.leader_name)}`;

    return (
        <article className="post-card">
            {/* Header */}
            <header className="card-header">
                <img
                    src="/images/salim-mussa.jpeg"
                    alt={`${item.leader_name}'s avatar`}
                    className="avatar"
                    loading="lazy"
                    style={{ objectFit: 'cover', objectPosition: 'center', width: 48, height: 48 }}
                />
                <div className="header-text-container">
                    <p className="leader-name">
                        Hon. {item.leader_name}
                        <span className="dot-separator"> • </span>
                        <span className="timestamp">{formatTimeAgo(item.created_at)}</span>
                    </p>
                </div>
                <button className="action-button" title="More options">
                    <IoEllipsisVertical className="icon" size={20} />
                </button>
            </header>

            {/* Body Text */}
            <p className="body-text">{item.body}</p>

            {/* Media */}
            {mainImage && (
                <img 
                    src={mainImage} 
                    alt="Post media" 
                    className="post-image" 
                />
            )}

            {/* Footer (Actions) */}
            <footer className="footer">
                
                {/* Likes */}
                <button className="action-button">
                    <IoHeartOutline size={24} />
                    <span className="action-text">{formatStatNumber(item.likes_count)}</span> 
                </button>

                {/* Comments */}
                <button className="action-button">
                    <IoChatbubbleOutline size={22} />
                    <span className="action-text">{formatStatNumber(item.comments_count)}</span>
                </button>

                {/* Shares */}
                <button className="action-button">
                    <IoShareSocialOutline size={22} />
                    <span className="action-text">{formatStatNumber(item.shares_count)}</span>
                </button>
                
                <div className="spacer" /> 
                
                {/* Bookmark/Save */}
                <button className="action-button">
                    <IoBookmarkOutline size={22} />
                </button>
            </footer>
        </article>
    );
};


// --- FEED CONTAINER ---

const FeedContainer: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            // ⚠️ IMPORTANT: Replace with your actual API endpoint
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/post`); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Post[] = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) {
        // Simple loading indicator for web
        return (
            <div className="loading-center">
                <p>Loading Feed...</p> 
                {/* You can replace this with a CSS spinner if desired */}
            </div>
        );
    }

    return (
        <main
            className="feed-container pb-20"
            style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', maxHeight: 'calc(100vh - 120px)', scrollbarWidth: 'none', scrollbarColor: '#ccc transparent' }}
        >
            {posts.length > 0 ? (
            posts.map((item) => (
            <PostCard key={item.id} item={item} />
            ))
            ) : (
            <p className="empty-text">No posts found.</p>
            )}
        </main>
    );
};

export default FeedContainer;