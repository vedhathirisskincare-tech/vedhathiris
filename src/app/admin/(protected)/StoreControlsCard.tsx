'use client'

import { useState } from 'react'
import { Bot, Sparkles, Loader2, ShieldCheck } from 'lucide-react'
import { toggleAiAssistantSetting, toggleVisitorPopupSetting } from './actions'
import { useToast } from '@/components/Toast'

interface StoreControlsCardProps {
  initialAiChatEnabled: boolean
  initialPopupEnabled: boolean
}

export function StoreControlsCard({
  initialAiChatEnabled,
  initialPopupEnabled,
}: StoreControlsCardProps) {
  const [aiChatEnabled, setAiChatEnabled] = useState(initialAiChatEnabled)
  const [popupEnabled, setPopupEnabled] = useState(initialPopupEnabled)
  const [isUpdatingAi, setIsUpdatingAi] = useState(false)
  const [isUpdatingPopup, setIsUpdatingPopup] = useState(false)
  const toast = useToast()

  const handleToggleAiChat = async () => {
    const nextState = !aiChatEnabled
    setAiChatEnabled(nextState)
    setIsUpdatingAi(true)
    try {
      await toggleAiAssistantSetting(nextState)
      toast.success(
        nextState
          ? 'Vedha AI Chat Bot is now ON and visible to customers!'
          : 'Vedha AI Chat Bot is now OFF and hidden from customers.'
      )
    } catch (err: any) {
      setAiChatEnabled(!nextState)
      toast.error(err.message || 'Failed to update AI Chat Bot setting')
    } finally {
      setIsUpdatingAi(false)
    }
  }

  const handleTogglePopup = async () => {
    const nextState = !popupEnabled
    setPopupEnabled(nextState)
    setIsUpdatingPopup(true)
    try {
      await toggleVisitorPopupSetting(nextState)
      toast.success(
        nextState
          ? 'Visitor login popup is now ON (appears in 3s)'
          : 'Visitor login popup is now OFF (hidden)'
      )
    } catch (err: any) {
      setPopupEnabled(!nextState)
      toast.error(err.message || 'Failed to update popup setting')
    } finally {
      setIsUpdatingPopup(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Store Feature Controls
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Instantly enable or disable customer-facing features on your storefront
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Chat Bot Feature */}
        <div
          className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
            aiChatEnabled
              ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
              : 'bg-gray-50/70 border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  aiChatEnabled
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                  AI Shopping Assistant (Vedha AI)
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      aiChatEnabled
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {aiChatEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Artisan chatbot for product recommendations & 1-click checkout
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 mt-auto">
            <span className="text-xs text-gray-600 font-medium">
              {aiChatEnabled
                ? '🟢 Visible on customer storefront'
                : '⚪ Completely hidden from visitors'}
            </span>

            <button
              type="button"
              onClick={handleToggleAiChat}
              disabled={isUpdatingAi}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                aiChatEnabled ? 'bg-emerald-600' : 'bg-gray-300'
              } ${isUpdatingAi ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={
                aiChatEnabled
                  ? 'Click to Turn OFF (Hide Bot from users)'
                  : 'Click to Turn ON (Display Bot to users)'
              }
              aria-label="Toggle AI shopping assistant"
            >
              <span
                className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  aiChatEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {isUpdatingAi && <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />}
              </span>
            </button>
          </div>
        </div>

        {/* Visitor Login Popup Feature */}
        <div
          className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
            popupEnabled
              ? 'bg-violet-50/40 border-violet-200/80 shadow-2xs'
              : 'bg-gray-50/70 border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  popupEnabled
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                  Visitor Login Popup
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      popupEnabled
                        ? 'bg-violet-100 text-violet-800 border border-violet-300'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {popupEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Prompts new visitors to sign in after 3 seconds of browsing
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 mt-auto">
            <span className="text-xs text-gray-600 font-medium">
              {popupEnabled ? '🟢 Appears after 3 seconds' : '⚪ Hidden from visitors'}
            </span>

            <button
              type="button"
              onClick={handleTogglePopup}
              disabled={isUpdatingPopup}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                popupEnabled ? 'bg-violet-600' : 'bg-gray-300'
              } ${isUpdatingPopup ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={
                popupEnabled
                  ? 'Click to Turn OFF (Hide Popup)'
                  : 'Click to Turn ON (Show in 3s)'
              }
              aria-label="Toggle visitor popup"
            >
              <span
                className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  popupEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {isUpdatingPopup && <Loader2 className="w-3 h-3 text-violet-600 animate-spin" />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

