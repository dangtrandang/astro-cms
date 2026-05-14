"use client"

import { useRef, createContext, useContext, useState, useEffect, useMemo } from "react"
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
    isTouchDevice: boolean
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
    const [isTouchDevice, setIsTouchDevice] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    useEffect(() => {
        setReady(true)

        if (typeof window === "undefined") return

        const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)")

        const updateDeviceMode = () => {
            setIsTouchDevice(mediaQuery.matches)
        }

        const updateScrollOffset = () => {
            if (!mediaQuery.matches) return
            const rect = ref.current?.getBoundingClientRect()
            if (!rect) return

            const viewportHeight = window.innerHeight || 1
            const sectionCenter = rect.top + rect.height / 2
            const viewportCenter = viewportHeight / 2
            const normalized = Math.max(-1, Math.min(1, (sectionCenter - viewportCenter) / viewportHeight))

            mouseX.set(0)
            mouseY.set(normalized * 0.22)
        }

        updateDeviceMode()
        updateScrollOffset()

        mediaQuery.addEventListener?.("change", updateDeviceMode)
        window.addEventListener("resize", updateScrollOffset)
        window.addEventListener("scroll", updateScrollOffset, { passive: true })

        return () => {
            mediaQuery.removeEventListener?.("change", updateDeviceMode)
            window.removeEventListener("resize", updateScrollOffset)
            window.removeEventListener("scroll", updateScrollOffset)
        }
    }, [mouseX, mouseY])

    return (
        <Ctx.Provider value={{ mouseX, mouseY, sensitivity, isTouchDevice }}>
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

    const { mouseX, mouseY, sensitivity, isTouchDevice } = ctx

    const rawX = useTransform(mouseX, (v) => v * depth * sensitivity * 60)
    const rawY = useTransform(mouseY, (v) => v * depth * sensitivity * 60)

    const x = useSpring(rawX, { stiffness: 80, damping: 18 })
    const y = useSpring(rawY, { stiffness: 80, damping: 18 })

    const idleDuration = useMemo(() => 5.2 + depth * 0.9, [depth])
    const idleX = useMemo(() => {
        const drift = Math.max(2, Math.min(8, depth * 2.8))
        return [0, drift, 0, -drift * 0.7, 0]
    }, [depth])
    const idleY = useMemo(() => {
        const drift = Math.max(4, Math.min(10, depth * 3.8))
        return [0, -drift, 0, drift * 0.65, 0]
    }, [depth])

    return (
        <motion.div
            className={className}
            animate={
                isTouchDevice
                    ? {
                        x: idleX,
                        y: idleY,
                    }
                    : undefined
            }
            transition={
                isTouchDevice
                    ? {
                        duration: idleDuration,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }
                    : undefined
            }
            style={{
                position: "absolute",
                x: isTouchDevice ? undefined : x,
                y: isTouchDevice ? undefined : y,
                ...style,
            }}
        >
            <motion.div
                style={{
                    x: isTouchDevice ? x : undefined,
                    y: isTouchDevice ? y : undefined,
                }}
            >
                {children}
            </motion.div>
        </motion.div>
    )
}
