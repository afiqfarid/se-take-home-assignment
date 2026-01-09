import { useEffect, useRef, useState } from "react";

let orderId = 1;
let botId = 1;
const PROCESS_TIME = 5000; // 3 seconds

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
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>FeedMe Order Processing</h1>

      <section>
        <button onClick={() => createOrder("NORMAL")}>New Normal Order</button>
        <button onClick={() => createOrder("VIP")} style={{ marginLeft: 8 }}>
          New VIP Order
        </button>
      </section>

      <section style={{ marginTop: 16 }}>
        <button onClick={addBot}>+ Bot</button>
        <button onClick={removeBot} style={{ marginLeft: 8 }}>
          - Bot
        </button>
        <p>Bots: {bots.length}</p>
      </section>

      <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
        <OrderColumn title="PENDING" orders={orders.filter(o => o.status === "PENDING")} />
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

      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function OrderColumn({ title, orders }) {
  return (
    <div style={{ width: 220 }}>
      <h3>{title}</h3>
      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            padding: 8,
            marginBottom: 6,
            border: "1px solid #ccc",
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
  );
}

function ProgressBar({ startedAt, duration }) {
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
  );
}
