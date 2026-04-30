'use client'

import {
  createContext,
  useContext,
  useTransition,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'

interface LoadingContextType {
  isPending: boolean
  startLoading: (fn: () => void) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition()
  const [manualLoading, setManualLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Clear manual loading flag when route actually changes (rendering complete)
  useEffect(() => {
    setManualLoading(false)
  }, [pathname])

  // Intercept all internal anchor/link clicks to show loading immediately
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore modified clicks (open in new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return
      }

      const target = e.target as HTMLElement | null
      if (!target) return

      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip external links, hash links, mailto, tel, downloads
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.hasAttribute('download') ||
        anchor.target === '_blank'
      ) {
        return
      }

      // Don't show loading if navigating to current page
      if (href === pathname) return

      // Show loading immediately
      setManualLoading(true)
    }

    document.addEventListener('click', handleDocumentClick, true)
    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
    }
  }, [pathname])

  // Intercept form submissions to show loading
  useEffect(() => {
    const handleSubmit = () => {
      setManualLoading(true)
    }

    document.addEventListener('submit', handleSubmit, true)
    return () => {
      document.removeEventListener('submit', handleSubmit, true)
    }
  }, [])

  const showLoading = isPending || manualLoading

  function startLoading(fn: () => void) {
    setManualLoading(true)
    startTransition(fn)
  }

  useEffect(() => {
    if (!showLoading || !overlayRef.current) return

    const handleEvent = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
    }

    const overlay = overlayRef.current
    overlay.addEventListener('pointerdown', handleEvent, true)
    overlay.addEventListener('click', handleEvent, true)
    overlay.addEventListener('mousedown', handleEvent, true)
    overlay.addEventListener('touchstart', handleEvent, true)

    const originalScroll = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      overlay.removeEventListener('pointerdown', handleEvent, true)
      overlay.removeEventListener('click', handleEvent, true)
      overlay.removeEventListener('mousedown', handleEvent, true)
      overlay.removeEventListener('touchstart', handleEvent, true)
      document.body.style.overflow = originalScroll
    }
  }, [showLoading])

  return (
    <LoadingContext.Provider value={{ isPending: showLoading, startLoading }}>
      {children}

      {showLoading && (
        <>
          {/* Blurred dimmed background covering entire screen */}
          <div
            className="fixed inset-0 z-[9997]"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
            }}
            aria-hidden="true"
          />

          {/* Click-blocking overlay */}
          <div
            ref={overlayRef}
            className="fixed inset-0 z-[9998]"
            style={{
              pointerEvents: 'auto',
              cursor: 'wait',
            }}
            aria-hidden="true"
          />

          {/* Centered loading modal */}
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
            role="status"
            aria-live="polite"
            aria-label="Loading page"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 border-r-purple-400 animate-spin" />
                </div>

                <div className="text-center">
                  <p className="text-white font-semibold text-lg">Loading</p>
                  <p className="text-gray-400 text-sm mt-1">Please wait...</p>
                </div>

                <div className="flex gap-2">
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
