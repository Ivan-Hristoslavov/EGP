"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Filter, X } from "lucide-react";
import ButtonBookNow from "@/components/ButtonBookNow";
import { Select, SelectItem, Chip, Button, Accordion, AccordionItem } from "@heroui/react";

const antiWrinkleServices = [
  { name: "Baby Botox", price: 199, duration: 15, slug: "baby-botox", popular: true },
  { name: "Brow Lift", price: 279, duration: 15, slug: "brow-lift" },
  { name: "Eye Wrinkles (Crow's Feet)", price: 179, duration: 15, slug: "eye-wrinkles" },
  { name: "Forehead Lines", price: 179, duration: 15, slug: "forehead-lines", popular: true },
  { name: "Glabella Lines (Frown Lines)", price: 179, duration: 15, slug: "glabella-lines" },
  { name: "Barcode Lips", price: 129, duration: 10, slug: "barcode-lips" },
  { name: "Bunny Lines", price: 129, duration: 10, slug: "bunny-lines" },
  { name: "Lip Lines", price: 179, duration: 15, slug: "lip-lines" },
  { name: "Gummy Smile", price: 129, duration: 10, slug: "gummy-smile" },
  { name: "Neck Lift", price: 329, duration: 20, slug: "neck-lift" },
  { name: "Jaw Slimming", price: 279, duration: 20, slug: "jaw-slimming", popular: true },
  { name: "Pebble Chin", price: 179, duration: 10, slug: "pebble-chin" },
  { name: "Bruxism Treatment (Teeth Grinding)", price: 279, duration: 20, slug: "bruxism" },
];

type SortOption = "popular" | "price-asc" | "price-desc" | "duration-asc" | "duration-desc" | "name-asc";

