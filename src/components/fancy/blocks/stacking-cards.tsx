"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

// --- Types ---

export interface StackingCardItemProps {
    index: number
    className?: string
    children: React.ReactNode
}

export interface StackingCardsProps {
    totalCards: number
    children: React.ReactNode
    scrollOptions?: {
        container?: React.RefObject<HTMLDivElement | null>
    }
    className?: string
}

// --- Internal stacking logic ---

const STACK_OVERLAP = 80 // px — how much the next card peeks from under the current one

function StackingCardItem({ children, index, className }: StackingCardItemProps) {
    const ref = useRef<HTMLDivElement>(null)

    return (
        <div
            ref={ref}
            className={cn(
                "sticky w-full shrink-0",
                className,
            )}
            style={{
                top: `${index * STACK_OVERLAP}px`,
                zIndex: 10 + index,
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    )
}

// --- Public component ---

export default function StackingCards({
    totalCards,
    children,
    scrollOptions,
    className,
}: StackingCardsProps) {
    const childrenArray = React.Children.toArray(children)

    return (
        <div className={cn("relative", className)}>
            {childrenArray.map((child, index) => {
                // Pass index prop to StackingCardItem children
                if (React.isValidElement(child) && (child.type as any) === StackingCardItem) {
                    return React.cloneElement(child as React.ReactElement<StackingCardItemProps>, {
                        index,
                    })
                }
                return child
            })}

            {/* Spacer to allow full scroll range */}
            <div style={{ height: `${totalCards * STACK_OVERLAP}px` }} />
        </div>
    )
}

export { StackingCardItem }
