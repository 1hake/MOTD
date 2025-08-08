
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Feed from './pages/Feed';
import PostSong from './pages/PostSong';
import History from './pages/History';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import PlaylistOfTheDay from './pages/PlaylistOfTheDay';

import Layout from './Layout';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/home" element={<Navigate to="/feed" replace />} />
          <Route path="/post" element={<PostSong />} />
          <Route path="/history" element={<History />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/playlist" element={<PlaylistOfTheDay />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
