import React, { useState, useEffect } from 'react'
import { getPushPermissionStatus, registerPushNotifications } from '../push'
import { Capacitor } from '@capacitor/core'

export default function NotificationPermissionCard() {
  const [status, setStatus] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const checkStatus = async () => {
      const currentStatus = await getPushPermissionStatus()
      setStatus(currentStatus)

      // Only show if status is 'prompt' or 'default' (not granted, and not denied)
      if (currentStatus === 'prompt' || currentStatus === 'default') {
        // Also check if we've already shown it recently? 
        // For now, let's just show it.
        setIsVisible(true)
      }
    }

    checkStatus()
  }, [])

  const handleAccept = async () => {
    const success = await registerPushNotifications()
    if (success) {
      setIsVisible(false)
    } else {
      // If they denied or it failed, we hide it for this session
      setIsVisible(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="mx-4 my-6 p-6 bg-pop-yellow border-4 border-black rounded-3xl shadow-neo animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white border-3 border-black rounded-2xl flex items-center justify-center text-2xl shrink-0 rotate-3">
            🔔
          </div>
          <div>
            <h3 className="text-xl font-black text-black uppercase italic leading-none mb-1">
              Active les notifs !
            </h3>
            <p className="text-sm font-bold text-black opacity-80">
              Ne manque pas la chanson du jour de tes amis. Promis, on ne spamme pas ! 🎵
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-3 bg-black text-white font-black uppercase italic rounded-xl border-3 border-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-sm active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all"
          >
            C'est parti !
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-4 py-3 bg-white text-black font-black uppercase italic rounded-xl border-3 border-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-sm active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  )
}

