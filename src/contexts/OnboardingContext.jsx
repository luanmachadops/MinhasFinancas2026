import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ONBOARDING_STEPS } from '../constants/onboardingSteps';

const OnboardingContext = createContext({});

export const useOnboarding = () => useContext(OnboardingContext);

const STORAGE_KEY = 'onboarding_completed';
const TOTAL_STEPS = ONBOARDING_STEPS.length;

export const OnboardingProvider = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [targetElement, setTargetElement] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');

    // Check if user has completed onboarding before
    useEffect(() => {
        const hasCompleted = localStorage.getItem(STORAGE_KEY);
        if (!hasCompleted) {
            // Small delay to let the app render first
            const timer = setTimeout(() => {
                setIsActive(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, []);

    // Update target element when step changes
    useEffect(() => {
        if (!isActive) {
            setTargetElement(null);
            return;
        }

        const step = ONBOARDING_STEPS[currentStep];
        if (!step?.targetId) {
            setTargetElement(null);
            return;
        }

        // Find the target element for spotlight effect
        const findTarget = () => {
            const element = document.getElementById(step.targetId);
            if (element) {
                setTargetElement(element);
            } else {
                setTargetElement(null);
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(findTarget, 150);
        return () => clearTimeout(timer);
    }, [currentStep, isActive]);

    // Listen for page changes to auto-advance action steps
    const notifyPageChange = useCallback((newPage) => {
        setCurrentPage(newPage);

        if (!isActive) return;

        const step = ONBOARDING_STEPS[currentStep];
        if (step?.requiresAction && step?.nextTrigger) {
            const [triggerType, triggerValue] = step.nextTrigger.split(':');
            if (triggerType === 'page' && triggerValue === newPage) {
                // User navigated to the expected page, advance to next step
                setTimeout(() => {
                    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
                }, 300);
            }
        }
    }, [isActive, currentStep]);

    const startTutorial = useCallback(() => {
        setCurrentStep(0);
        setIsActive(true);
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            completeTutorial();
        }
    }, [currentStep]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const skipTutorial = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsActive(false);
        setCurrentStep(0);
    }, []);

    const completeTutorial = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsActive(false);
        setCurrentStep(0);
    }, []);

    const resetTutorial = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setCurrentStep(0);
        setIsActive(true);
    }, []);

    const value = {
        currentStep,
        isActive,
        targetElement,
        currentPage,
        totalSteps: TOTAL_STEPS,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        completeTutorial,
        resetTutorial,
        notifyPageChange,
    };

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
};

export default OnboardingProvider;
