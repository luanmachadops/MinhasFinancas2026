import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { ONBOARDING_STEPS } from '../../constants/onboardingSteps';
import { ChevronRight, ChevronLeft, X, Hand } from 'lucide-react';

export const OnboardingOverlay = () => {
    const {
        isActive,
        currentStep,
        totalSteps,
        targetElement,
        nextStep,
        prevStep,
        skipTutorial
    } = useOnboarding();

    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, placement: 'bottom' });
    const [spotlightRect, setSpotlightRect] = useState(null);

    const step = ONBOARDING_STEPS[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;
    const isCenteredStep = !step?.targetId;
    const isActionStep = step?.requiresAction;

    // Calculate spotlight and tooltip positions
    useEffect(() => {
        if (!isActive || !targetElement || isCenteredStep) {
            setSpotlightRect(null);
            return;
        }

        const updatePositions = () => {
            const rect = targetElement.getBoundingClientRect();
            const padding = 12;

            setSpotlightRect({
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + (padding * 2),
                height: rect.height + (padding * 2),
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2,
            });

            // Position tooltip - ABOVE the nav bar, not covering it
            const tooltipWidth = 320;
            const tooltipHeight = 200;
            const margin = 24;

            // Always position tooltip above the navigation bar
            // Nav bar is at the bottom, so put tooltip higher up on the screen
            let top = rect.top - tooltipHeight - margin - padding;
            let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

            // If not enough space on top, position at a fixed safe area
            if (top < 80) {
                top = Math.max(100, window.innerHeight / 2 - tooltipHeight - 100);
            }

            // Keep within viewport horizontally
            if (left < 16) left = 16;
            if (left + tooltipWidth > window.innerWidth - 16) {
                left = window.innerWidth - tooltipWidth - 16;
            }

            setTooltipPosition({ top, left, width: tooltipWidth });
        };

        updatePositions();
        window.addEventListener('resize', updatePositions);
        window.addEventListener('scroll', updatePositions, true);
        return () => {
            window.removeEventListener('resize', updatePositions);
            window.removeEventListener('scroll', updatePositions, true);
        };
    }, [isActive, targetElement, currentStep, isCenteredStep]);

    if (!isActive) return null;

    const StepIcon = step?.icon;

    return (
        <>
            {/* Backdrop with hole for spotlight - NO click handler to close */}
            {!isCenteredStep && spotlightRect && (
                <div className="fixed inset-0 z-[9998] pointer-events-none">
                    {/* Top section */}
                    <div
                        className="absolute bg-slate-950/80 pointer-events-auto cursor-default"
                        style={{
                            top: 0,
                            left: 0,
                            right: 0,
                            height: spotlightRect.top
                        }}
                    />
                    {/* Left section */}
                    <div
                        className="absolute bg-slate-950/80 pointer-events-auto cursor-default"
                        style={{
                            top: spotlightRect.top,
                            left: 0,
                            width: spotlightRect.left,
                            height: spotlightRect.height
                        }}
                    />
                    {/* Right section */}
                    <div
                        className="absolute bg-slate-950/80 pointer-events-auto cursor-default"
                        style={{
                            top: spotlightRect.top,
                            left: spotlightRect.left + spotlightRect.width,
                            right: 0,
                            height: spotlightRect.height
                        }}
                    />
                    {/* Bottom section */}
                    <div
                        className="absolute bg-slate-950/80 pointer-events-auto cursor-default"
                        style={{
                            top: spotlightRect.top + spotlightRect.height,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}
                    />

                    {/* Spotlight ring - pulsing border around the interactive area */}
                    <div
                        className="absolute rounded-2xl border-2 border-blue-400 pointer-events-none"
                        style={{
                            top: spotlightRect.top,
                            left: spotlightRect.left,
                            width: spotlightRect.width,
                            height: spotlightRect.height,
                            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 30px 8px rgba(59, 130, 246, 0.3)',
                            animation: 'pulse 2s ease-in-out infinite',
                        }}
                    />

                    {/* Click here indicator - positioned ABOVE the spotlight */}
                    {isActionStep && (
                        <div
                            className="absolute flex items-center gap-2 text-blue-400 pointer-events-none"
                            style={{
                                top: spotlightRect.top - 32,
                                left: spotlightRect.centerX,
                                transform: 'translateX(-50%)',
                                animation: 'bounce 1s ease-in-out infinite',
                            }}
                        >
                            <Hand className="w-5 h-5 rotate-180" />
                            <span className="text-sm font-medium whitespace-nowrap">Clique aqui</span>
                        </div>
                    )}
                </div>
            )}

            {/* Centered modal for welcome/complete steps - NO close on backdrop click */}
            {isCenteredStep && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/90 cursor-default" />
                    <div className="relative bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl shadow-black/50 w-full max-w-md animate-[scaleIn_0.3s_ease-out]">
                        <TooltipContent
                            step={step}
                            StepIcon={StepIcon}
                            currentStep={currentStep}
                            totalSteps={totalSteps}
                            isFirstStep={isFirstStep}
                            isLastStep={isLastStep}
                            isActionStep={isActionStep}
                            onNext={nextStep}
                            onPrev={prevStep}
                            onSkip={skipTutorial}
                        />
                    </div>
                </div>
            )}

            {/* Floating tooltip for spotlight steps - positioned ABOVE the nav */}
            {!isCenteredStep && spotlightRect && (
                <div
                    className="fixed z-[9999] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 animate-[scaleIn_0.2s_ease-out]"
                    style={{
                        top: tooltipPosition.top,
                        left: tooltipPosition.left,
                        width: tooltipPosition.width,
                    }}
                >
                    <TooltipContent
                        step={step}
                        StepIcon={StepIcon}
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        isFirstStep={isFirstStep}
                        isLastStep={isLastStep}
                        isActionStep={isActionStep}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onSkip={skipTutorial}
                        compact
                    />
                </div>
            )}
        </>
    );
};

// Tooltip content component
const TooltipContent = ({
    step,
    StepIcon,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    isActionStep,
    onNext,
    onPrev,
    onSkip,
    compact = false
}) => (
    <div className={compact ? 'p-4' : 'p-6'}>
        {/* Header with icon */}
        <div className="flex items-start gap-3 mb-3">
            {StepIcon && (
                <div className={`${compact ? 'p-2' : 'p-3'} rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-600/30 flex-shrink-0`}>
                    <StepIcon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-white mb-1`}>
                    {step?.title}
                </h3>
                <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-400 leading-relaxed`}>
                    {step?.description}
                </p>
            </div>
        </div>

        {/* Action hint */}
        {isActionStep && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <Hand className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-xs text-blue-300">
                    {step?.actionHint || 'Clique no elemento destacado para continuar'}
                </span>
            </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                    key={i}
                    className={`
                        h-1.5 rounded-full transition-all duration-300
                        ${i === currentStep
                            ? 'w-4 bg-blue-500'
                            : i < currentStep
                                ? 'w-1.5 bg-blue-500/50'
                                : 'w-1.5 bg-slate-700'
                        }
                    `}
                />
            ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
            <button
                onClick={onSkip}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
                Pular Tutorial
            </button>

            <div className="flex gap-2">
                {!isFirstStep && (
                    <button
                        onClick={onPrev}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}

                {!isActionStep && (
                    <button
                        onClick={onNext}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all active:scale-95"
                    >
                        {isLastStep ? 'Concluir' : 'Próximo'}
                        {!isLastStep && <ChevronRight className="w-3 h-3" />}
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default OnboardingOverlay;
