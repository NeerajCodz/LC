import Link from "next/link";
export default function NotFound() {
  return (
    <main className="loading-screen">
      <strong>A path less travelled.</strong>
      <p>This page is not in the collection.</p>
      <Link href="/" className="text-button" style={{ margin: "0 auto" }}>
        Return to the flowers
      </Link>
    </main>
  );
}
