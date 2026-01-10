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
        <div style={{ marginTop: 6 }}>
            <div
                style={{
                    height: 6,
                    background: "#ddd",
                    borderRadius: 4,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: "#4caf50",
                    }}
                />
            </div>

            <div style={{ fontSize: 12, marginTop: 4 }}>
                {Math.ceil(remaining / 1000)}s remaining
            </div>
        </div>
    )
}
