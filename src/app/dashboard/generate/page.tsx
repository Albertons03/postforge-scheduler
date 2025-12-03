'use client';

import PostGenerator from '@/components/PostGenerator';

export default function GeneratePage() {
  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Generate Content
          </h1>
          <p className="text-gray-400 text-lg">
            Create AI-powered social media posts tailored to your audience and platform
          </p>
        </div>

        {/* Main Content */}
        <PostGenerator />

        {/* Helpful Tips */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border-2 border-indigo-500/30 p-6 hover:border-indigo-400/50 hover:scale-105 transition-all duration-300 group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💡</div>
            <h3 className="font-bold text-white mb-3 text-lg">Be Specific</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              The more specific your topic, the better the generated content will be. Include context, keywords, or your unique angle.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl border-2 border-purple-500/30 p-6 hover:border-purple-400/50 hover:scale-105 transition-all duration-300 group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
            <h3 className="font-bold text-white mb-3 text-lg">Choose Your Tone</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Select a tone that matches your brand voice. From professional to humorous, we'll adapt the content accordingly.
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-600/20 to-teal-600/20 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 p-6 hover:border-cyan-400/50 hover:scale-105 transition-all duration-300 group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">✨</div>
            <h3 className="font-bold text-white mb-3 text-lg">Edit & Customize</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              AI is your starting point. Edit the generated content to add personal touches or make it more authentic to your voice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
