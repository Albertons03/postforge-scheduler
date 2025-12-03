import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // If user is already signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-24">
      <div className="z-10 max-w-4xl w-full items-center justify-center text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Welcome to PostForge
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          AI-powered social media content generation and scheduling
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition shadow-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
