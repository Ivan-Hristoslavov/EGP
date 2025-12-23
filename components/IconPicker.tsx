"use client";

import { useState } from "react";
import { 
  Star, Award, Trophy, Sparkles, Calendar, MessageCircle, 
  Phone, Mail, ArrowRight, ExternalLink, CheckCircle, 
  Heart, Zap, Shield, Crown, Gem, Flame, Target
} from "lucide-react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";

export type IconType = 
  | "star" | "award" | "trophy" | "sparkles" | "crown" | "gem" | "flame" | "target"
  | "calendar" | "whatsapp" | "phone" | "mail" | "arrow-right" | "external-link"
  | "check-circle" | "heart" | "zap" | "shield";

export interface IconOption {
  value: IconType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "badge" | "button" | "both";
}

const iconOptions: IconOption[] = [
  // Badge icons
  { value: "star", label: "Star", icon: Star, category: "badge" },
  { value: "award", label: "Award", icon: Award, category: "badge" },
  { value: "trophy", label: "Trophy", icon: Trophy, category: "badge" },
  { value: "sparkles", label: "Sparkles", icon: Sparkles, category: "badge" },
  { value: "crown", label: "Crown", icon: Crown, category: "badge" },
  { value: "gem", label: "Gem", icon: Gem, category: "badge" },
  { value: "flame", label: "Flame", icon: Flame, category: "badge" },
  { value: "target", label: "Target", icon: Target, category: "badge" },
  
  // Button icons
  { value: "calendar", label: "Calendar", icon: Calendar, category: "button" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, category: "button" },
  { value: "phone", label: "Phone", icon: Phone, category: "button" },
  { value: "mail", label: "Mail", icon: Mail, category: "button" },
  { value: "arrow-right", label: "Arrow Right", icon: ArrowRight, category: "button" },
  { value: "external-link", label: "External Link", icon: ExternalLink, category: "button" },
  { value: "check-circle", label: "Check Circle", icon: CheckCircle, category: "button" },
  { value: "heart", label: "Heart", icon: Heart, category: "button" },
  { value: "zap", label: "Zap", icon: Zap, category: "button" },
  { value: "shield", label: "Shield", icon: Shield, category: "button" },
];

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  category?: "badge" | "button" | "both";
}

export function IconPicker({ value, onChange, label, category = "both" }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = iconOptions.filter((option) => {
    const matchesCategory = 
      category === "both" || 
      option.category === category || 
      option.category === "both";
    const matchesSearch = option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         option.value.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedIcon = iconOptions.find((opt) => opt.value === value);

  const handleSelect = (iconValue: string) => {
    onChange(iconValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
        }
      }} className="w-full">
        <Input
          label={label}
          value={selectedIcon ? selectedIcon.label : "Select Icon"}
          placeholder="Select Icon"
          variant="bordered"
          readOnly
          isReadOnly
          startContent={
            selectedIcon ? (
              <selectedIcon.icon className="w-4 h-4 shrink-0 text-default-600 dark:text-default-400" />
            ) : (
              <Star className="w-4 h-4 opacity-50 shrink-0 text-default-400" />
            )
          }
          endContent={
            <svg
              className="w-4 h-4 pointer-events-none shrink-0 text-default-400"
              fill="none"
              height="1em"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="1em"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          }
          classNames={{
            input: "cursor-pointer",
            inputWrapper: "cursor-pointer",
          }}
        />
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          setSearchQuery("");
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">Select {label}</h3>
              <p className="text-sm text-default-500">Choose an icon from the list below</p>
            </div>
          </ModalHeader>
          <ModalBody>
            <Input
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="bordered"
              classNames={{
                input: "text-sm",
              }}
            />
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mt-4">
              {filteredIcons.map((option) => {
                const IconComponent = option.icon;
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
                      hover:scale-105 hover:shadow-md
                      ${isSelected 
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                        : "border-divider hover:border-primary-300 bg-default-50 dark:bg-default-100"
                      }
                    `}
                    title={option.label}
                  >
                    <IconComponent 
                      className={`w-6 h-6 ${
                        isSelected 
                          ? "text-primary-600 dark:text-primary-400" 
                          : "text-default-600 dark:text-default-400"
                      }`} 
                    />
                    <span className={`text-xs text-center ${
                      isSelected 
                        ? "text-primary-700 dark:text-primary-300 font-medium" 
                        : "text-default-600 dark:text-default-400"
                    }`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-default-500">
                <p>No icons found matching "{searchQuery}"</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => {
              setIsOpen(false);
              setSearchQuery("");
            }}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

