"use client";

import React, { useState, useEffect } from "react";
import { useBlog, BlogPost } from "@/hooks/useBlog";
import { useToast } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import Pagination from "@/components/Pagination";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem, Checkbox, Card, CardBody, Spinner } from "@heroui/react";
import { X } from "lucide-react";

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
  const categories = [
    "Anti-wrinkle",
    "Fillers",
    "Skincare",
    "Face Treatments",
    "Body Treatments",
    "General",
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">
            {editingPost ? "Edit Blog Post" : "Add New Blog Post"}
              </h2>
              <p className="text-sm text-default-500 font-normal">
                {editingPost ? "Update your blog post details" : "Create a new blog post for your website"}
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <Input
                  label="Title"
                  placeholder="Enter blog post title"
                value={formData.title}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                  isRequired
                  size="lg"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Slug"
                    placeholder="url-friendly-slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                    isRequired
                    description="URL-friendly version of the title"
              />

                  <Select
                    label="Category"
                    selectedKeys={[formData.category]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData((prev: any) => ({ ...prev, category: selected || "General" }));
                    }}
                    isRequired
              >
                {categories.map((cat) => (
                      <SelectItem key={cat}>{cat}</SelectItem>
                ))}
                  </Select>
          </div>

                <Textarea
                  label="Excerpt"
                  placeholder="Brief description of the blog post"
              value={formData.excerpt || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
            />

                <Card>
                  <CardBody>
                    <label className="block text-sm font-medium text-foreground mb-2">
              Content * (Markdown supported)
            </label>
            <MarkdownEditor
              value={formData.content || ''}
              onChange={(value) => setFormData((prev: any) => ({ ...prev, content: value }))}
              placeholder="Write your blog post content here..."
            />
                  </CardBody>
                </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Featured Image URL"
                    placeholder="https://example.com/image.jpg"
                value={formData.featured_image_url || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, featured_image_url: e.target.value }))}
                    type="url"
                  />

                  <Input
                    label="Author Name"
                    placeholder="EGP Aesthetics Team"
                value={formData.author_name || 'EGP Aesthetics Team'}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, author_name: e.target.value }))}
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Read Time (minutes)"
                type="number"
                    value={formData.read_time_minutes?.toString() || '5'}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, read_time_minutes: parseInt(e.target.value) || 5 }))}
                min="1"
              />

                  <Input
                    label="Display Order"
                type="number"
                    value={formData.display_order?.toString() || '0'}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />

                  <Select
                    label="Status"
                    selectedKeys={[formData.is_published ? "published" : "draft"]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData((prev: any) => ({ 
                        ...prev, 
                        is_published: selected === "published",
                        published_at: selected === "published" && !prev.published_at ? new Date().toISOString() : prev.published_at
                      }));
                    }}
                  >
                    <SelectItem key="draft">Draft (Not visible)</SelectItem>
                    <SelectItem key="published">Published (Visible to public)</SelectItem>
                  </Select>
          </div>

                <Checkbox
                  isSelected={formData.featured || false}
                  onValueChange={(checked) => setFormData((prev: any) => ({ ...prev, featured: checked }))}
                >
                  Featured Post
                </Checkbox>

                <div className="space-y-4">
                  <Input
                    label="SEO Title"
                    placeholder="SEO optimized title"
              value={formData.seo_title || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, seo_title: e.target.value }))}
                    description="Optional: Custom title for search engines"
                  />

                  <Textarea
                    label="SEO Description"
                    placeholder="SEO meta description"
              value={formData.seo_description || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, seo_description: e.target.value }))}
              rows={2}
                    description="Optional: Meta description for search engines"
            />
          </div>
        </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
            Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={onSubmit}
          >
            {editingPost ? "Update Post" : "Create Post"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
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

  const defaultPost: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> = {
    title: "",
    slug: "",
    excerpt: null,
    content: "",
    category: "General",
    featured_image_url: null,
    featured: false,
    is_published: false,
    published_at: null,
    read_time_minutes: 5,
    seo_title: null,
    seo_description: null,
    author_name: "EGP Aesthetics Team",
    display_order: 0,
  };

  const [formData, setFormData] = useState<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>(defaultPost);

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
      showError("Validation Error", "Please fill in all required fields (Title, Slug, Content)");
      return;
    }

    try {
      if (editingPost) {
        await updatePost(editingPost.id, formData);
        showSuccess("Success", "Blog post updated successfully!");
      } else {
        await addPost(formData);
        showSuccess("Success", "Blog post created successfully!");
      }
      setShowModal(false);
      setEditingPost(null);
      setFormData(defaultPost);
    } catch (err) {
      showError("Error", err instanceof Error ? err.message : "Failed to save blog post");
    }
  };

  const handleDelete = async (post: BlogPost) => {
    await confirm(
      {
        title: "Delete Blog Post",
        message: `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
        isDestructive: true,
      },
      async () => {
        try {
          await deletePost(post.id);
          showSuccess("Success", "Blog post deleted successfully!");
        } catch (err) {
          showError("Error", err instanceof Error ? err.message : "Failed to delete blog post");
        }
      }
    );
  };

  const paginatedPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const totalPages = Math.ceil(posts.length / postsPerPage);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Spinner size="lg" />
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
      <div className="flex items-center justify-end mb-6">
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
                totalCount={posts.length}
                limit={postsPerPage}
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

