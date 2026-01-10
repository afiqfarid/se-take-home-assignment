import { useEffect, useRef, useState } from "react";
import OrderColumn from "./components/OrderColumn";

let orderId = 1;
let botId = 1;
const PROCESS_TIME = 10000;

export default function App() {
    const [orders, setOrders] = useState([]);
    const [bots, setBots] = useState([]);
    const timers = useRef({});

    /* ---------------- ORDERS ---------------- */

    const createOrder = (type) => {
        setOrders((prev) => [
            ...prev,
            { id: orderId++, type, status: "PENDING" },
        ]);
    };

    /* ---------------- BOTS ---------------- */

    const addBot = () => {
        setBots((prev) => [...prev, { id: botId++, busy: false }]);
    };

    const removeBot = () => {
        setBots((prev) => {
            if (prev.length === 0) return prev;
            const removed = prev[prev.length - 1];

            // Return order to pending if bot was working
            if (removed.currentOrderId) {
                clearTimeout(timers.current[removed.id]);
                setOrders((orders) =>
                    orders.map((o) =>
                        o.id === removed.currentOrderId
                            ? { ...o, status: "PENDING", assignedBotId: undefined }
                            : o
                    )
                );
            }
            return prev.slice(0, -1);
        });
    };

    /* ---------------- PROCESSING ---------------- */

    useEffect(() => {
        const freeBots = bots.filter(b => !b.busy && !b.currentOrderId);
        if (freeBots.length === 0) return;

        const pendingOrders = orders
            .filter(o => o.status === "PENDING")
            .sort((a, b) => {
                if (a.type !== b.type) return a.type === "VIP" ? -1 : 1;
                return a.id - b.id;
            });

        freeBots.forEach((bot, index) => {
            const order = pendingOrders[index];
            if (!order) return;

            const startTime = Date.now();

            // assign bot
            setBots(bots =>
                bots.map(b =>
                    b.id === bot.id
                        ? { ...b, busy: true, currentOrderId: order.id }
                        : b
                )
            );

            // assign order
            setOrders(orders =>
                orders.map(o =>
                    o.id === order.id
                        ? {
                            ...o,
                            status: "PROCESSING",
                            assignedBotId: bot.id,
                            startedAt: startTime,
                            duration: PROCESS_TIME,
                        }
                        : o
                )
            );

            timers.current[bot.id] = setTimeout(() => {
                const completedAt = Date.now();

                setOrders(orders =>
                    orders.map(o =>
                        o.id === order.id
                            ? { ...o, status: "COMPLETE", completedAt }
                            : o
                    )
                );

                setBots(bots =>
                    bots.map(b =>
                        b.id === bot.id
                            ? { ...b, busy: false, currentOrderId: undefined }
                            : b
                    )
                );
            }, PROCESS_TIME);
        });
    }, [orders, bots]);


    /* ---------------- UI ---------------- */

    return (
        <div className="container mx-auto p-4 min-h-[100vh]">

            <div className="flex justify-center items-center mb-3">
                <img src="https://www.mcdonalds.com/content/dam/sites/usa/nfl/icons/arches-logo_108x108.jpg" alt="" width={80} />
                <h1 className="text-2xl font-bold">McDonald's Bot Order Processing</h1>
            </div>

            <section className="flex justify-center flex-wrap items-center gap-3 mb-3">
                <button 
                    onClick={() => createOrder("NORMAL")}
                    className="bg-slate-100 p-5 w-[175px] rounded-md cursor-pointer duration-100 hover:bg-[#e0f0ff]"
                >
                    New Normal Order
                </button>

                <button 
                    onClick={() => createOrder("VIP")}
                    className="bg-slate-100 p-5 w-[175px] rounded-md cursor-pointer duration-100 hover:bg-[#ffe0e0]"
                >
                    New VIP Order
                </button>
            </section>

            <section className="flex justify-center items-center gap-3 mb-3">
                <button
                    onClick={addBot}
                    className="bg-slate-100 rounded-md py-2 px-4 cursor-pointer duration-100 hover:bg-slate-300"
                >
                    + Bot
                </button>
                
                <button
                    onClick={removeBot}
                    className="bg-slate-100 rounded-md py-2 px-4 cursor-pointer duration-100 hover:bg-slate-300"
                >
                    - Bot
                </button>
            </section>

            <section className="flex justify-center items-center gap-4 mb-3">
                <p>Available Bots: {bots.length}</p>
            </section>

            <section className="flex justify-center max-md:flex-wrap gap-4">
                <OrderColumn
                    title="PENDING"
                    orders={orders.filter(o => o.status === "PENDING")}
                />
                <OrderColumn
                    title="PROCESSING"
                    orders={orders
                        .filter(o => o.status === "PROCESSING")
                        .sort((a, b) => a.startedAt - b.startedAt)}
                />

                <OrderColumn
                    title="COMPLETE"
                    orders={orders
                        .filter(o => o.status === "COMPLETE")
                        .sort((a, b) => a.completedAt - b.completedAt)}
                />

            </section>
        </div>
    );
}