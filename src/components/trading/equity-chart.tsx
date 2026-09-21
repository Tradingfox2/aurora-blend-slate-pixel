import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { formatUsd } from "@/lib/trading/format";
import type { EquityPoint } from "@/lib/trading/types";

export function EquityChart({ data }: { data: EquityPoint[] }) {
  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c5ccd8" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#c5ccd8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin - 80", "dataMax + 80"]} />
          <Tooltip
            contentStyle={{
              background: "#151922",
              border: "1px solid #232833",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [formatUsd(v), "Equity"]}
            labelFormatter={() => ""}
          />
          <Area type="monotone" dataKey="equity" stroke="#c5ccd8" fill="url(#eq)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
