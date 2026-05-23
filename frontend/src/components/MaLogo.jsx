import React from "react";
import { Link } from "react-router-dom";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_elegant-home-store-1/artifacts/kpawvvfw_JA%20%2840%20x%2040%20px%29%20%2810%29.png";

export default function MaLogo({ size = 44, withText = false, className = "" }) {
    return (
        <Link to="/" data-testid="ma-logo" className={`flex items-center gap-3 ${className}`} aria-label="MA Home Interiors">
            <span
                className="block rounded-full overflow-hidden"
                style={{
                    width: size,
                    height: size,
                    boxShadow: "0 2px 10px rgba(168,126,44,0.18)",
                }}
            >
                <img
                    src={LOGO_URL}
                    alt="MA Home Interiors"
                    width={size}
                    height={size}
                    className="block w-full h-full object-cover"
                    draggable={false}
                />
            </span>
            {withText && (
                <span className="hidden md:flex flex-col leading-tight">
                    <span className="font-serif text-[15px] tracking-wide text-ma-text">MA</span>
                    <span className="ma-eyebrow" style={{ fontSize: 9 }}>Home Interiors</span>
                </span>
            )}
        </Link>
    );
}
