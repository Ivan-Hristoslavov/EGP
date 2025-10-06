"use client";

import { usePricingCards } from "@/hooks/usePricingCards";

function PricingCardSkeleton() {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-600 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full animate-pulse">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-100 to-orange-100 rounded-full translate-y-12 -translate-x-12" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Icon */}
        <div className="flex items-center mb-6 flex-shrink-0">
          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl mr-4"></div>
          <div className="min-w-0 flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 mb-6 flex-1">
          <div className="space-y-3">
            {/* Header row */}
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            </div>
            {/* Data rows */}
            <div className="space-y-2">
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Skeleton */}
        <div className="space-y-2 mb-6 flex-shrink-0">
          <div className="flex items-start">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2 mt-0.5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
          <div className="flex items-start">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2 mt-0.5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
          <div className="flex items-start">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2 mt-0.5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionPricing() {
  const { pricingCards, loading, error } = usePricingCards();

  if (loading) {
    return (
      <section className="relative py-24 overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full" />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-yellow-500 rounded-full" />
          <div className="absolute bottom-40 right-10 w-20 h-20 bg-green-500 rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Transparent Pricing
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              EGP - Professional Rates
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Clear, competitive pricing with no hidden fees. Choose the service
              that best fits your needs.
            </p>
          </div>

          {/* Loading Skeleton Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-center max-w-6xl mx-auto mb-16">
            <PricingCardSkeleton />
            <PricingCardSkeleton />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-24 overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-red-600 dark:text-red-400">Error loading pricing information</div>
        </div>
      </section>
    );
  }
  return (
    <section
      className="relative py-24 overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-500"
    >
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700" />
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-yellow-500 rounded-full" />
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-green-500 rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Transparent Pricing
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            EGP - Professional Rates
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Clear, competitive pricing with no hidden fees. Choose the service
            that best fits your needs.
          </p>
        </div>

        {/* Dynamic Pricing Cards - Fixed Height Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-center max-w-6xl mx-auto mb-16">
          {pricingCards.map((card, index) => (
            <div key={card.id} className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-600 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full">
              {/* Background Pattern */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${index % 2 === 0 ? 'from-blue-100 to-purple-100' : 'from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30'} rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500`} />
              <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${index % 2 === 0 ? 'from-yellow-100 to-orange-100' : 'from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30'} rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-500`} />

              <div className="relative z-10 flex flex-col h-full">
                {/* Header with Icon */}
                <div className="flex items-center mb-6 flex-shrink-0">
                  <div className={`w-14 h-14 bg-gradient-to-br ${index % 2 === 0 ? 'from-blue-500 to-purple-600' : 'from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500'} rounded-2xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300`}>
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p className={`${index % 2 === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'} font-medium text-sm truncate`}>
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dynamic Table - Flexible Height with Proper Alignment */}
                {card.table_rows && card.table_rows.length > 0 && (
                  <div className={`bg-gradient-to-br ${index % 2 === 0 ? 'from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600' : 'from-gray-50 to-orange-50 dark:from-gray-800 dark:to-orange-900/20'} rounded-2xl p-4 mb-6 flex-1`}>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-500">
                            {card.table_headers && card.table_headers.map((header, headerIndex) => (
                              <th key={header} className={`py-2 pr-3 font-bold text-gray-900 dark:text-white text-xs sm:text-sm ${
                                headerIndex === 0 ? 'text-left' : 'text-center'
                              }`}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {card.table_rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                              {card.table_headers && card.table_headers.map((header, cellIndex) => (
                                <td key={header} className={`py-3 pr-3 font-medium transition-colors duration-300 text-xs sm:text-sm ${
                                  cellIndex === 0 
                                    ? 'text-gray-800 dark:text-gray-200 text-left' 
                                    : cellIndex === 1 
                                      ? (row[header]?.includes('£80') ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400') + ' font-bold text-center'
                                      : 'text-blue-600 dark:text-blue-400 font-bold text-center'
                                }`}>
                                  <div className="break-words leading-tight">
                                    {row[header] || ""}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Dynamic Notes - Fixed at Bottom */}
                {card.notes && card.notes.length > 0 && (
                  <div className="space-y-2 mb-6 flex-shrink-0">
                    {card.notes.map((note, noteIndex) => (
                      <div key={noteIndex} className="flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        <span className="w-4 h-4 mr-2 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {note.icon || '✓'}
                        </span>
                        <span className="font-medium leading-tight">
                          {note.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Explanatory Text */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 max-w-4xl mx-auto transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400 rounded-xl flex items-center justify-center mr-4 transition-all duration-300">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Important Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
            <div className="space-y-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <p className="leading-relaxed">
                  All rates above are <strong>labour only</strong>. Materials
                  are not included and can be supplied by the customer.
                </p>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <p className="leading-relaxed">
                  Materials can be provided by us at <strong>cost + 20%</strong>{" "}
                  for your convenience.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-500 dark:text-purple-400 mr-3 mt-0.5 flex-shrink-0 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <p className="leading-relaxed">
                  Call-out fee includes{" "}
                  <strong>travel and initial assessment</strong> of the problem.
                </p>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-orange-500 dark:text-orange-400 mr-3 mt-0.5 flex-shrink-0 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <p className="leading-relaxed">
                  Full-day bookings offer <strong>reduced hourly rates</strong>{" "}
                  and are subject to availability.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800 transition-all duration-300">
            <p className="text-center text-gray-700 dark:text-gray-300 font-medium transition-colors duration-300">
              All prices are set based on average rates in{" "}
              <strong>South West London</strong> and remain competitive and
              fair.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
