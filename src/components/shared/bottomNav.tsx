import React from "react";

interface BottomNavProps {
    onAddClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onAddClick }) => {
    return (
        <>
            <div className="fixed bottom-0 bg-[#009144] p-4 w-full">
                <div className="flex justify-around">
                    <button>
                        <img src="/icons/home-icon.svg" alt="Home" className="h-10 w-10 mx-auto" />
                    </button>  
                    <button onClick={onAddClick}>
                        <img src="/icons/add-icon.svg" alt="Add" className="h-10 w-10 mx-auto" />
                    </button>
                    <button>
                        <img src="/icons/chat-icon.svg" alt="Chat" className="h-10 w-10 mx-auto" />
                    </button>
                    <button>
                        <img src="/icons/notifications-icon.svg" alt="Notifications" className="h-10 w-10 mx-auto" />
                    </button>
                </div>
            </div>
        </>
    )
}