import { useState, useEffect } from "react";

export default function ProgressBar({ startedAt, duration }) {

    const [progress, setProgress] = useState(0);
    const [remaining, setRemaining] = useState(duration);

    useEffect(() => {
        let raf;

        const tick = () => {
            const elapsed = Date.now() - startedAt;
            const clampedElapsed = Math.min(elapsed, duration);

            setProgress((clampedElapsed / duration) * 100);
            setRemaining(Math.max(duration - clampedElapsed, 0));

            if (clampedElapsed < duration) {
                raf = requestAnimationFrame(tick);
            }
        };

        tick();
        return () => cancelAnimationFrame(raf);
    }, [startedAt, duration]);

    return (
        <div className="mt-2">
            <div className="h-[6px] bg-[#ddd] rounded-sm overflow-hidden">
                <div
                    style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: "#4caf50",
                    }}
                />
            </div>

            <div className="text-xs mt-2">
                {Math.ceil(remaining / 1000)}s remaining
            </div>
        </div>
    )
}
