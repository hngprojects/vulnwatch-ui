// hooks/useTour.ts
import { useState, useEffect } from 'react'
import { tourSteps, TourStep } from '../data/tourSteps'

const TOUR_KEY = 'vuln_watch_tour_completed'

export function useTour() {
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem(TOUR_KEY) !== 'true'
    })

    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isVisible])

    // end tour if on last step else increment to next step
    const next = () => {
        if (currentStepIndex === tourSteps.length - 1) {
            completeTour()
        } else {
            setCurrentStepIndex(prev => prev + 1)
        }
    }

    // skip the tour
    const skip = () => {
        setIsVisible(false)
        localStorage.setItem(TOUR_KEY, 'true')
        document.body.style.overflow = ''
    }

    // complete the tour
    const completeTour = () => {
        setIsVisible(false)
        localStorage.setItem(TOUR_KEY, 'true')
        document.body.style.overflow = ''
    }

    const currentStep: TourStep = tourSteps[currentStepIndex]

    return {
        currentStep,
        currentStepIndex,
        isVisible,
        next,
        skip,
        totalSteps: tourSteps.length,
    }
}