import React, { useState, useRef, useEffect } from 'react'
import SearchHistory from './SearchHistory'
import { SearchHistoryService } from '../lib/searchHistory'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    onSubmit?: (query: string) => void
    isLoading?: boolean
    placeholder?: string
    className?: string
}

export default function SearchBar({
    value,
    onChange,
    onSubmit,
    isLoading = false,
    placeholder = "Rechercher des utilisateurs...",
    className = ""
}: SearchBarProps) {
    const [showHistory, setShowHistory] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Close history when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowHistory(false)
                setIsFocused(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleFocus = () => {
        setIsFocused(true)
        if (!value.trim()) {
            setShowHistory(true)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        onChange(newValue)

        // Show history when input is empty, hide when typing
        if (!newValue.trim()) {
            setShowHistory(true)
        } else {
            setShowHistory(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && value.trim()) {
            SearchHistoryService.addToHistory(value.trim())
            onSubmit?.(value.trim())
            setShowHistory(false)
            inputRef.current?.blur()
        }
    }

    const handleSelectFromHistory = (query: string) => {
        onChange(query)
        setShowHistory(false)
        // Trigger search immediately when selecting from history
        onSubmit?.(query)
    }

    const handleCloseHistory = () => {
        setShowHistory(false)
    }

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg rounded-3xl px-4 py-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full pl-10 pr-4 bg-transparent text-black placeholder-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-music-500/40 transition-all duration-300"
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onKeyDown={handleKeyDown}
                    />
                    {isLoading && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg className="animate-spin h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Search History Dropdown */}
            {showHistory && isFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50">
                    <SearchHistory
                        onSelectQuery={handleSelectFromHistory}
                        onClose={handleCloseHistory}
                        className="max-w-2xl mx-auto"
                    />
                </div>
            )}
        </div>
    )
}