import ProgressBar from "./ProgressBar"

export default function OrderColumn({ title, orders }) {
    return (
        <div className="bg-slate-50 p-4 w-100 rounded-md">
            <h3 className="mb-4 font-bold text-zinc-700">{title}</h3>

            {orders.map((o) => (
                <div
                    key={o.id}
                    className="p-3 mb-2 rounded-md border-[0.5px] border-[#e0e0e0]"
                    style={{
                        background: o.type === "VIP" ? "#ffe0e0" : "#e0f0ff",
                    }}
                >
                    #{o.id} ({o.type})
                    {o.assignedBotId && <div>Bot {o.assignedBotId}</div>}

                    {o.status === "PROCESSING" && (
                        <ProgressBar
                            startedAt={o.startedAt}
                            duration={o.duration}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
