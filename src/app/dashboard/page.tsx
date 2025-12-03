import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // Protect the route - get auth info
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user from Clerk
  const user = await currentUser();

  // Get user data from database
  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user from database:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">PostForge</h1>
              {/* Organization Switcher - for Teams feature */}
              <OrganizationSwitcher
                appearance={{
                  elements: {
                    rootBox: "flex items-center",
                  },
                }}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Credits: </span>
                <span className="text-indigo-600 font-bold">
                  {dbUser?.credits ?? 0}
                </span>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
            </h2>
            <p className="text-gray-600">
              Ready to create amazing social media content with AI?
            </p>
          </div>

          {/* User Info Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-gray-900 font-mono text-sm">{userId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Credits</p>
                <p className="text-gray-900 font-medium">
                  {dbUser?.credits ?? 0} credits
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-900 font-medium">
                  {dbUser?.createdAt
                    ? new Date(dbUser.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Posts Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Posts
            </h3>
            {dbUser?.posts && dbUser.posts.length > 0 ? (
              <div className="space-y-3">
                {dbUser.posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-900 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {post.platform}
                          </span>
                          <span className="text-xs text-gray-500">
                            {post.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No posts yet. Start creating content!
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition text-left">
                <div className="text-sm font-semibold mb-1">
                  Generate Post
                </div>
                <div className="text-xs opacity-90">
                  Create AI-powered content
                </div>
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition text-left">
                <div className="text-sm font-semibold mb-1">
                  Schedule Post
                </div>
                <div className="text-xs opacity-90">
                  Plan your content calendar
                </div>
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition text-left">
                <div className="text-sm font-semibold mb-1">Buy Credits</div>
                <div className="text-xs opacity-90">
                  Get more AI generations
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
