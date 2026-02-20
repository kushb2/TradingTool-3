import { useEffect, useRef } from "react";
import { createChart, LineSeries } from "lightweight-charts";

export function PriceChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#ffffff" },
        textColor: "#1f1f1f",
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      width: containerRef.current.clientWidth,
      height: 260,
      rightPriceScale: { borderColor: "#d9d9d9" },
      timeScale: { borderColor: "#d9d9d9" },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#1677ff",
      lineWidth: 2,
    });

    lineSeries.setData([
      { time: "2026-02-10", value: 98.2 },
      { time: "2026-02-11", value: 101.6 },
      { time: "2026-02-12", value: 100.1 },
      { time: "2026-02-13", value: 103.4 },
      { time: "2026-02-14", value: 102.2 },
      { time: "2026-02-15", value: 106.1 },
      { time: "2026-02-16", value: 104.8 },
      { time: "2026-02-17", value: 108.3 },
      { time: "2026-02-18", value: 107.2 },
      { time: "2026-02-19", value: 110.6 },
    ]);

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      const target = entries[0];
      if (!target) return;
      chart.applyOptions({ width: Math.floor(target.contentRect.width) });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", minHeight: 260 }} />;
}