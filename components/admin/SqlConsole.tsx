"use client";

import { useState } from "react";
import { Play, RotateCcw, List, Database } from "lucide-react";

const SAMPLE_QUERIES: Array<{ label: string; query: string }> = [
  {
    label: "Working hours overview",
    query: "select day_of_week, start_time, end_time, is_working_day, buffer_minutes from working_hours order by day_of_week;",
  },
  {
    label: "Upcoming bookings (next 7 days)",
    query: "select date, time, customer_name, service, status from bookings where date >= current_date and date < current_date + interval '7 days' order by date, time;",
  },
  {
    label: "Service durations",
    query: "select service_name, duration_minutes, buffer_minutes from service_durations order by service_name;",
  },
  {
    label: "Admin settings - business hours",
    query: "select value from admin_settings where key = 'business_hours';",
  },
];

type QueryResult = Array<Record<string, unknown>>;

type ConsoleState = "idle" | "loading" | "error" | "success";

export default function SqlConsole() {
  const [query, setQuery] = useState(SAMPLE_QUERIES[0]?.query ?? "");
  const [result, setResult] = useState<QueryResult>([]);
  const [status, setStatus] = useState<ConsoleState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runQuery = async () => {
    if (!query.trim()) {
      setErrorMessage("Enter a SQL query to run");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to execute query");
      }

      setResult(Array.isArray(data.rows) ? data.rows : []);
      setStatus("success");
    } catch (error) {
      console.error("SQL console error", error);
      setErrorMessage(error instanceof Error ? error.message : "Unexpected error");
      setStatus("error");
      setResult([]);
    }
  };

  const resetConsole = () => {
    setResult([]);
    setErrorMessage(null);
    setStatus("idle");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#e4d9c8] dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e4d9c8] dark:border-gray-700 flex items-center justify-between bg-[#f5f1e9] dark:bg-gray-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#ddd5c3] dark:bg-gray-800">
            <Database className="w-5 h-5 text-[#6b5f4b] dark:text-[#c9c1b0]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SQL Console</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Run read-only queries against scheduling tables</p>
          </div>
        </div>
        <button
          onClick={resetConsole}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#f0ede7] dark:hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
      </div>

      <div className="px-6 py-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sample queries</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SAMPLE_QUERIES.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setQuery(item.query);
                  setStatus("idle");
                  setErrorMessage(null);
                }}
                className="flex items-center gap-2 px-3 py-2 text-left text-xs sm:text-sm rounded-lg border border-[#e4d9c8] dark:border-gray-700 hover:bg-[#f5f1e9] dark:hover:bg-gray-700 transition-colors"
              >
                <List className="w-4 h-4 text-[#9d9585] dark:text-[#c9c1b0]" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="sql-editor" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">SQL query</label>
          <textarea
            id="sql-editor"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full min-h-[140px] rounded-lg border border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 p-3 font-mono focus:ring-2 focus:ring-[#b5ad9d] outline-none"
            placeholder="SELECT * FROM working_hours;"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runQuery}
            disabled={status === "loading"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#9d9585] to-[#c9c1b0] text-[#3f3a31] font-semibold text-sm hover:from-[#8c846f] hover:to-[#b5ad9d] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {status === "loading" ? "Running..." : "Run query"}
          </button>
          {status === "success" && (
            <span className="text-xs font-medium text-[#2f6b3d] bg-[#e7f4eb] px-2.5 py-1 rounded-full">
              {result.length} row{result.length === 1 ? '' : 's'}
            </span>
          )}
          {status === "error" && errorMessage && (
            <span className="text-xs font-medium text-[#7f2b27] bg-[#fce8e8] px-2.5 py-1 rounded-full">
              {errorMessage}
            </span>
          )}
        </div>

        <div className="border border-[#e4d9c8] dark:border-gray-700 rounded-lg bg-[#fdfbf8] dark:bg-gray-900/60 overflow-hidden">
          <div className="px-4 py-2 border-b border-[#e4d9c8] dark:border-gray-700 bg-[#f5f1e9] dark:bg-gray-900/60 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Results
          </div>
          <div className="max-h-72 overflow-auto">
            {status === "loading" && (
              <div className="flex items-center gap-2 px-4 py-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-[#c9c1b0] border-t-transparent rounded-full animate-spin" />
                Running query...
              </div>
            )}
            {status !== "loading" && result.length === 0 && !errorMessage && (
              <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">Run a query to see results here.</div>
            )}
            {status === "error" && errorMessage && (
              <div className="px-4 py-6 text-sm text-[#7f2b27] dark:text-red-200">{errorMessage}</div>
            )}
            {result.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-[#f0ede7] dark:bg-gray-800">
                  <tr>
                    {Object.keys(result[0]).map((key) => (
                      <th
                        key={key}
                        className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-200"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-[#e4d9c8] dark:border-gray-800">
                      {Object.keys(result[0]).map((key) => (
                        <td
                          key={key}
                          className="px-4 py-2 text-gray-700 dark:text-gray-200 align-top"
                        >
                          {String(row[key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
