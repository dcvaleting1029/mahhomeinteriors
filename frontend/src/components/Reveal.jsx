import React, { useEffect, useRef, useState } from "react";

/**
 * Reveal — wraps children, fades + slides them up when scrolled into view.
 * Props:
 *   - delay (ms): stagger
 *   - as: element tag (default 'div')
 *   - once (bool, default true): reveal only the first time
 *   - distance (px): translateY distance (default 22)
 *   - duration (ms): default 800
 */
export default function Reveal({
    children,
    delay = 0,
    as: Tag = "div",
    once = true,
    distance = 22,
    duration = 800,
    className = "",
    style = {},
    ...rest
}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // Respect reduced motion
        if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setVisible(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    if (once) io.unobserve(entry.target);
                } else if (!once) {
                    setVisible(false);
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [once]);

    const merged = {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transition: `opacity ${duration}ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
    };

    return (
        <Tag ref={ref} className={className} style={merged} {...rest}>
            {children}
        </Tag>
    );
}
