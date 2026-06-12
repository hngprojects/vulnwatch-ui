'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { TourCard } from './TourCard'
import { useTour } from '../../hooks/useTour'
import { ArrowDirection } from '../../data/tourSteps'

export function TourProvider() {
    const { currentStep, currentStepIndex, isVisible, next, skip, totalSteps } = useTour()
    const [cardStyle, setCardStyle] = useState<React.CSSProperties>({ opacity: 0 })
    const [actualArrow, setActualArrow] = useState<ArrowDirection>('none')
    const [arrowOffset, setArrowOffset] = useState<{ x?: number, y?: number }>({})
    const wrapperRef = useRef<HTMLDivElement>(null)

    const updatePosition = useCallback(() => {
        if (!isVisible || !currentStep) return

        // 1. Find target element (first visible one)
        const elements = document.querySelectorAll(currentStep.targetSelector)
        let targetElement: HTMLElement | null = null
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement
            const r = el.getBoundingClientRect()
            if (r.width > 0 && r.height > 0) {
                targetElement = el
                break
            }
        }
        
        // If element is not yet rendered or visible, fallback to center and wait for polling
        if (!targetElement) {
            document.querySelectorAll('.tour-highlight-active').forEach(el => {
                el.classList.remove('tour-highlight-active')
            })
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
        const offset = 24 // Gap between button and card

        // mobile overrides
        let requestedArrow = currentStep.arrow
        if (window.innerWidth < 768 && (requestedArrow === 'left' || requestedArrow === 'right')) {
            requestedArrow = (rect.top < window.innerHeight / 2) ? 'top' : 'bottom'
        }

        let finalArrow = requestedArrow

        if (requestedArrow === 'none') {
            top = (window.innerHeight / 2) - (cardHeight / 2)
            left = (window.innerWidth / 2) - (cardWidth / 2)
            finalArrow = 'none'
        } else if (requestedArrow === 'top') {
            if (rect.bottom + cardHeight + offset < window.innerHeight) {
                top = rect.bottom + offset
                left = rect.left + (rect.width / 2) - (cardWidth / 2)
                finalArrow = 'top'
            } else {
                top = rect.top - cardHeight - offset
                left = rect.left + (rect.width / 2) - (cardWidth / 2)
                finalArrow = 'bottom'
            }
        } else if (requestedArrow === 'bottom') {
            if (rect.top - cardHeight - offset > 0) {
                top = rect.top - cardHeight - offset
                left = rect.left + (rect.width / 2) - (cardWidth / 2)
                finalArrow = 'bottom'
            } else {
                top = rect.bottom + offset
                left = rect.left + (rect.width / 2) - (cardWidth / 2)
                finalArrow = 'top'
            }
        } else if (requestedArrow === 'left') {
            if (rect.right + cardWidth + offset < window.innerWidth) {
                top = rect.top + (rect.height / 2) - (cardHeight / 2)
                left = rect.right + offset
                finalArrow = 'left'
            } else {
                top = rect.top + (rect.height / 2) - (cardHeight / 2)
                left = rect.left - cardWidth - offset
                finalArrow = 'right'
            }
        } else if (requestedArrow === 'right') {
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
        const clampedTop = Math.max(16, Math.min(top, window.innerHeight - cardHeight - 16))
        const clampedLeft = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16))

        let arrowOffsetY: number | undefined
        let arrowOffsetX: number | undefined

        if (finalArrow === 'left' || finalArrow === 'right') {
            const targetCenterY = rect.top + rect.height / 2
            let y = targetCenterY - clampedTop
            y = Math.max(24, Math.min(y, cardHeight - 24))
            arrowOffsetY = y
        } else if (finalArrow === 'top' || finalArrow === 'bottom') {
            const targetCenterX = rect.left + rect.width / 2
            let x = targetCenterX - clampedLeft
            x = Math.max(24, Math.min(x, cardWidth - 24))
            arrowOffsetX = x
        }

        setCardStyle({
            top: `${clampedTop}px`,
            left: `${clampedLeft}px`,
            opacity: 1,
            position: 'fixed'
        })
        setActualArrow(finalArrow)
        setArrowOffset({ x: arrowOffsetX, y: arrowOffsetY })
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
            <style dangerouslySetInnerHTML={{ __html: `
                #tour-resources.tour-highlight-active,
                #tour-mobile-menu.tour-highlight-active {
                    background-color: white !important;
                    border-radius: 8px !important;
                }
                
                header:has(.tour-highlight-active) {
                    /* Drop header stacking context so the button can break out */
                    z-index: auto !important;
                }
                aside:has(.tour-highlight-active) {
                    z-index: 50 !important;
                }
            `}} />
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
                    arrowOffset={arrowOffset}
                />
            </div>
        </>
    )
}