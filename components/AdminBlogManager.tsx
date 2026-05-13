"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { ScrollShadow } from "@heroui/scroll-shadow";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Switch } from "@heroui/switch";
import { Spinner } from "@heroui/spinner";
import { Plus } from "lucide-react";

import { useBlog, BlogPost } from "@/hooks/useBlog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { AdminTruncatedText } from "@/components/admin/admin-truncated-text";
import { useToast } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import Pagination from "@/components/Pagination";
import { typography } from "@/config/typography";
import { formLayout } from "@/config/design-system";

type BlogFormState = Omit<BlogPost, "id" | "created_at" | "updated_at">;

const BLOG_STEP_LABELS = ["Basics", "Content", "Visibility", "SEO"] as const;

const TOTAL_BLOG_STEPS = BLOG_STEP_LABELS.length;

function postDisplayDate(post: BlogPost) {
  return post.published_at
    ? new Date(post.published_at).toLocaleDateString()
    : new Date(post.created_at).toLocaleDateString();
}

function validateBlogStep(
  step: number,
  formData: BlogFormState,
): string | null {
  if (step === 1) {
    if (!formData.title?.trim()) return "Please enter a title.";
    if (!formData.slug?.trim()) return "Please enter a URL slug.";

    return null;
  }
  if (step === 2) {
    if (!formData.content?.trim()) return "Please add article content.";

    return null;
  }

  return null;
}

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
  formData: BlogFormState;
  setFormData: React.Dispatch<React.SetStateAction<BlogFormState>>;
}) {
  const { showError } = useToast();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen, editingPost?.id]);

  const categories = [
    "Anti-wrinkle",
    "Fillers",
    "Skincare",
    "Face Treatments",
    "Body Treatments",
    "General",
  ];

  function goNext() {
    const err = validateBlogStep(step, formData);

    if (err) {
      showError("Complete this step", err);

      return;
    }
    if (step < TOTAL_BLOG_STEPS) setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  const publishedCopy = formData.is_published
    ? "Live on the blog — visitors can read this post."
    : "Draft — not shown on the site until you publish.";

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "max-h-[95vh] sm:max-h-[90vh] mx-2 sm:mx-4",
        wrapper: "items-start sm:items-center pt-4 sm:pt-0",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="4xl"
      onClose={onClose}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex shrink-0 flex-col gap-1">
              <h2 className={typography.headingCard}>
                {editingPost ? "Edit blog post" : "Add new blog post"}
              </h2>
              <p className="text-sm font-normal text-default-500">
                {editingPost
                  ? "Update your post in a few guided steps."
                  : "Create a post step by step — visibility options are explained as you go."}
              </p>
            </ModalHeader>
            <ModalBody
              className={`${formLayout.modalBody} max-h-[min(70vh,600px)] overflow-y-auto sm:max-h-[min(75vh,700px)]`}
            >
              <div
                className={`sticky top-0 z-10 -mx-4 mb-4 border-b border-divider bg-content1/95 px-4 pb-3 pt-0 backdrop-blur-sm sm:-mx-6 sm:px-6`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <Chip
                      color={formData.is_published ? "success" : "default"}
                      size="md"
                      variant="flat"
                    >
                      {formData.is_published ? "Published" : "Draft"}
                    </Chip>
                    <p className="text-sm text-default-600">{publishedCopy}</p>
                  </div>
                  <Switch
                    classNames={{ label: "text-sm font-medium" }}
                    isSelected={formData.is_published}
                    size="sm"
                    onValueChange={(next) => {
                      setFormData((prev) => ({
                        ...prev,
                        is_published: next,
                        published_at:
                          next && !prev.published_at
                            ? new Date().toISOString()
                            : prev.published_at,
                      }));
                    }}
                  >
                    Visible on site
                  </Switch>
                </div>
                <nav
                  aria-label="Blog post steps"
                  className="mt-4 flex flex-wrap gap-2"
                >
                  {BLOG_STEP_LABELS.map((label, index) => {
                    const n = index + 1;
                    const isCurrent = step === n;
                    const isDone = step > n;

                    return (
                      <div
                        key={label}
                        aria-current={isCurrent ? "step" : undefined}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:text-sm ${
                          isCurrent
                            ? "border-primary bg-primary/10 text-primary"
                            : isDone
                              ? "border-success-200 bg-success-50 text-success-700 dark:border-success-800 dark:bg-success-900/20 dark:text-success-400"
                              : "border-default-200 text-default-500 dark:border-default-100"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                            isDone
                              ? "bg-success text-white"
                              : isCurrent
                                ? "bg-primary text-white"
                                : "bg-default-200 text-default-600 dark:bg-default-600 dark:text-default-300"
                          }`}
                        >
                          {isDone ? "✓" : n}
                        </span>
                        {label}
                      </div>
                    );
                  })}
                </nav>
                <p className="mt-2 text-xs text-default-500">
                  Step {step} of {TOTAL_BLOG_STEPS}:{" "}
                  {BLOG_STEP_LABELS[step - 1]}
                </p>
              </div>

              <div className={formLayout.sectionGap}>
                {step === 1 && (
                  <>
                    <Input
                      isRequired
                      label="Title"
                      placeholder="Enter blog post title"
                      size="lg"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                    <div className={formLayout.gridFields}>
                      <Input
                        isRequired
                        description="URL-friendly version of the title"
                        label="Slug"
                        placeholder="url-friendly-slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                              .replace(/[^a-z0-9-]/g, ""),
                          }))
                        }
                      />
                      <Select
                        isRequired
                        label="Category"
                        selectedKeys={[formData.category]}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;

                          setFormData((prev) => ({
                            ...prev,
                            category: selected || "General",
                          }));
                        }}
                      >
                        {categories.map((cat) => (
                          <SelectItem key={cat}>{cat}</SelectItem>
                        ))}
                      </Select>
                    </div>
                    <Textarea
                      label="Excerpt"
                      placeholder="Brief description for listings and previews"
                      rows={3}
                      value={formData.excerpt || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          excerpt: e.target.value,
                        }))
                      }
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <Card>
                      <CardBody>
                        <p className="mb-2 text-sm font-medium text-foreground">
                          Content (required) — Markdown supported
                        </p>
                        <MarkdownEditor
                          placeholder="Write your blog post content here..."
                          value={formData.content || ""}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              content: value,
                            }))
                          }
                        />
                      </CardBody>
                    </Card>
                    <div className={formLayout.gridFields}>
                      <Input
                        label="Featured image URL"
                        placeholder="https://example.com/image.jpg"
                        type="url"
                        value={formData.featured_image_url || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            featured_image_url: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Author name"
                        placeholder="EGP Aesthetics Team"
                        value={formData.author_name || "EGP Aesthetics Team"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            author_name: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <div className={formLayout.sectionGap}>
                    <Card className="border border-default-200 bg-default-50/50 dark:border-default-100/30 dark:bg-default-100/10">
                      <CardBody className="gap-4">
                        <p className="text-sm font-semibold text-foreground">
                          Visibility &amp; placement
                        </p>
                        <p className="text-sm text-default-600">
                          Use the switch at the top anytime to draft or publish.
                          Featured and order affect how the post appears in blog
                          listings when your theme uses them.
                        </p>
                        <Switch
                          classNames={{
                            base: "max-w-full justify-between",
                            label: "text-sm font-medium",
                          }}
                          isSelected={formData.featured}
                          onValueChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              featured: checked,
                            }))
                          }
                        >
                          Featured post (highlight in blog listing / home when
                          supported)
                        </Switch>
                        <div className={formLayout.gridFields}>
                          <Input
                            description="Lower numbers often appear first in sorted lists."
                            label="Display order"
                            type="number"
                            value={formData.display_order?.toString() || "0"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                display_order:
                                  parseInt(e.target.value, 10) || 0,
                              }))
                            }
                          />
                          <Input
                            description="Shown next to the article title as an estimate."
                            label="Read time (minutes)"
                            min="1"
                            type="number"
                            value={
                              formData.read_time_minutes?.toString() || "5"
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                read_time_minutes:
                                  parseInt(e.target.value, 10) || 5,
                              }))
                            }
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                {step === 4 && (
                  <div className={formLayout.sectionGap}>
                    <Input
                      description="Optional: custom title for search engines"
                      label="SEO title"
                      placeholder="SEO optimized title"
                      value={formData.seo_title || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          seo_title: e.target.value,
                        }))
                      }
                    />
                    <Textarea
                      description="Optional: meta description for search results"
                      label="SEO description"
                      placeholder="SEO meta description"
                      rows={3}
                      value={formData.seo_description || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          seo_description: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex flex-wrap gap-2">
              <Button variant="light" onPress={onCloseModal}>
                Cancel
              </Button>
              <Button
                isDisabled={step <= 1}
                variant="bordered"
                onPress={goBack}
              >
                Back
              </Button>
              {step < TOTAL_BLOG_STEPS ? (
                <Button color="primary" onPress={goNext}>
                  Next
                </Button>
              ) : (
                <Button color="primary" onPress={onSubmit}>
                  {editingPost ? "Update post" : "Create post"}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export function AdminBlogManager({ triggerModal }: { triggerModal?: boolean }) {
  const { posts, isLoading, error, addPost, updatePost, deletePost } =
    useBlog(true);
  const { showSuccess, showError } = useToast();
  const { confirm, modalProps } = useConfirmation();

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isMdOrLarger = useMediaQuery();
  /** Cards on small screens by default; table on md+ until the user toggles. */
  const [listView, setListView] = useState<"table" | "cards">("cards");
  const [listLayoutTouched, setListLayoutTouched] = useState(false);
  const postsPerPage = 10;

  useEffect(() => {
    if (listLayoutTouched) return;
    setListView(isMdOrLarger ? "table" : "cards");
  }, [isMdOrLarger, listLayoutTouched]);

  const defaultPost: Omit<BlogPost, "id" | "created_at" | "updated_at"> = {
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

  const [formData, setFormData] =
    useState<Omit<BlogPost, "id" | "created_at" | "updated_at">>(defaultPost);

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
      showError(
        "Validation Error",
        "Please fill in all required fields (Title, Slug, Content)",
      );

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
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to save blog post",
      );
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
          showError(
            "Error",
            err instanceof Error ? err.message : "Failed to delete blog post",
          );
        }
      },
    );
  };

  const paginatedPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
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
    <div className="w-full max-w-full overflow-x-hidden px-0 py-4 sm:py-5 md:py-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h2 className={typography.headingSection}>Blog Posts</h2>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-4 lg:w-auto">
          <div className="flex w-full flex-col gap-1 sm:w-auto">
            <div
              aria-label="Post list layout"
              className="flex items-center justify-between gap-3 rounded-lg border border-divider bg-default-100 px-3 py-2 sm:justify-center"
              role="group"
            >
              <span
                className={`text-sm font-medium ${listView === "table" ? "text-foreground" : "text-default-500"}`}
              >
                Table
              </span>
              <Switch
                aria-label="Show posts as cards instead of table"
                isSelected={listView === "cards"}
                size="sm"
                onValueChange={(asCards) => {
                  setListLayoutTouched(true);
                  setListView(asCards ? "cards" : "table");
                }}
              />
              <span
                className={`text-sm font-medium ${listView === "cards" ? "text-foreground" : "text-default-500"}`}
              >
                Cards
              </span>
            </div>
            <p className="text-center text-xs text-default-500 sm:text-left">
              Cards are easier on a phone; table view suits a larger screen.
            </p>
          </div>
          <Button
            className="min-h-[44px] w-full sm:w-auto shrink-0"
            color="primary"
            startContent={<Plus className="w-5 h-5" />}
            onPress={handleAddNew}
          >
            Add New Post
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card className="border border-divider">
          <CardBody className="py-12 text-center">
            <p className="text-default-600 mb-4">No blog posts yet.</p>
            <Button color="primary" onPress={handleAddNew}>
              Create Your First Post
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          {listView === "cards" ? (
            <div className="flex flex-col gap-4 sm:gap-5">
              {paginatedPosts.map((post) => (
                <Card key={post.id} className="border border-divider shadow-sm">
                  <CardBody className="gap-0 p-0">
                    <div className="space-y-2 p-4 sm:p-5">
                      <h4
                        className={`font-semibold text-foreground ${typography.headingSmall}`}
                      >
                        {post.title}
                      </h4>
                      {post.excerpt ? (
                        <p className="text-sm text-default-500 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>
                    <Divider />
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
                      <Chip color="primary" size="sm" variant="flat">
                        {post.category}
                      </Chip>
                      <Chip
                        color={post.is_published ? "success" : "default"}
                        size="sm"
                        variant="flat"
                      >
                        {post.is_published ? "Published" : "Draft"}
                      </Chip>
                      {post.featured ? (
                        <Chip color="warning" size="sm" variant="flat">
                          Featured
                        </Chip>
                      ) : null}
                    </div>
                    <Divider />
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-default-500">
                        {postDisplayDate(post)}
                      </p>
                      <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
                        <Button
                          className="min-h-[44px] flex-1 sm:flex-initial sm:min-w-[88px]"
                          color="primary"
                          variant="flat"
                          onPress={() => handleEdit(post)}
                        >
                          Edit
                        </Button>
                        <Button
                          className="min-h-[44px] flex-1 sm:flex-initial sm:min-w-[88px]"
                          color="danger"
                          variant="flat"
                          onPress={() => handleDelete(post)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="w-full border border-divider">
              <CardBody className="p-0">
                <ScrollShadow
                  hideScrollBar
                  className="w-full max-w-full"
                  orientation="horizontal"
                  size={32}
                >
                  <Table
                    removeWrapper
                    aria-label="Blog posts"
                    classNames={{
                      base: "min-w-[min(100%,1024px)] w-full pb-1",
                      table: "w-full min-w-[960px] table-auto",
                      thead:
                        "sticky top-0 z-10 bg-content1 shadow-sm [&>tr]:shadow-sm",
                      th: "whitespace-nowrap bg-content1 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-default-600 first:pl-4 last:pr-4 lg:px-6 xl:px-8",
                      td: "align-top px-4 py-4 first:pl-4 last:pr-4 lg:px-6 xl:py-5 xl:px-8",
                    }}
                    selectionMode="none"
                  >
                    <TableHeader>
                      <TableColumn minWidth={280}>Title</TableColumn>
                      <TableColumn minWidth={120}>Category</TableColumn>
                      <TableColumn minWidth={108}>Status</TableColumn>
                      <TableColumn minWidth={112}>Featured</TableColumn>
                      <TableColumn minWidth={104}>Date</TableColumn>
                      <TableColumn align="end" minWidth={152}>
                        Actions
                      </TableColumn>
                    </TableHeader>
                    <TableBody<BlogPost> items={paginatedPosts}>
                      {(post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div className="min-w-0 max-w-[14rem] text-sm font-semibold text-foreground sm:max-w-xs md:max-w-md lg:max-w-xl">
                              <AdminTruncatedText
                                className="block"
                                maxChars={22}
                                text={post.title}
                              />
                            </div>
                            {post.excerpt ? (
                              <div className="mt-1 line-clamp-2 break-words text-xs text-default-500">
                                {post.excerpt}
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Chip color="primary" size="sm" variant="flat">
                              {post.category}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              color={post.is_published ? "success" : "default"}
                              size="sm"
                              variant="flat"
                            >
                              {post.is_published ? "Published" : "Draft"}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {post.featured ? (
                              <Chip color="warning" size="sm" variant="flat">
                                Featured
                              </Chip>
                            ) : (
                              <span className="text-sm text-default-400">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="whitespace-nowrap text-sm text-default-500">
                              {postDisplayDate(post)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-nowrap items-center justify-end gap-2">
                              <Button
                                className="shrink-0"
                                color="primary"
                                size="sm"
                                variant="light"
                                onPress={() => handleEdit(post)}
                              >
                                Edit
                              </Button>
                              <Button
                                className="shrink-0"
                                color="danger"
                                size="sm"
                                variant="light"
                                onPress={() => handleDelete(post)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollShadow>
              </CardBody>
            </Card>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                limit={postsPerPage}
                totalCount={posts.length}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      <BlogModal
        editingPost={editingPost}
        formData={formData}
        isOpen={showModal}
        setFormData={setFormData}
        onClose={() => {
          setShowModal(false);
          setEditingPost(null);
          setFormData(defaultPost);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmationModal {...modalProps} />
    </div>
  );
}
