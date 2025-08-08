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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 active:scale-[.99]"
                onClick={open}
            >
                Ajouter un ami
            </button>

            <Dialog open={isOpen} onClose={close} className="relative z-50">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

                {/* Modal container */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
                        <Dialog.Title className="text-lg font-semibold mb-3">
                            Ajouter un ami
                        </Dialog.Title>

                        <div className="space-y-2">
                            <input
                                ref={inputRef}
                                type="email"
                                className="border rounded w-full p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={onKeyDown}
                                disabled={loading}
                                autoComplete="email"
                                inputMode="email"
                            />
                            {error && (
                                <div className="text-red-600 text-sm">{error}</div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-3 py-1 rounded hover:bg-gray-100"
                                onClick={close}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
                                onClick={handleAdd}
                                disabled={loading || !isValidEmail}
                            >
                                {loading ? 'Ajout…' : 'Ajouter'}
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </>
    );
}