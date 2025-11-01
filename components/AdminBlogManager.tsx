"use client";

import React, { useState, useEffect } from "react";
import { useBlog, BlogPost } from "@/hooks/useBlog";
import { useToast } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import Pagination from "@/components/Pagination";

// Modal Component
function BlogModal({
  isOpen,
  onClose,
  onSubmit,
  editingPost,
  formData,
  setFormData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingPost: BlogPost | null;
  formData: any;
  setFormData: (data: any) => void;
}) {
  if (!isOpen) return null;

  const categories = [
    "Anti-wrinkle",
    "Fillers",
    "Skincare",
    "Face Treatments",
    "Body Treatments",
    "General",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingPost ? "Edit Blog Post" : "Add New Blog Post"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="Enter blog post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="url-friendly-slug"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-none"
              placeholder="Brief description of the blog post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content * (Markdown supported)
            </label>
            <MarkdownEditor
              value={formData.content || ''}
              onChange={(value) => setFormData((prev: any) => ({ ...prev, content: value }))}
              placeholder="Write your blog post content here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.featured_image_url || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, featured_image_url: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Author Name
              </label>
              <input
                type="text"
                value={formData.author_name || 'EGP Aesthetics Team'}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, author_name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="EGP Aesthetics Team"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Read Time (minutes)
              </label>
              <input
                type="number"
                value={formData.read_time_minutes || 5}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, read_time_minutes: parseInt(e.target.value) || 5 }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.is_published ? "published" : "draft"}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, is_published: e.target.value === "published", published_at: e.target.value === "published" && !prev.published_at ? new Date().toISOString() : prev.published_at }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              >
                <option value="draft">Draft (Not visible)</option>
                <option value="published">Published (Visible to public)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, featured: e.target.checked }))}
                className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Post</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SEO Title
            </label>
            <input
              type="text"
              value={formData.seo_title || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, seo_title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              placeholder="SEO optimized title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SEO Description
            </label>
            <textarea
              value={formData.seo_description || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, seo_description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-none"
              placeholder="SEO meta description"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-colors font-medium"
          >
            {editingPost ? "Update Post" : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminBlogManager({ triggerModal }: { triggerModal?: boolean }) {
  const { posts, isLoading, error, addPost, updatePost, deletePost } = useBlog(true);
  const { showSuccess, showError } = useToast();
  const { confirm, modalProps } = useConfirmation();

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const defaultPost = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "General",
    featured_image_url: "",
    featured: false,
    is_published: false,
    published_at: null,
    read_time_minutes: 5,
    seo_title: "",
    seo_description: "",
    author_name: "EGP Aesthetics Team",
    display_order: 0,
  };

  const [formData, setFormData] = useState(defaultPost);

  useEffect(() => {
    if (triggerModal) {
      handleAddNew();
    }
  }, [triggerModal]);

  const handleAddNew = () => {
    setEditingPost(null);
    setFormData(defaultPost);
    setShowModal(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      category: post.category,
      featured_image_url: post.featured_image_url || "",
      featured: post.featured,
      is_published: post.is_published,
      published_at: post.published_at,
      read_time_minutes: post.read_time_minutes,
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
      author_name: post.author_name,
      display_order: post.display_order,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      showError("Please fill in all required fields (Title, Slug, Content)");
      return;
    }

    try {
      if (editingPost) {
        await updatePost(editingPost.id, formData);
        showSuccess("Blog post updated successfully!");
      } else {
        await addPost(formData);
        showSuccess("Blog post created successfully!");
      }
      setShowModal(false);
      setEditingPost(null);
      setFormData(defaultPost);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save blog post");
    }
  };

  const handleDelete = async (post: BlogPost) => {
    const confirmed = await confirm({
      title: "Delete Blog Post",
      message: `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
    });

    if (confirmed) {
      try {
        await deletePost(post.id);
        showSuccess("Blog post deleted successfully!");
      } catch (err) {
        showError(err instanceof Error ? err.message : "Failed to delete blog post");
      }
    }
  };

  const paginatedPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const totalPages = Math.ceil(posts.length / postsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your blog posts ({posts.length} total)
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No blog posts yet.</p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-colors font-medium"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">{post.excerpt}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 rounded-full">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.is_published
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400"
                      }`}>
                        {post.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.featured && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      <BlogModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPost(null);
          setFormData(defaultPost);
        }}
        onSubmit={handleSubmit}
        editingPost={editingPost}
        formData={formData}
        setFormData={setFormData}
      />

      <ConfirmationModal {...modalProps} />
    </div>
  );
}

