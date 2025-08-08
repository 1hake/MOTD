import React, { useMemo, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';

interface AddFriendButtonProps {
    onAdd: (email: string) => Promise<void>;
}

export default function AddFriendButton({ onAdd }: AddFriendButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isValidEmail = useMemo(() => {
        if (!email) return false;
        // very light validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }, [email]);

    const open = () => {
        setIsOpen(true);
        // give the modal a tick to mount then focus
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const close = () => {
        if (loading) return; // prevent closing while submitting
        setIsOpen(false);
        setError(null);
    };

    const handleAdd = async () => {
        if (!isValidEmail) return;
        setLoading(true);
        setError(null);
        try {
            await onAdd(email.trim());
            setIsOpen(false);
            setEmail('');
        } catch (e: any) {
            setError(e?.message || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValidEmail && !loading) {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <>
            <button
                type="button"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 active:scale-95 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                onClick={open}
            >
                <span className="flex items-center gap-2">
                    ➕ <span>Ajouter un ami</span>
                </span>
            </button>

            <Dialog open={isOpen} onClose={close} className="relative z-50">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

                {/* Modal container */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border border-white/50 transform transition-all duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                <span className="text-2xl">👥</span>
                            </div>
                            <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Ajouter un ami
                            </Dialog.Title>
                            <p className="text-gray-600 mt-2">Entrez l'adresse email de votre ami</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Adresse email
                                </label>
                                <input
                                    ref={inputRef}
                                    type="email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                    placeholder="ami@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    disabled={loading}
                                    autoComplete="email"
                                    inputMode="email"
                                />
                            </div>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-2xl transition-all duration-200 font-medium"
                                onClick={close}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 active:scale-95 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                                onClick={handleAdd}
                                disabled={loading || !isValidEmail}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Ajout...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        ✨ <span>Ajouter</span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </>
    );
}