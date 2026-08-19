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
      <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-6 py-16 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              Admin Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-amber-200 bg-white p-5 dark:border-amber-700 dark:bg-amber-900">
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Total Users</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.users.total}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-white p-5 dark:border-amber-700 dark:bg-amber-900">
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Active Users</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.users.active}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-white p-5 dark:border-amber-700 dark:bg-amber-900">
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Messages Sent</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.messages.sent}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-white p-5 dark:border-amber-700 dark:bg-amber-900">
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Messages Failed</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.messages.failed}</p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-5 dark:border-amber-700 dark:bg-amber-900">
            <h2 className="mb-3 text-lg font-semibold text-amber-900 dark:text-amber-100">
              Messages by Topic
            </h2>
            {stats.messagesByTopic.length === 0 ? (
              <p className="text-amber-600/60 dark:text-amber-400/60">No messages yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.messagesByTopic.map((item) => (
                  <div key={item.topic} className="flex justify-between text-sm">
                    <span className="text-amber-800 dark:text-amber-200">{item.topic}</span>
                    <span className="font-mono text-amber-600/70 dark:text-amber-400/70">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-5 dark:border-amber-700 dark:bg-amber-900">
            <h2 className="mb-3 text-lg font-semibold text-amber-900 dark:text-amber-100">
              Recent Signups
            </h2>
            {stats.recentUsers.length === 0 ? (
              <p className="text-amber-600/60 dark:text-amber-400/60">No users yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-amber-900 dark:text-amber-100">
                        {user.name || user.email}
                      </span>
                      {user.name && (
                        <span className="ml-2 text-amber-600/60 dark:text-amber-400/60">
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
            className="text-center text-sm text-amber-600/60 hover:text-amber-700 dark:text-amber-400/60"
          >
            ← Back to home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-6 py-16 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
      <main className="flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            Admin Access
          </h1>
          <p className="mt-2 text-amber-700/70 dark:text-amber-300/70">
            Enter your admin key to view dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="key" className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Admin Key
            </label>
            <input
              id="key"
              type="password"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter admin key"
              className="rounded-lg border border-amber-200 bg-white px-4 py-3 text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100"
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
            className="rounded-full bg-amber-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>

        <Link
          href="/"
          className="text-center text-sm text-amber-600/60 hover:text-amber-700 dark:text-amber-400/60"
        >
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
