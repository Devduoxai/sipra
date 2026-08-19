"use client";

import { useState } from "react";
import Link from "next/link";

type Message = {
  id: string;
  content: string;
  topic: string;
  deliveryStatus: string;
  generatedAt: string;
  sentAt: string | null;
};

export default function HistoryPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "not-found">("idle");
  const [messages, setMessages] = useState<Message[]>([]);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(`/api/messages?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        setStatus("not-found");
        return;
      }
      const data = await res.json();
      setMessages(data.messages);
      setStatus("found");
    } catch {
      setStatus("not-found");
    }
  }

  if (status === "found") {
    return (
      <div className="flex flex-1 flex-col items-center bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-6 py-16 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
        <main className="flex w-full max-w-lg flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              Your Messages
            </h1>
            <p className="mt-2 text-amber-700/70 dark:text-amber-300/70">
              {messages.length} message{messages.length !== 1 ? "s" : ""} received
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-white p-8 text-center dark:border-amber-700 dark:bg-amber-900">
              <p className="text-amber-700/70 dark:text-amber-300/70">
                No messages yet. Your first one will arrive at your chosen delivery time.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-xl border border-amber-200 bg-white p-5 dark:border-amber-700 dark:bg-amber-900"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                      {msg.topic}
                    </span>
                    <span className="text-xs text-amber-500/60">
                      {new Date(msg.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-amber-900 leading-relaxed dark:text-amber-100">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          )}

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
            Message History
          </h1>
          <p className="mt-2 text-amber-700/70 dark:text-amber-300/70">
            Enter your email to view your past messages.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border border-amber-200 bg-white px-4 py-3 text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100"
            />
          </div>

          {status === "not-found" && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              No account found with this email.
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-amber-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Looking up..." : "View my messages"}
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
