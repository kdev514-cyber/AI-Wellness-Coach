"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Connecting...");
  const [connected, setConnected] = useState(false);

  // =====================================================
  // BACKEND HEALTH CHECK
  // =====================================================

  useEffect(() => {
    async function checkBackend() {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL;

      // Make sure the Vercel environment variable exists
      if (!apiBaseUrl) {
        console.error(
          "NEXT_PUBLIC_API_BASE_URL is missing."
        );

        setStatus("Backend URL not configured");
        setConnected(false);

        return;
      }

      try {
        console.log(
          "Checking backend:",
          `${apiBaseUrl}/health`
        );

        const response = await fetch(
          `${apiBaseUrl}/health`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          "Backend health response:",
          data
        );

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
  }, []);

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
            className={`
              mt-2
              text-xl
              font-semibold

              ${
                connected
                  ? "text-green-600"
                  : status === "Connecting..."
                    ? "text-gray-500"
                    : "text-red-600"
              }
            `}
          >
            {status}
          </p>

        </div>

      </div>

    </main>
  );
}