export default function AntiWrinklePage() {
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [durationRange, setDurationRange] = useState<string>("all");
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-egp-green-dark via-egp-green to-egp-green-light text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Anti-wrinkle Injections
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Smooth wrinkles and fine lines with expert Botox treatments
            </p>
            <ButtonBookNow size="lg" variant="secondary" />
          </div>
        </div>
      </section>

      {/* Filters and Sort */}
      <section className="py-8 bg-egp-beige-lighter">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3 items-center mb-4">
              <Chip
                variant={showPopularOnly ? "solid" : "flat"}
                className={showPopularOnly ? "bg-egp-green text-white" : ""}
                onClick={() => setShowPopularOnly(!showPopularOnly)}
                classNames={{
                  base: "cursor-pointer hover:opacity-80 transition-opacity",
                }}
              >
                Popular Only
              </Chip>
              
              {(priceRange !== "all" || durationRange !== "all" || showPopularOnly) && (
                <Button
                  variant="light"
                  size="sm"
                  startContent={<X className="w-4 h-4" />}
                  onClick={() => {
                    setShowPopularOnly(false);
                    setPriceRange("all");
                    setDurationRange("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filters Accordion */}
            <Accordion
              selectionMode="multiple"
              defaultExpandedKeys={["sort"]}
              variant="bordered"
              className="bg-white rounded-lg"
              itemClasses={{
                base: "px-4",
                title: "text-sm font-semibold",
                trigger: "py-3",
                content: "pb-4",
              }}
            >
              <AccordionItem
                key="filters"
                title="Filters"
                startContent={<Filter className="w-4 h-4 text-egp-green" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Price Range"
                    selectedKeys={[priceRange]}
                    onSelectionChange={(keys) => setPriceRange(Array.from(keys)[0] as string)}
                    size="sm"
                    classNames={{
                      trigger: "bg-white border border-gray-200",
                    }}
                  >
                    <SelectItem key="all">All Prices</SelectItem>
                    <SelectItem key="under-150">Under £150</SelectItem>
                    <SelectItem key="150-200">£150 - £200</SelectItem>
                    <SelectItem key="200-300">£200 - £300</SelectItem>
                    <SelectItem key="over-300">Over £300</SelectItem>
                  </Select>

                  <Select
                    label="Duration"
                    selectedKeys={[durationRange]}
                    onSelectionChange={(keys) => setDurationRange(Array.from(keys)[0] as string)}
                    size="sm"
                    classNames={{
                      trigger: "bg-white border border-gray-200",
                    }}
                  >
                    <SelectItem key="all">All Durations</SelectItem>
                    <SelectItem key="10">10 minutes</SelectItem>
                    <SelectItem key="15">15 minutes</SelectItem>
                    <SelectItem key="20">20 minutes</SelectItem>
                  </Select>
                </div>
              </AccordionItem>

              <AccordionItem
                key="sort"
                title="Sort By"
                startContent={<Clock className="w-4 h-4 text-egp-green" />}
              >
                <Select
                  selectedKeys={[sortBy]}
                  onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as SortOption)}
                  size="sm"
                  classNames={{
                    trigger: "bg-white border border-gray-200",
                  }}
                >
                  <SelectItem key="popular">Popular First</SelectItem>
                  <SelectItem key="price-asc">Price: Low to High</SelectItem>
                  <SelectItem key="price-desc">Price: High to Low</SelectItem>
                  <SelectItem key="duration-asc">Duration: Shortest</SelectItem>
                  <SelectItem key="duration-desc">Duration: Longest</SelectItem>
                  <SelectItem key="name-asc">Name: A-Z</SelectItem>
                </Select>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {(() => {
            // Filter services
            let filtered = antiWrinkleServices.filter(service => {
              if (showPopularOnly && !service.popular) return false;
              
              // Price filter
              if (priceRange !== "all") {
                if (priceRange === "under-150" && service.price >= 150) return false;
                if (priceRange === "150-200" && (service.price < 150 || service.price > 200)) return false;
                if (priceRange === "200-300" && (service.price < 200 || service.price > 300)) return false;
                if (priceRange === "over-300" && service.price <= 300) return false;
              }
              
              // Duration filter
              if (durationRange !== "all" && service.duration !== parseInt(durationRange)) return false;
              
              return true;
            });

            // Sort services
            filtered = [...filtered].sort((a, b) => {
              switch (sortBy) {
                case "popular":
                  if (a.popular && !b.popular) return -1;
                  if (!a.popular && b.popular) return 1;
                  return a.price - b.price; // Secondary sort by price
                case "price-asc":
                  return a.price - b.price;
                case "price-desc":
                  return b.price - a.price;
                case "duration-asc":
                  return a.duration - b.duration;
                case "duration-desc":
                  return b.duration - a.duration;
                case "name-asc":
                  return a.name.localeCompare(b.name);
                default:
                  return 0;
              }
            });

            return (
              <>
                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No services found matching your filters.</p>
                    <Button
                      variant="light"
                      className="mt-4"
                      onClick={() => {
                        setShowPopularOnly(false);
                        setPriceRange("all");
                        setDurationRange("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((service) => (
              <div
                key={service.slug}
                className="group relative bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-egp-green hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {service.popular && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-gradient-to-r from-egp-green to-egp-green-dark text-white text-[10px] font-bold rounded-full">
                    POPULAR
                  </span>
                )}

                <Link href={`/services/${service.slug}`} className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 pr-16 group-hover:text-egp-green transition-colors">
                    {service.name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
                  <div>
                    <span className="text-xs text-gray-600">From</span>
                    <div className="text-lg font-bold text-egp-green">£{service.price}</div>
                  </div>
                  <Link
                    href={`/book?service=${service.slug}`}
                    className="flex items-center gap-2 text-egp-green font-semibold hover:text-egp-green-dark hover:gap-3 transition-all"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                    </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-egp-green-dark via-egp-green to-egp-green-light text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Start Your Anti-Aging Journey Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Book your treatment now and discover how we can help you look and feel your best
          </p>
          <ButtonBookNow size="lg" variant="secondary" className="w-full sm:w-auto mx-4 sm:mx-0" />
        </div>
      </section>
    </div>
  );
}

