'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Save,
  Trash2,
  RotateCcw,
  Zap,
  Loader,
} from 'lucide-react';
import { generatePostAction } from '@/app/actions/generatePost';
import Toast from './Toast';

interface GeneratedPost {
  id: string;
  content: string;
  platform: string;
  status: string;
  remainingCredits: number;
  generatedAt: string;
}

export default function PostGenerator() {
  const [formData, setFormData] = useState({
    topic: '',
    tone: 'Professional' as 'Professional' | 'Casual' | 'Inspirational',
    length: 'Medium' as 'Short' | 'Medium' | 'Long',
    platform: 'linkedin',
  });

  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Show toast notification
  const showToast = (
    type: 'success' | 'error' | 'info',
    message: string
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generate post
  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      showToast('error', 'Please enter a topic');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generatePostAction({
        topic: formData.topic,
        tone: formData.tone,
        length: formData.length,
        platform: formData.platform,
      });

      if (result.success && result.post) {
        setGeneratedPost(result.post);
        setEditContent(result.post.content);
        if (result.remainingCredits !== undefined) {
          setRemainingCredits(result.remainingCredits);
        }
        showToast('success', 'Post generated successfully!');
      } else {
        showToast('error', result.error || 'Failed to generate post');
      }
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const textToCopy = editContent || generatedPost?.content;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('success', 'Copied to clipboard!');
    } catch (error) {
      showToast('error', 'Failed to copy');
    }
  };

  // Save post
  const handleSave = async () => {
    if (!editContent && !generatedPost?.content) return;

    try {
      // Post is already saved via generatePostAction
      // This is just a confirmation message
      showToast('success', 'Post saved! You can view it in History.');
      // Optional: Clear the form after saving
      // handleClear();
    } catch (error) {
      showToast('error', 'Failed to save post');
    }
  };

  // Clear everything
  const handleClear = () => {
    setGeneratedPost(null);
    setEditContent('');
    setFormData({
      topic: '',
      tone: 'Professional',
      length: 'Medium',
      platform: 'linkedin',
    });
  };

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.max(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [editContent]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast type={toast.type} message={toast.message} />
      )}

      {/* Form Section */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border-2 border-slate-700/50 p-8 shadow-xl">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-8">
          Generate Post
        </h2>

        <div className="space-y-5">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Topic / Idea
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="E.g., AI in healthcare, Remote work tips..."
              className="w-full px-5 py-3.5 bg-slate-900/60 border-2 border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 hover:border-slate-500"
              disabled={isLoading}
            />
          </div>

          {/* Platform Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Platform
            </label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              className="w-full px-5 py-3.5 bg-slate-900/60 border-2 border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 hover:border-slate-500 cursor-pointer"
              disabled={isLoading}
            >
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter/X</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          {/* Tone Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Tone
            </label>
            <select
              name="tone"
              value={formData.tone}
              onChange={handleInputChange}
              className="w-full px-5 py-3.5 bg-slate-900/60 border-2 border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 hover:border-slate-500 cursor-pointer"
              disabled={isLoading}
            >
              <option value="Professional">Professional</option>
              <option value="Casual">Casual</option>
              <option value="Inspirational">Inspirational</option>
            </select>
          </div>

          {/* Length Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Length
            </label>
            <select
              name="length"
              value={formData.length}
              onChange={handleInputChange}
              className="w-full px-5 py-3.5 bg-slate-900/60 border-2 border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 hover:border-slate-500 cursor-pointer"
              disabled={isLoading}
            >
              <option value="Short">Short (&lt; 140 chars)</option>
              <option value="Medium">Medium (140-280 chars)</option>
              <option value="Long">Long (&gt; 280 chars)</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !formData.topic.trim()}
            className="w-full mt-2 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:via-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 group shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <span>Generating Magic...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Generate Post</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Post Section */}
      {(generatedPost || editContent) && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border-2 border-slate-700/50 p-8 shadow-xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-6">
            Generated Post
          </h2>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-4 mb-4">
              <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse"></div>
              <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse"></div>
              <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse w-2/3"></div>
            </div>
          )}

          {/* Textarea */}
          {!isLoading && (
            <>
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-5 py-4 bg-slate-900/60 border-2 border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200 resize-none font-mono text-sm leading-relaxed hover:border-slate-500"
                placeholder="Your generated post..."
                rows={5}
              />

              {/* Post Info */}
              {generatedPost && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-semibold shadow-md">
                    {generatedPost.platform}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-semibold shadow-md">
                    {generatedPost.status}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 bg-slate-700/80 text-gray-200 rounded-xl text-xs font-semibold">
                    {editContent.length} characters
                  </span>
                  {remainingCredits !== null && (
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold shadow-md ml-auto">
                      Credits: {remainingCredits}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border-2 border-slate-600/50 hover:border-slate-500"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copy</span>
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
                >
                  <Save className="w-5 h-5" />
                  <span>Save</span>
                </button>

                <button
                  onClick={handleClear}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 active:scale-95 ml-auto"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Clear</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
