"use client";

import { useEffect, useState, useRef } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { useSocketEvent } from "@/hooks/useSocket";
import type { ParsedRequest } from "@/lib/api/types";

const BUCKET_SECONDS = 5;
const NUM_BUCKETS = 12; // 1 minute window

interface Bucket {
	t: number; // bucket key (epoch / BUCKET_SECONDS)
	count: number;
}

function bucketKeyFor(timestampMs: number): number {
	return Math.floor(timestampMs / 1000 / BUCKET_SECONDS);
}

/**
 * Tiny inline RPS sparkline backed by the live telemetry socket. Updates
 * the chart every BUCKET_SECONDS once the first log for `service` is seen.
 */
export function RpsSparkline({ service }: { service: string }) {
	const bucketsRef = useRef<Map<number, number>>(new Map());
	const [, forceUpdate] = useState(0);

	useSocketEvent("telemetry.log", (log: ParsedRequest) => {
		if (log.service !== service) return;
		const key = bucketKeyFor(new Date(log.timestamp).getTime());
		const map = bucketsRef.current;
		map.set(key, (map.get(key) ?? 0) + 1);
		// Trim to last NUM_BUCKETS keys
		if (map.size > NUM_BUCKETS * 2) {
			const sorted = [...map.keys()].sort((a, b) => a - b);
			for (let i = 0; i < sorted.length - NUM_BUCKETS; i++) {
				map.delete(sorted[i]);
			}
		}
		forceUpdate((n) => n + 1);
	});

	// Tick every BUCKET_SECONDS to slide the window even when no events arrive.
	useEffect(() => {
		const id = window.setInterval(() => forceUpdate((n) => n + 1), BUCKET_SECONDS * 1000);
		return () => window.clearInterval(id);
	}, []);

	// Build a continuous window of the last NUM_BUCKETS so the line is gapless.
	const nowBucket = bucketKeyFor(Date.now());
	const data: Bucket[] = [];
	for (let i = NUM_BUCKETS - 1; i >= 0; i--) {
		const key = nowBucket - i;
		data.push({ t: key, count: bucketsRef.current.get(key) ?? 0 });
	}
	const max = Math.max(1, ...data.map((d) => d.count));

	return (
		<div className="h-7 w-24" aria-label="RPS over last minute">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
					<YAxis hide domain={[0, max]} />
					<Line
						type="monotone"
						dataKey="count"
						stroke="var(--chart-1)"
						strokeWidth={1.5}
						dot={false}
						isAnimationActive={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
