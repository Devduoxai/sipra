"use client";

import { useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/types";

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, topics: selectedTopics, deliveryTime }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-6 py-16 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
        <main className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <span className="text-5xl" role="img" aria-label="check">
            ✅
          </span>
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            You&apos;re in!
          </h1>
          <p className="text-lg text-amber-800/80 dark:text-amber-200/80">
            Check your inbox for a welcome message. Your first daily sip arrives tomorrow at{" "}
            {deliveryTime}.
          </p>
          <Link
            href="/"
            className="mt-4 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
          >
            ← Back to home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-6 py-16 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
      <main className="flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            Sign up for Sipra
          </h1>
          <p className="mt-2 text-amber-700/70 dark:text-amber-300/70">
            One short, uplifting message every day.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Email <span className="text-red-500">*</span>
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

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Name <span className="text-amber-500/60">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should we greet you?"
              className="rounded-lg border border-amber-200 bg-white px-4 py-3 text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Topics <span className="text-red-500">*</span>
            </span>
            <p className="text-xs text-amber-600/60 dark:text-amber-400/60">
              Pick at least one
            </p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedTopics.includes(topic)
                      ? "bg-amber-600 text-white shadow-sm"
                      : "border border-amber-200 bg-white text-amber-700 hover:border-amber-400 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="time" className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Delivery time <span className="text-red-500">*</span>
            </label>
            <select
              id="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="rounded-lg border border-amber-200 bg-white px-4 py-3 text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {status === "error" && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading" || selectedTopics.length === 0}
            className="rounded-full bg-amber-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Signing up..." : "Start receiving positivity"}
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
