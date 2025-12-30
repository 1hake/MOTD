import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

type User = {
    id: number;
    email: string;
    name?: string;
    profileImage?: string;
};

interface FriendsSearchProps {
    currentUserId: number;
}

export default function FriendsSearch({ currentUserId }: FriendsSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                setShowResults(false);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/users/search/${encodeURIComponent(query)}?userId=${currentUserId}`);
                setResults(response.data);
                setShowResults(true);
            } catch (error) {
                console.error('Error searching users:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [query, currentUserId]);

    const handleSelectUser = (user: User) => {
        navigate(`/profile/${user.id}`);
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    return (
        <div ref={searchRef} className="relative">
            <div className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Chercher un ami par email ou nom..."
                    className="input-field pl-12 shadow-neo-sm focus:shadow-neo transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    {loading ? (
                        <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white border-3 border-black rounded-2xl shadow-neo z-50 max-h-64 overflow-y-auto scrollbar-none animate-slide-up">
                    <div className="p-2">
                        {results.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => handleSelectUser(user)}
                                className="flex items-center gap-4 p-4 hover:bg-pop-mint/30 rounded-xl cursor-pointer transition-colors border-2 border-transparent hover:border-black/10 group"
                            >
                                <div className="w-12 h-12 bg-pop-pink border-2 border-black rounded-xl flex items-center justify-center text-black font-black shadow-neo-sm group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-neo-sm transition-all">
                                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-black truncate uppercase italic">
                                        {user.name || user.email.split('@')[0]}
                                    </div>
                                    <div className="text-[10px] font-bold text-black/40 truncate uppercase tracking-widest">
                                        {user.email}
                                    </div>
                                </div>
                                <div className="text-black opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showResults && results.length === 0 && !loading && query.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white border-3 border-black rounded-2xl shadow-neo z-50 p-6 text-center animate-slide-up">
                    <div className="text-4xl mb-2 grayscale">👤</div>
                    <p className="font-black text-black uppercase italic text-sm">Aucun utilisateur trouvé</p>
                </div>
            )}
        </div>
    );
}
