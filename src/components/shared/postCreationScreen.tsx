import React, { useState, useRef } from 'react';
import { IoClose, IoImageOutline, IoAttach, IoCloseCircle } from 'react-icons/io5';
import './PostCreationScreen.css';
import { useNavigate } from 'react-router-dom';

// --- TYPES (for file handling) ---
interface PreviewFile extends File {
    preview: string;
}

// NOTE: You'll need to pass the leader's info (name/avatar) and the close handler as props
interface PostCreationProps {
    leaderName: string;
    leaderAvatarUrl: string;
    // Callback function to close the modal/screen after submission
    onClose: () => void; 
}

const PostCreationScreen: React.FC<PostCreationProps> = ({ leaderName, onClose }) => {
    const [body, setBody] = useState('');
    const [files, setFiles] = useState<PreviewFile[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isLeader = localStorage.getItem('isLeader');
    let userId;
    if (isLeader === 'true') {
        userId = localStorage.getItem('leaderId');
    } else {
        userId = localStorage.getItem('citizenId');
    }
    const citizenId = Number(userId);

    const navigate = useNavigate();


    const cta = () => {
        const isLeader = localStorage.getItem('isLeader');
        if (isLeader === 'true') {
            return 'Tuma taarifa kwa wananchi wako';
        }
        return 'Tuma ujumbe kwa kiongozi wako';
    }

    // --- UTILITY FUNCTIONS ---

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files).map(file => {
                // Create preview URL for immediate display
                const previewFile = file as PreviewFile;
                previewFile.preview = URL.createObjectURL(file);
                return previewFile;
            });
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveFile = (fileName: string) => {
        setFiles(prev => prev.filter(file => file.name !== fileName));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting || (!body.trim() && files.length === 0)) return;

        setIsSubmitting(true);
        const token = localStorage.getItem('token'); // Get token from localStorage
        const formData = new FormData();

        formData.append('body', body.trim());

        // Append all files to the FormData object
        files.forEach(file => {
            formData.append('media', file); // 'media' should match what your multer/backend expects for req.files
        });
        
        try {
            // ⚠️ IMPORTANT: Replace with your actual API endpoint for post creation
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/post`, {
                method: 'POST',
                headers: {
                    // NOTE: Do NOT set 'Content-Type': 'multipart/form-data'. 
                    // The browser sets the correct boundary when using FormData.
                    'Authorization': `Bearer ${token}`, 
                },
                body: formData,
            });

           
            if (!response.ok) {
                // Handle specific API errors here
                
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create post');
            }

            // Success!
            alert('Post created successfully!');
            onClose(); // Close the screen/modal

        } catch (error) {
            console.error('Submission error:', error);
            alert(`Error creating post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/messages/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    leaderId: 1,
                    message: body,
                    citizenId: citizenId,
                }),
            });
            if (response.status === 400) {
                navigate("/messages")
                return;
            }
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Message sent successfully:', data);
            navigate("/messages")
        } catch (error) {
            console.error('Error sending message:', error);
            alert(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    const isButtonDisabled = isSubmitting || (!body.trim() && files.length === 0);

    return (
        <div className="post-screen-overlay">
            {/* --- Header --- */}
            <header className="header">
                <button 
                    className="close-button" 
                    onClick={onClose}
                    title="Close"
                    disabled={isSubmitting}
                >
                    <IoClose size={30} />
                </button>
                <button 
                    className="submit-button" 
                    onClick={
                        isLeader === 'true' ? handleSubmit : handleSubmitMessage
                    } 
                    disabled={isButtonDisabled}
                >
                    {isSubmitting ? 'Tuma...' : 'Tuma'}
                </button>
            </header>

            {/* --- Content Area --- */}
            <form className="content-area" onSubmit={handleSubmit}>
                <div className="leader-info">
                    <img 
                        src="/images/salim-mussa.jpeg" 
                        alt={leaderName} 
                        className="leader-avatar" 
                    />
                    {/* Placeholder text area, matching the wireframe's flow */}
                    <p>{cta()}</p> 
                </div>

                <textarea
                    className="message-input"
                    placeholder="Weka ujumbe wako hapa..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    disabled={isSubmitting}
                />

                {/* File Previews */}
                <div className="file-preview-container">
                    {files.map((file) => (
                        <div key={file.name} className="file-preview">
                            {/* Assuming media is primarily images for preview */}
                            <img src={file.preview} alt={file.name} />
                            <button 
                                type="button" 
                                className="remove-file-button" 
                                onClick={() => handleRemoveFile(file.name)}
                                title="Remove file"
                            >
                                <IoCloseCircle size={12} />
                            </button>
                        </div>
                    ))}
                </div>

                <footer className="action-bar">
                {/* Image Upload Button */}
                <button 
                    type="button" 
                    className="action-bar-button" 
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach Image"
                    disabled={isSubmitting}
                >
                    <IoImageOutline size={24} />
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*,video/*"
                        multiple 
                        disabled={isSubmitting}
                    />
                </button>

                {/* Attachment/Link Button (currently non-functional) */}
                <button 
                    type="button" 
                    className="action-bar-button" 
                    title="Attach Link/Document (not implemented)"
                    disabled={isSubmitting}
                >
                    <IoAttach size={24} />
                </button>

                {/* Group Dropdown */}
                <select className="group-dropdown" disabled={isSubmitting}>
                    <option value="all">Kikundi (Wote)</option>
                    <option value="groupA">Kikundi A</option>
                    <option value="groupB">Kikundi B</option>
                </select>
            </footer>
            </form>
            
            {/* --- Action Bar (Bottom Bar) --- */}
            
        </div>
    );
};

export default PostCreationScreen;