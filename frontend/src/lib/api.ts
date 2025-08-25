import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' });

// Like/Unlike functions
export const likePost = async (postId: number, userId: number) => {
    return api.post(`/posts/${postId}/like`, { userId });
};

export const unlikePost = async (postId: number, userId: number) => {
    return api.delete(`/posts/${postId}/like`, { data: { userId } });
};
