'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { TourCard } from './TourCard'
import { useTour } from '../../hooks/useTour'
import { ArrowDirection } from '../../data/tourSteps'

export function TourProvider() {
    const { currentStep, currentStepIndex, isVisible, next, skip, totalSteps } = useTour()
    const [cardStyle, setCardStyle] = useState<React.CSSProperties>({ opacity: 0 })
    const [actualArrow, setActualArrow] = useState<ArrowDirection>('none')
    const wrapperRef = useRef<HTMLDivElement>(null)

    const updatePosition = useCallback(() => {
        if (!isVisible || !currentStep) return

        // 1. Find target element
        const targetElement = document.querySelector(currentStep.targetSelector) as HTMLElement
        
        // If element is not yet rendered, fallback to center and wait for polling
        if (!targetElement) {
            setCardStyle({
                opacity: 1,
                pointerEvents: 'auto',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            })
            setActualArrow('none')
            return
        }

        // 2. Measure DOM rect
        const rect = targetElement.getBoundingClientRect()
        
        const cardWidth = wrapperRef.current?.offsetWidth || 300
        const cardHeight = wrapperRef.current?.offsetHeight || 250

        // 3. Highlight the element safely
        document.querySelectorAll('.tour-highlight-active').forEach(el => {
            if (el !== targetElement) {
                el.classList.remove('tour-highlight-active')
            }
        })
        if (!targetElement.classList.contains('tour-highlight-active')) {
            targetElement.classList.add('tour-highlight-active')
        }

        // 4. Smart Auto-Flipping & Positioning
        let top = 0
        let left = 0
        let finalArrow = currentStep.arrow
        const offset = 24 // Gap between button and card

        if (currentStep.arrow === 'top') {
            if (rect.bottom + cardHeight + offset < window.innerHeight) {
                top = rect.bottom + offset
                left = rect.left + (rect.width / 2) - (cardWidth / 2)
                finalArrow = 'top'
            } else {
                top = rect.top - cardHeight - offset
                left = rect.left + (rect.width / 2) - (cardWidth / 2)
                finalArrow = 'bottom'
            }
        } else if (currentStep.arrow === 'bottom') {
            if (rect.top - cardHeight - offset > 0) {
                top = rect.top - cardHeight - offset
                left = rect.left + (rect.width / 2) - (cardWidth / 2)
                finalArrow = 'bottom'
            } else {
                top = rect.bottom + offset
                left = rect.left + (rect.width / 2) - (cardWidth / 2)
                finalArrow = 'top'
            }
        } else if (currentStep.arrow === 'left') {
            if (rect.right + cardWidth + offset < window.innerWidth) {
                top = rect.top + (rect.height / 2) - (cardHeight / 2)
                left = rect.right + offset
                finalArrow = 'left'
            } else {
                top = rect.top + (rect.height / 2) - (cardHeight / 2)
                left = rect.left - cardWidth - offset
                finalArrow = 'right'
            }
        } else if (currentStep.arrow === 'right') {
            if (rect.left - cardWidth - offset > 0) {
                top = rect.top + (rect.height / 2) - (cardHeight / 2)
                left = rect.left - cardWidth - offset
                finalArrow = 'right'
            } else {
                top = rect.top + (rect.height / 2) - (cardHeight / 2)
                left = rect.right + offset
                finalArrow = 'left'
            }
        }

        // Clamp to window edges to prevent overflow
        top = Math.max(16, Math.min(top, window.innerHeight - cardHeight - 16))
        left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16))

        setCardStyle({
            top: `${top}px`,
            left: `${left}px`,
            opacity: 1,
            position: 'fixed'
        })
        setActualArrow(finalArrow)
    }, [currentStep, isVisible])

    // Cleanup highlight on unmount
    useEffect(() => {
        if (!isVisible) {
            document.querySelectorAll('.tour-highlight-active').forEach(el => {
                el.classList.remove('tour-highlight-active')
            })
        }
    }, [isVisible])

    // Use polling to guarantee we always find the element even if it mounts late
    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | null = null
        
        if (isVisible) {
            setTimeout(updatePosition, 0)
            timer = setInterval(updatePosition, 100)
            window.addEventListener('resize', updatePosition)
            window.addEventListener('scroll', updatePosition, true)
        }
        
        return () => {
            if (timer) clearInterval(timer)
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
        }
    }, [updatePosition, isVisible])

    if (!isVisible) return null

    return (
        <>
            {/* Standard full screen backdrop at z-40 */}
            <div className='fixed inset-0 pointer-events-auto bg-black/70 transition-all duration-300 z-[40]' />

            {/* Dynamic Card Container at z-60 */}
            <div 
                ref={wrapperRef}
                className="fixed pointer-events-auto transition-all duration-300 ease-out z-[60]" 
                style={cardStyle}
            >
                <TourCard
                    step={currentStep}
                    currentIndex={currentStepIndex}
                    totalSteps={totalSteps}
                    onNext={next}
                    onSkip={skip}
                    actualArrow={actualArrow}
                />
            </div>
        </>
    )
}