// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/common/Navbar'
import Login from './pages/Login'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import ChatList from './pages/ChatList'
import ChatRoom from './pages/ChatRoom'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"      element={<Login />} />
          <Route path="/explore"    element={<Protected><Explore /></Protected>} />
          <Route path="/profile"    element={<Protected><Profile /></Protected>} />
          <Route path="/chat"       element={<Protected><ChatList /></Protected>} />
          <Route path="/chat/:uid"  element={<Protected><ChatRoom /></Protected>} />
          <Route path="*"           element={<Navigate to="/explore" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
