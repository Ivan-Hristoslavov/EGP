"use client";
import { useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import { useToast, ToastMessages } from "@/components/Toast";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { CheckCircle, AlertCircle, Star, Trash2, Eye } from "lucide-react";

export function AdminReviewsManager() {
  const { reviews, isLoading, error, approveReview, deleteReview, refetch } = useReviews(true);
  const { showSuccess, showError } = useToast();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  // Calculate pagination
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(r => r.is_approved).length;
  const pendingReviews = reviews.filter(r => !r.is_approved).length;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleApproveClick = (review: any) => {
    setSelectedReview(review);
    setShowApproveModal(true);
  };

  const handleDeleteClick = (review: any) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedReview) return;
    
    setProcessing(true);
    try {
      await approveReview(selectedReview.id, true);
      showSuccess("Review Approved", "The review has been approved and is now visible to customers.");
      setShowApproveModal(false);
      setSelectedReview(null);
    } catch (error) {
      showError("Error", "Failed to approve review. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return;
    
    setProcessing(true);
    try {
      await deleteReview(selectedReview.id);
      showSuccess("Review Deleted", "The review has been permanently deleted.");
      setShowDeleteModal(false);
      setSelectedReview(null);
    } catch (error) {
      showError("Error", "Failed to delete review. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    return (
      <Chip
        color={isApproved ? "success" : "warning"}
        variant="flat"
        size="sm"
        startContent={isApproved ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      >
        {isApproved ? "Approved" : "Pending"}
      </Chip>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-default-500">Loading reviews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-900/20">
        <CardBody className="p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-danger-500 mr-2" />
            <span className="text-danger-700 dark:text-danger-300">{error}</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-divider hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold mb-1">{totalReviews}</p>
                <p className="text-xs text-default-500">Total Reviews</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
                <Star className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-divider hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold mb-1">{approvedReviews}</p>
                <p className="text-xs text-default-500">Approved</p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-xl">
                <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-divider hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold mb-1">{pendingReviews}</p>
                <p className="text-xs text-default-500">Pending</p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex items-center justify-center">
          <Button
            color="primary"
            startContent={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
            onPress={() => refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <Card className="border border-divider">
          <CardBody className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-default-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-default-500">Customer reviews will appear here once they're submitted.</p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentReviews.map((review) => (
              <Card key={review.id} className="border border-divider hover:shadow-lg transition-shadow">
                <CardBody className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {review.customer_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-background"></div>
                        </div>
                        <div>
                          <h3 className="font-bold">
                            {review.customer_name}
                          </h3>
                          <p className="text-xs text-default-500">
                            {new Date(review.created_at).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(review.is_approved)}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-warning fill-warning' : 'text-default-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-medium text-default-600 ml-2">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-default-700 text-sm leading-relaxed mb-4 line-clamp-3">
                    {review.comment}
                  </p>

                  {/* Customer Email */}
                  {review.customer_email && (
                    <div className="flex items-center gap-2 mb-4 text-xs text-default-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {review.customer_email}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-divider">
                    {!review.is_approved && (
                      <Button
                        color="success"
                        size="sm"
                        startContent={<CheckCircle className="w-4 h-4" />}
                        onPress={() => handleApproveClick(review)}
                        className="flex-1"
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      color="danger"
                      size="sm"
                      startContent={<Trash2 className="w-4 h-4" />}
                      onPress={() => handleDeleteClick(review)}
                      className={!review.is_approved ? '' : 'flex-1'}
                    >
                      Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="bordered"
                size="sm"
                onPress={() => handlePageChange(currentPage - 1)}
                isDisabled={currentPage === 1}
              >
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "solid" : "bordered"}
                    color={currentPage === page ? "primary" : "default"}
                    onPress={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="bordered"
                size="sm"
                onPress={() => handlePageChange(currentPage + 1)}
                isDisabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Page Info */}
          {totalPages > 1 && (
            <div className="text-center text-sm text-default-500 mt-4">
              Showing {startIndex + 1}-{Math.min(endIndex, totalReviews)} of {totalReviews} reviews
            </div>
          )}
        </>
      )}

      {/* Confirmation Modals */}
      {showApproveModal && selectedReview && (
        <ConfirmationModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          onConfirm={handleApproveConfirm}
          title="Approve Review"
          message={`Are you sure you want to approve this review from ${selectedReview.customer_name}? Once approved, it will be visible to all customers on your website.`}
          confirmText="Approve Review"
          cancelText="Cancel"
          isDestructive={false}
          isLoading={processing}
        />
      )}

      {showDeleteModal && selectedReview && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Review"
          message={`Are you sure you want to permanently delete this review from ${selectedReview.customer_name}? This action cannot be undone.`}
          confirmText="Delete Review"
          cancelText="Cancel"
          isDestructive={true}
          isLoading={processing}
        />
      )}
    </div>
  );
} 