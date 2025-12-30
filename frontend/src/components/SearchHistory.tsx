import React from 'react'
import { SearchHistoryItem, SearchHistoryService } from '../lib/searchHistory'

interface SearchHistoryProps {
    onSelectQuery: (query: string) => void
    onClose: () => void
    className?: string
}

export default function SearchHistory({ onSelectQuery, onClose, className = '' }: SearchHistoryProps) {
    const [history, setHistory] = React.useState<SearchHistoryItem[]>([])

    React.useEffect(() => {
        setHistory(SearchHistoryService.getHistory())
    }, [])

    const handleSelectQuery = (query: string) => {
        onSelectQuery(query)
        onClose()
    }

    const handleDeleteItem = (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation()
        SearchHistoryService.removeFromHistory(itemId)
        setHistory(SearchHistoryService.getHistory())
    }

    const handleClearAll = () => {
        SearchHistoryService.clearHistory()
        setHistory([])
    }

    if (history.length === 0) {
        return (
            <div className={`bg-white border-3 border-black shadow-neo rounded-2xl ${className}`}>
                <div className="p-4">
                    <div className="text-center py-4">
                        <p className="text-black font-bold italic">Aucune recherche récente</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`bg-white border-3 border-black shadow-neo rounded-2xl ${className}`}>
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black uppercase tracking-tighter text-black">Récents</h2>
                    <button
                        onClick={handleClearAll}
                        className="text-xs font-bold text-black hover:underline"
                    >
                        Effacer tout
                    </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 border-2 border-transparent hover:border-black hover:bg-pop-pink rounded-xl transition-all duration-100 cursor-pointer group shadow-none hover:shadow-neo-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
                            onClick={() => handleSelectQuery(item.query)}
                        >
                            <div className="flex items-center justify-center w-6 h-6 text-black">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-black font-bold truncate">{item.query}</p>
                            </div>
                            <button
                                onClick={(e) => handleDeleteItem(e, item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 bg-white border-2 border-black hover:bg-pop-red rounded-md transition-all duration-100"
                                title="Supprimer"
                            >
                                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}