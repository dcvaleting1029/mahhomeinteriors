import React from "react";

export default function MaLogo({ size = 44, withText = false, className = "" }) {
    return (
        <a href="/" data-testid="ma-logo" className={`flex items-center gap-3 ${className}`} aria-label="MA Home Interiors">
            <span
                className="flex items-center justify-center rounded-full"
                style={{
                    width: size,
                    height: size,
                    background: "linear-gradient(135deg, #D9A94B 0%, #C9983F 50%, #A87E2C 100%)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18), 0 2px 8px rgba(168,126,44,0.18)",
                }}
            >
                <span
                    className="ma-logo-mono text-white"
                    style={{ fontSize: size * 0.5, letterSpacing: "-0.02em", lineHeight: 1 }}
                >
                    MA
                </span>
            </span>
            {withText && (
                <span className="hidden md:flex flex-col leading-tight">
                    <span className="font-serif text-[15px] tracking-wide text-ma-text">MA</span>
                    <span className="ma-eyebrow" style={{ fontSize: 9 }}>Home Interiors</span>
                </span>
            )}
        </a>
    );
}
