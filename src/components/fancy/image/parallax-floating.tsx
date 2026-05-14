"use client"

import { useRef, createContext, useContext, useState, useEffect } from "react"
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
    type MotionValue,
} from "framer-motion"
import type { ReactNode, CSSProperties } from "react"

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface FloatingCtx {
    mouseX: MotionValue<number>
    mouseY: MotionValue<number>
    sensitivity: number
}

const Ctx = createContext<FloatingCtx | null>(null)

/* ------------------------------------------------------------------ */
/*  Floating – container theo dõi chuột                                */
/* ------------------------------------------------------------------ */

export interface FloatingProps {
    children: ReactNode
    /** Hướng và độ nhạy. Mặc định -1 (đảo chiều). */
    sensitivity?: number
    className?: string
    style?: CSSProperties
}

export default function Floating({
    children,
    sensitivity = -1,
    className,
    style,
}: FloatingProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [ready, setReady] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    useEffect(() => {
        setReady(true)
    }, [])

    return (
        <Ctx.Provider value={{ mouseX, mouseY, sensitivity }}>
            <div
                ref={ref}
                className={className}
                style={{ position: "relative", ...style }}
                onMouseMove={
                    ready
                        ? (e) => {
                            const rect = ref.current?.getBoundingClientRect()
                            if (!rect) return
                            mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
                            mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
                        }
                        : undefined
                }
                onMouseLeave={
                    ready
                        ? () => {
                            mouseX.set(0)
                            mouseY.set(0)
                        }
                        : undefined
                }
            >
                {children}
            </div>
        </Ctx.Provider>
    )
}

/* ------------------------------------------------------------------ */
/*  FloatingElement – ảnh / element lơ lửng theo depth                  */
/* ------------------------------------------------------------------ */

export interface FloatingElementProps {
    children: ReactNode
    /** Độ sâu – càng lớn càng di chuyển nhiều. Mặc định 1. */
    depth?: number
    className?: string
    style?: CSSProperties
}

export function FloatingElement({
    children,
    depth = 1,
    className,
    style,
}: FloatingElementProps) {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error("<FloatingElement> phải nằm trong <Floating>")

    const { mouseX, mouseY, sensitivity } = ctx

    const rawX = useTransform(mouseX, (v) => v * depth * sensitivity * 60)
    const rawY = useTransform(mouseY, (v) => v * depth * sensitivity * 60)

    const x = useSpring(rawX, { stiffness: 80, damping: 18 })
    const y = useSpring(rawY, { stiffness: 80, damping: 18 })

    return (
        <motion.div
            className={className}
            style={{
                position: "absolute",
                x,
                y,
                ...style,
            }}
        >
            {children}
        </motion.div>
    )
}
