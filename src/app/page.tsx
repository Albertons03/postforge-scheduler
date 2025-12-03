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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-8 md:p-24 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="z-10 max-w-5xl w-full items-center justify-center text-center space-y-10">
        {/* Logo/Icon */}
        <div className="text-7xl mb-6 animate-bounce">✨</div>

        {/* Heading */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tight">
          Welcome to PostForge
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          AI-powered social media content generation and scheduling
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <span className="px-4 py-2 bg-indigo-600/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl text-indigo-300 text-sm font-semibold">
            AI-Powered
          </span>
          <span className="px-4 py-2 bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl text-purple-300 text-sm font-semibold">
            Multi-Platform
          </span>
          <span className="px-4 py-2 bg-pink-600/20 backdrop-blur-sm border border-pink-500/30 rounded-xl text-pink-300 text-sm font-semibold">
            Instant Results
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Link
            href="/sign-up"
            className="group px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>Get Started</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </Link>
          <Link
            href="/sign-in"
            className="px-10 py-5 bg-slate-800/50 backdrop-blur-sm text-white border-2 border-slate-600/50 rounded-2xl font-bold text-lg hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            Sign In
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-8 border-t border-slate-700/50">
          <p className="text-gray-500 text-sm mb-4">Trusted by content creators worldwide</p>
          <div className="flex justify-center gap-8 items-center opacity-60">
            <div className="text-2xl">⭐⭐⭐⭐⭐</div>
          </div>
        </div>
      </div>
    </main>
  );
}
