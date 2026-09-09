"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="loading-screen">
      <strong>A moment to regrow.</strong>
      <p>The collection could not finish loading.</p>
      <button
        className="text-button"
        style={{ margin: "0 auto" }}
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
