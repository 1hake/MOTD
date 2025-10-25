import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import './index.css'
import { ToastProvider } from './components/Toast'
import { AuthProvider } from './contexts/AuthContext'
import { initMobileApp } from './mobile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Feed from './pages/Feed'
import PostSong from './pages/PostSong'
import Explorer from './pages/Explorer'
import Profile from './pages/Profile'
import FriendProfile from './pages/FriendProfile'
import EditProfile from './pages/EditProfile'
import UserFriends from './pages/UserFriends'
import SavedPosts from './pages/LikedPosts'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './Layout'

// Initialize Capacitor and mobile features when app starts
if (Capacitor.isNativePlatform()) {
  initMobileApp()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route element={<Layout />}>
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                }
              />
              <Route path="/home" element={<Navigate to="/feed" replace />} />
              <Route
                path="/post"
                element={
                  <ProtectedRoute>
                    <PostSong />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/explorer"
                element={
                  <ProtectedRoute>
                    <Explorer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/friends"
                element={
                  <ProtectedRoute>
                    <Explorer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/friends/me"
                element={
                  <ProtectedRoute>
                    <UserFriends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/friends/:userId"
                element={
                  <ProtectedRoute>
                    <UserFriends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <FriendProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedPosts />
                  </ProtectedRoute>
                }
              />
              <Route path="/liked" element={<Navigate to="/saved" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
)
