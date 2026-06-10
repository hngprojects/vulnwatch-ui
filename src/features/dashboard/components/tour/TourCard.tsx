'use client'

import { TourStep, ArrowDirection } from '../../data/tourSteps'
import { ArrowRight } from 'lucide-react'

interface TourCardProps {
    step: TourStep
    currentIndex: number
    totalSteps: number
    onNext: () => void
    onSkip: () => void
    actualArrow?: ArrowDirection
}

export function TourCard({ step, currentIndex, totalSteps, onNext, onSkip, actualArrow }: TourCardProps) {
    const arrow = actualArrow || step.arrow

    return (
        <div className="relative bg-white z-9999 rounded-[12px] p-4 md:p-6 w-[285px] md:w-[480px] shadow-lg border-2 border-primary">

            {/* Arrow — top */}
            {arrow === 'top' && (
                <div className="hidden md:block absolute -top-5 left-1/2 -translate-x-1/2 w-0 h-0
                    border-l-[14px] border-l-transparent
                    border-r-[14px] border-r-transparent
                    border-b-[16px] border-b-primary" />
            )}

            {/* Arrow — bottom */}
            {arrow === 'bottom' && (
                <div className="hidden md:block absolute -bottom-5 left-1/2 -translate-x-1/2 w-0 h-0
                    border-l-[14px] border-l-transparent
                    border-r-[14px] border-r-transparent
                    border-t-[16px] border-t-primary" />
            )}

            {/* Arrow — left */}
            {arrow === 'left' && (
                <div className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 w-0 h-0
                    border-t-[14px] border-t-transparent
                    border-b-[14px] border-b-transparent
                    border-r-[16px] border-r-primary" />
            )}

            {/* Arrow — right */}
            {arrow === 'right' && (
                <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-0 h-0
                    border-t-[14px] border-t-transparent
                    border-b-[14px] border-b-transparent
                    border-l-[16px] border-l-primary" />
            )}

            {/* Label */}
            <p className="text-[10px] md:text-[14px] font-medium text-[#072E28] tracking-widest mb-2">
                {step.label}
            </p>

            {/* Title */}
            <h3 className="text-sm md:text-[14px] font-semibold text-black mb-2">
                {step.title}
            </h3>

            {/* Description */}
            <p className="text-xs md:text-[13px] font-[500] text-[#323232] leading-relaxed mb-4">
                {step.description}
            </p>

            {/* Progress pills inside bordered box */}
            <div className="border border-[#072E28] rounded-md px-2 py-2 mb-6">
                <div className="flex gap-1.5">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex
                                ? 'w-8 bg-primary'
                                : 'w-6 bg-border'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onSkip}
                    className="text-[10px] md:text-[10px] text-muted-foreground hover:text-header tracking-widest transition-colors cursor-pointer"
                >
                    SKIP TOUR
                </button>
                <button
                    onClick={onNext}
                    className="text-[10px] md:text-[10px] font-medium text-primary hover:opacity-80 tracking-widest transition-opacity flex items-center gap-1 cursor-pointer"
                >
                    {step.buttonLabel === 'done' ? 'DONE' : 'CONTINUE'} <ArrowRight className="w-[12px] h-[12px] mb-1 text-[#64748B]" />
                </button>
            </div>

        </div>
    )
}