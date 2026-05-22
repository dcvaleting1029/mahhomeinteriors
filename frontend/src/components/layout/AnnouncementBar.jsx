import React from "react";
import { Truck, RotateCcw, Star } from "lucide-react";

export default function AnnouncementBar() {
    return (
        <div
            data-testid="announcement-bar"
            className="border-b border-ma-border bg-white"
        >
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 h-9 flex items-center justify-between text-[11px] tracking-widest uppercase text-ma-muted">
                <div className="hidden md:flex items-center gap-2">
                    <Truck size={13} className="text-ma-gold" strokeWidth={1.4} />
                    <span>Free UK delivery on orders over £100</span>
                </div>
                <div className="flex items-center gap-2 mx-auto md:mx-0">
                    <RotateCcw size={13} className="text-ma-gold" strokeWidth={1.4} />
                    <span>Simple &amp; hassle-free returns</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <span>Excellent</span>
                    <span className="flex gap-[1px] star-gold">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <Star key={i} size={11} fill="currentColor" strokeWidth={0} />
                        ))}
                    </span>
                </div>
            </div>
        </div>
    );
}
