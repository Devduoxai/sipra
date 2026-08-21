"use client";

import { useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/types";

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

type Preferences = {
  email: string;
  name: string | null;
  topics: string[];
  deliveryTime: string;
};

export default function PreferencesPage() {
  const [email, setEmail] = useState("");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "found" | "not-found">("idle");
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupStatus("loading");

    try {
      const res = await fetch(`/api/preferences?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        setLookupStatus("not-found");
        return;
      }
      const data = await res.json();
      setPrefs(data);
      setSelectedTopics(data.topics);
      const storedUtc = parseInt(data.deliveryTime.split(":")[0], 10);
      const now = new Date();
      const utcOffset = -now.getTimezoneOffset() / 60;
      const localHour = ((storedUtc + utcOffset) % 24 + 24) % 24;
      setDeliveryTime(`${String(localHour).padStart(2, "0")}:00`);
      setLookupStatus("found");
    } catch {
      setLookupStatus("not-found");
    }
  }

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveStatus("loading");
    setErrorMessage("");

    try {
      const localHour = parseInt(deliveryTime.split(":")[0], 10);
      const now = new Date();
      const utcOffset = -now.getTimezoneOffset() / 60;
      const utcHour = ((localHour - utcOffset) % 24 + 24) % 24;
      const utcDeliveryTime = `${String(utcHour).padStart(2, "0")}:00`;

      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, topics: selectedTopics, deliveryTime: utcDeliveryTime }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong");
        setSaveStatus("error");
        return;
      }

      setPrefs((prev) => (prev ? { ...prev, topics: selectedTopics, deliveryTime: utcDeliveryTime } : prev));
      setSaveStatus("success");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setSaveStatus("error");
    }
  }

  if (lookupStatus === "found" && prefs) {
    return (
      <div className="flex flex-1 flex-col items-center bg-gradient-to-b from-blue-50 via-blue-50 to-blue-50 px-6 py-16 dark:from-blue-950 dark:via-blue-950 dark:to-blue-950">
        <main className="flex w-full max-w-md flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              Your Preferences
            </h1>
            <p className="mt-2 text-blue-700/70 dark:text-blue-300/70">
              {prefs.name ? `Hi, ${prefs.name}` : prefs.email}
            </p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Topics <span className="text-red-500">*</span>
              </span>
              <p className="text-xs text-blue-600/60 dark:text-blue-400/60">
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
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-blue-200 bg-white text-blue-700 hover:border-blue-400 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="time" className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Delivery time <span className="text-red-500">*</span>
              </label>
              <select
                id="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="rounded-lg border border-blue-200 bg-white px-4 py-3 text-blue-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {saveStatus === "success" && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
                Preferences saved!
              </div>
            )}

            {saveStatus === "error" && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={saveStatus === "loading" || selectedTopics.length === 0}
              className="rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveStatus === "loading" ? "Saving..." : "Save changes"}
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

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-blue-50 to-blue-50 px-6 py-16 dark:from-blue-950 dark:via-blue-950 dark:to-blue-950">
      <main className="flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            Manage Preferences
          </h1>
          <p className="mt-2 text-blue-700/70 dark:text-blue-300/70">
            Enter your email to view and update your settings.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border border-blue-200 bg-white px-4 py-3 text-blue-900 placeholder:text-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100"
            />
          </div>

          {lookupStatus === "not-found" && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              No account found with this email.
            </div>
          )}

          <button
            type="submit"
            disabled={lookupStatus === "loading"}
            className="rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {lookupStatus === "loading" ? "Looking up..." : "Find my preferences"}
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
