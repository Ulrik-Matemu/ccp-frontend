import React from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import KaribuLogin  from './pages/leader/login'

const HomePage: React.FC = () => <div>Home Page</div>
const NotFound: React.FC = () => <div>404 - Not Found</div>

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leader/login" element={<KaribuLogin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
