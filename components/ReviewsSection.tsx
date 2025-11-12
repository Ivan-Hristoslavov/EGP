"use client";

import { useReviews } from '@/hooks/useReviews';
import { useState } from 'react';
import type { Review } from '@/types';

export function ReviewsSection() {
  const { reviews, isLoading, error } = useReviews();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReview, setExpandedReview] = useState<Review | null>(null);
  const reviewsPerPage = 6;

  if (isLoading) {
    return (
      <section className="py-16 bg-[#f5f1e9] dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#b5ad9d]"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-[#f5f1e9] dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center py-12 text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  return (
    <section className="py-16 bg-[#f5f1e9] dark:bg-gray-900" id="reviews">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-full mb-5 border border-[#ddd5c3]/60 dark:border-gray-700/60 shadow-sm">
            <svg className="w-5 h-5 text-[#9d9585]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-[#6b5f4b]">Client Impressions</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Clients Say</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real experiences from valued customers who trust our services
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-[#ddd5c3]/60 dark:bg-gray-800/40 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-[#9d9585]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No Reviews Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Be the first to share your experience and help others make informed decisions
              </p>
              <a
                href="#leave-review"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-white font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("leave-review")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Write the First Review
              </a>
            </div>
          </div>
        ) : (
          <div>
            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {currentReviews.map((review, index) => {
                const isLongComment = review.comment.length > 260;
                return (
                <div 
                  key={review.id} 
                  className="group relative bg-white/90 dark:bg-gray-900/70 rounded-3xl p-6 sm:p-7 shadow-lg backdrop-blur border border-[#e4d9c8]/80 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-x-6 -top-6 h-16 bg-gradient-to-br from-[#9d9585]/20 via-[#b5ad9d]/20 to-[#ddd5c3]/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-12 h-12 bg-[#9d9585] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {review.customer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    </div>
                    
                    {/* Name & Rating */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1.5 truncate">
                        {review.customer_name}
                      </h4>
                      <div className="flex items-center gap-1.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} 
                            fill={i < review.rating ? "currentColor" : "none"}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f5f1e9] dark:bg-gray-800/70 border border-[#e4d9c8] dark:border-gray-700 rounded-full text-[10px] font-semibold tracking-wide uppercase text-[#6b5f4b] dark:text-gray-200">
                        <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className={`text-gray-700 dark:text-gray-300 text-sm leading-relaxed ${isLongComment ? 'line-clamp-5' : ''}`}>
                    {review.comment}
                  </div>
                  
                  {isLongComment && (
                    <button
                      onClick={() => setExpandedReview(review)}
                      className="mt-5 inline-flex items-center gap-2 text-[#8c846f] dark:text-[#c9c1b0] text-sm font-semibold hover:text-[#6b5f4b] dark:hover:text-[#ddd5c3] transition-colors"
                    >
                      Read full review
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              );})}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-[#f5f1e9] dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-[#e4d9c8] dark:border-gray-700 text-sm font-medium shadow-sm hover:shadow"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-xl transition-all text-sm font-medium shadow-sm ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-white shadow-md scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#f5f1e9] dark:hover:bg-gray-700 border border-[#e4d9c8] dark:border-gray-700 hover:shadow'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-[#f5f1e9] dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-[#e4d9c8] dark:border-gray-700 text-sm font-medium shadow-sm hover:shadow"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {expandedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setExpandedReview(null)}></div>
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-[#e4d9c8] dark:border-gray-700 overflow-hidden">
            <div className="flex items-start justify-between gap-6 px-6 sm:px-8 pt-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#9d9585] rounded-full flex items-center justify-center text-white text-xl font-semibold shadow">
                    {expandedReview.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{expandedReview.customer_name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < expandedReview.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                          fill={i < expandedReview.rating ? 'currentColor' : 'none'}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f5f1e9] dark:bg-gray-800/70 border border-[#e4d9c8] dark:border-gray-700 rounded-full text-[11px] font-semibold tracking-widest uppercase text-[#6b5f4b] dark:text-gray-200">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Review
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(expandedReview.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setExpandedReview(null)}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Close review"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 sm:px-8 pb-8 mt-6">
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {expandedReview.comment}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
