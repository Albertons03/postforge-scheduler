'use client';

import PostGenerator from '@/components/PostGenerator';

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Generate Content
          </h1>
          <p className="text-gray-400">
            Create AI-powered social media posts tailored to your audience and platform
          </p>
        </div>

        {/* Main Content */}
        <PostGenerator />

        {/* Helpful Tips */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-indigo-400 text-2xl mb-3">💡</div>
            <h3 className="font-semibold text-white mb-2">Be Specific</h3>
            <p className="text-gray-400 text-sm">
              The more specific your topic, the better the generated content will be. Include context, keywords, or your unique angle.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-indigo-400 text-2xl mb-3">🎯</div>
            <h3 className="font-semibold text-white mb-2">Choose Your Tone</h3>
            <p className="text-gray-400 text-sm">
              Select a tone that matches your brand voice. From professional to humorous, we'll adapt the content accordingly.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-indigo-400 text-2xl mb-3">✨</div>
            <h3 className="font-semibold text-white mb-2">Edit & Customize</h3>
            <p className="text-gray-400 text-sm">
              AI is your starting point. Edit the generated content to add personal touches or make it more authentic to your voice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
