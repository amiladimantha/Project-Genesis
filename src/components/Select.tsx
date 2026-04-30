'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  name?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  required?: boolean
  id?: string
}

/**
 * Theme-aware custom dropdown that fully respects light/dark mode.
 * Drop-in replacement for native <select> elements.
 *
 * The popup is rendered into a React portal so it is never trapped
 * inside parent stacking contexts (e.g. cards using backdrop-filter).
 *
 * Renders a hidden <input> so the value is included in form submissions
 * when used inside a <form action={...}>.
 */
export function Select({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  required = false,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Compute popup position whenever it opens, on scroll, or on resize.
  useLayoutEffect(() => {
    if (!isOpen) return

    function updatePosition() {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const panelHeight = panelRef.current?.offsetHeight ?? 240
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < panelHeight + 16 && rect.top > panelHeight

      setPosition({
        top: openUpward
          ? rect.top + window.scrollY - panelHeight - 8
          : rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  // Outside-click + Escape handlers
  useEffect(() => {
    if (!isOpen) return

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setIsOpen(false)
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  const baseTrigger =
    'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-white text-left transition flex items-center justify-between focus:ring-2 focus:ring-purple-500 focus:border-transparent'

  return (
    <div className={`relative ${className}`}>
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
        />
      )}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={baseTrigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selected ? '' : 'text-gray-500'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {mounted && isOpen &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            style={{
              position: 'absolute',
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 9999,
            }}
            className="max-h-60 overflow-y-auto rounded-xl border dropdown-panel shadow-2xl backdrop-blur-xl"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition dropdown-item ${
                  value === opt.value
                    ? 'bg-purple-500/30 text-purple-300 font-medium'
                    : ''
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}
