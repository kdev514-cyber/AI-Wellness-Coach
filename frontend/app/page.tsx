"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then((response) => response.json())
      .then((data) => {
        setStatus(data.status);
      })
      .catch(() => {
        setStatus("Backend unavailable");
      });
  }, []);

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

          <p className="mt-2 text-xl font-semibold text-green-600">
            {status}
          </p>
        </div>
      </div>
    </main>
  );
}