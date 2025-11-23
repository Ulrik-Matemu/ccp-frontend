import React from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import KaribuLogin from './pages/leader/login'
import { HomeFeedPage } from './pages/home-feed-page'
import MessagesPage from './pages/message-page'
import { NotificationsPage } from './pages/notifications'
import { AuthProvider } from './contexts/AuthContext'

const userId: number = (() => {
  const isLeader = localStorage.getItem("isLeader");
  if (isLeader === 'true') {
    const stored = localStorage.getItem("leaderId");
    const parsed = stored ? parseInt(stored, 10) : 1;
    return Number.isNaN(parsed) ? 1 : parsed;
  } else {
    const stored = localStorage.getItem("citizenId");
    const parsed = stored ? parseInt(stored, 10) : 1;
    return Number.isNaN(parsed) ? 1 : parsed;
  }
})();

let token;

const isLeader = localStorage.getItem("isLeader");
if (isLeader === 'true') {
  token = localStorage.getItem("leaderToken") ?? '';
} else {
  token = localStorage.getItem("citizenToken") ?? '';
}

const NotFound: React.FC = () => <div>404 - Not Found</div>

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<KaribuLogin />} />
          <Route path="/home" element={<HomeFeedPage />} />
          <Route path='/messages' element={<MessagesPage token={token} myUserId={userId} />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
