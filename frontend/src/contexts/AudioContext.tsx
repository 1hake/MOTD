import React, { createContext, useContext, useRef, useState, useCallback } from 'react'

type AudioState = {
    postId: number
    audioElement: HTMLAudioElement
    previewUrl: string
}

type AudioContextType = {
    currentlyPlaying: number | null
    isPlaying: (postId: number) => boolean
    play: (postId: number, previewUrl: string) => Promise<void>
    pause: (postId: number) => void
    toggle: (postId: number, previewUrl: string) => Promise<void>
    stopAll: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
    const audioRegistry = useRef<Map<number, HTMLAudioElement>>(new Map())

    const stopAll = useCallback(() => {
        console.log('🛑 Stopping all audio')
        audioRegistry.current.forEach((audio, postId) => {
            audio.pause()
            audio.currentTime = 0
        })
        setCurrentlyPlaying(null)
    }, [])

    const pause = useCallback((postId: number) => {
        const audio = audioRegistry.current.get(postId)
        if (audio) {
            console.log('⏸️ Pausing audio for post:', postId)
            audio.pause()
            audio.currentTime = 0
            if (currentlyPlaying === postId) {
                setCurrentlyPlaying(null)
            }
        }
    }, [currentlyPlaying])

    const play = useCallback(async (postId: number, previewUrl: string) => {
        console.log('▶️ Play requested for post:', postId)

        // Stop any currently playing audio
        if (currentlyPlaying !== null && currentlyPlaying !== postId) {
            console.log('⏹️ Stopping previous audio:', currentlyPlaying)
            const prevAudio = audioRegistry.current.get(currentlyPlaying)
            if (prevAudio) {
                prevAudio.pause()
                prevAudio.currentTime = 0
            }
        }

        // Get or create audio element
        let audio = audioRegistry.current.get(postId)

        if (!audio) {
            console.log('🆕 Creating new audio element for post:', postId)
            audio = new Audio(previewUrl)
            audio.loop = true
            audio.volume = 1.0
            audio.muted = false
            audio.preload = 'auto'

            // Add to DOM for better compatibility
            audio.id = `audio-${postId}`
            audio.style.display = 'none'
            document.body.appendChild(audio)

            // Event listeners for debugging
            audio.addEventListener('loadeddata', () => {
                console.log('📥 Audio loaded for post:', postId, 'duration:', audio!.duration)
            })

            audio.addEventListener('playing', () => {
                console.log('🎵 Audio playing for post:', postId)
            })

            audio.addEventListener('error', (e) => {
                console.error('🔥 Audio error for post:', postId, audio!.error)
            })

            // Clean up when audio ends (shouldn't happen with loop, but just in case)
            audio.addEventListener('ended', () => {
                console.log('🏁 Audio ended for post:', postId)
                if (currentlyPlaying === postId) {
                    setCurrentlyPlaying(null)
                }
            })

            audioRegistry.current.set(postId, audio)
        } else {
            console.log('🔄 Reusing existing audio for post:', postId)
            audio.currentTime = 0
        }

        // Play the audio
        try {
            await audio.play()
            console.log('✅ Audio playing successfully for post:', postId)
            setCurrentlyPlaying(postId)
        } catch (error) {
            console.error('❌ Play error for post:', postId, error)
            throw error
        }
    }, [currentlyPlaying])

    const toggle = useCallback(async (postId: number, previewUrl: string) => {
        if (currentlyPlaying === postId) {
            pause(postId)
        } else {
            await play(postId, previewUrl)
        }
    }, [currentlyPlaying, play, pause])

    const isPlaying = useCallback((postId: number) => {
        return currentlyPlaying === postId
    }, [currentlyPlaying])

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            console.log('🧹 Cleaning up AudioContext')
            audioRegistry.current.forEach((audio) => {
                audio.pause()
                if (audio.parentNode) {
                    audio.parentNode.removeChild(audio)
                }
            })
            audioRegistry.current.clear()
        }
    }, [])

    return (
        <AudioContext.Provider value={{ currentlyPlaying, isPlaying, play, pause, toggle, stopAll }}>
            {children}
        </AudioContext.Provider>
    )
}

export function useAudio() {
    const context = useContext(AudioContext)
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider')
    }
    return context
}
