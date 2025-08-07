
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Home from './pages/Home';
import PostSong from './pages/PostSong';
import History from './pages/History';
import Friends from './pages/Friends';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/post" element={<PostSong />} />
        <Route path="/history" element={<History />} />
        <Route path="/friends" element={<Friends />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
