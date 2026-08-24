"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Connecting...");
  const [connected, setConnected] = useState(false);

  // =====================================================
  // RAILWAY BACKEND URL
  // =====================================================

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000";

  // =====================================================
  // CHECK BACKEND
  // =====================================================

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/health`
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        const data = await response.json();

        if (data.status === "healthy") {
          setStatus("Backend connected");
          setConnected(true);
        } else {
          setStatus("Backend unavailable");
          setConnected(false);
        }
      } catch (error) {
        console.error(
          "Backend health check failed:",
          error
        );

        setStatus("Backend unavailable");
        setConnected(false);
      }
    }

    checkBackend();
  }, [API_BASE_URL]);

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">

      <div className="text-center">

        <h1 className="text-5xl font-bold text-black">
          AI Wellness Coach
        </h1>

        <p className="mt-4 text-gray-600">
          Your personalized wellness companion
        </p>

        <div className="mt-8">

          <p className="text-sm text-gray-500">
            Backend status
          </p>

          <p
            className={`mt-2 text-xl font-semibold ${
              connected
                ? "text-green-600"
                : status === "Connecting..."
                  ? "text-gray-500"
                  : "text-red-600"
            }`}
          >
            {status}
          </p>

        </div>

      </div>

    </main>
  );
}