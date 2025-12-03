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
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Generate Post</h2>

        <div className="space-y-4">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Topic / Idea
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="E.g., AI in healthcare, Remote work tips..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              disabled={isLoading}
            />
          </div>

          {/* Platform Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platform
            </label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tone
            </label>
            <select
              name="tone"
              value={formData.tone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              disabled={isLoading}
            >
              <option value="Professional">Professional</option>
              <option value="Casual">Casual</option>
              <option value="Inspirational">Inspirational</option>
            </select>
          </div>

          {/* Length Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Length
            </label>
            <select
              name="length"
              value={formData.length}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
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
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center space-x-2 group"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 group-hover:scale-110 transition" />
                <span>Generate Post</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Post Section */}
      {(generatedPost || editContent) && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Generated Post
          </h2>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-3 mb-4">
              <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-700 rounded animate-pulse w-2/3"></div>
            </div>
          )}

          {/* Textarea */}
          {!isLoading && (
            <>
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none font-mono text-sm"
                placeholder="Your generated post..."
                rows={5}
              />

              {/* Post Info */}
              {generatedPost && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-indigo-900 text-indigo-300 rounded-full text-xs font-medium">
                    {generatedPost.platform}
                  </span>
                  <span className="inline-block px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-xs font-medium">
                    {generatedPost.status}
                  </span>
                  <span className="inline-block px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-medium">
                    {editContent.length} characters
                  </span>
                  {remainingCredits !== null && (
                    <span className="inline-block px-3 py-1 bg-green-900 text-green-300 rounded-full text-xs font-medium ml-auto">
                      Credits: {remainingCredits}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>

                <button
                  onClick={handleClear}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
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
