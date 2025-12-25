"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StepCardProps {
    children: ReactNode;
    className?: string;
}

export function StepCard({ children, className }: StepCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "glass-strong rounded-3xl p-8 md:p-10 max-w-lg w-full mx-auto",
                "shadow-2xl shadow-black/20",
                className
            )}
        >
            {children}
        </motion.div>
    );
}

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-3 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
                <motion.div
                    key={i}
                    className={cn(
                        "step-dot",
                        i < currentStep && "completed",
                        i === currentStep && "active",
                        i > currentStep && "pending"
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                />
            ))}
            <span className="ml-3 text-sm text-white/50 font-medium">
                Step {currentStep + 1} of {totalSteps}
            </span>
        </div>
    );
}
