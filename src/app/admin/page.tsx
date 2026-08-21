"use client";

import { useState } from "react";
import Link from "next/link";

type Stats = {
  users: { total: number; active: number };
  messages: { total: number; sent: number; failed: number };
  recentUsers: { id: string; email: string; name: string | null; createdAt: string; active: boolean }[];
  messagesByTopic: { topic: string; count: number }[];
};

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "authorized" | "unauthorized">("idle");
  const [stats, setStats] = useState<Stats | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(`/api/admin/stats?key=${encodeURIComponent(key)}`);
      if (!res.ok) {
        setStatus("unauthorized");
        return;
      }
      const data = await res.json();
      setStats(data);
      setStatus("authorized");
    } catch {
      setStatus("unauthorized");
    }
  }

  if (status === "authorized" && stats) {
    return (
      <div className="flex flex-1 flex-col bg-gradient-to-b from-blue-50 via-blue-50 to-blue-50 px-6 py-16 dark:from-blue-950 dark:via-blue-950 dark:to-blue-950">
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              Admin Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-blue-200 bg-white p-5 dark:border-blue-700 dark:bg-blue-900">
              <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Total Users</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.users.total}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-white p-5 dark:border-blue-700 dark:bg-blue-900">
              <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Active Users</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.users.active}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-white p-5 dark:border-blue-700 dark:bg-blue-900">
              <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Messages Sent</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.messages.sent}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-white p-5 dark:border-blue-700 dark:bg-blue-900">
              <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Messages Failed</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.messages.failed}</p>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-5 dark:border-blue-700 dark:bg-blue-900">
            <h2 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
              Messages by Topic
            </h2>
            {stats.messagesByTopic.length === 0 ? (
              <p className="text-blue-600/60 dark:text-blue-400/60">No messages yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.messagesByTopic.map((item) => (
                  <div key={item.topic} className="flex justify-between text-sm">
                    <span className="text-blue-800 dark:text-blue-200">{item.topic}</span>
                    <span className="font-mono text-blue-600/70 dark:text-blue-400/70">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-5 dark:border-blue-700 dark:bg-blue-900">
            <h2 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
              Recent Signups
            </h2>
            {stats.recentUsers.length === 0 ? (
              <p className="text-blue-600/60 dark:text-blue-400/60">No users yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {user.name || user.email}
                      </span>
                      {user.name && (
                        <span className="ml-2 text-blue-600/60 dark:text-blue-400/60">
                          {user.email}
                        </span>
                      )}
                    </div>
                    <span className={user.active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/"
            className="text-center text-sm text-blue-600/60 hover:text-blue-700 dark:text-blue-400/60"
          >
            ← Back to home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-blue-50 to-blue-50 px-6 py-16 dark:from-blue-950 dark:via-blue-950 dark:to-blue-950">
      <main className="flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            Admin Access
          </h1>
          <p className="mt-2 text-blue-700/70 dark:text-blue-300/70">
            Enter your admin key to view dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="key" className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Admin Key
            </label>
            <input
              id="key"
              type="password"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter admin key"
              className="rounded-lg border border-blue-200 bg-white px-4 py-3 text-blue-900 placeholder:text-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100"
            />
          </div>

          {status === "unauthorized" && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              Invalid admin key.
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>

        <Link
          href="/"
          className="text-center text-sm text-blue-600/60 hover:text-blue-700 dark:text-blue-400/60"
        >
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
