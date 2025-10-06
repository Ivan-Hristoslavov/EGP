"use client";

import React, { useState } from "react";

export type SettingsTab = {
  id: string;
  name: string;
  icon: React.ReactElement | string;
  description: string;
  category: "business" | "content" | "integrations";
};

interface SettingsNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: SettingsTab[];
}

export function SettingsNavigation({ activeTab, onTabChange, tabs }: SettingsNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clickedTab, setClickedTab] = useState<string | null>(null);
  
  const categories = {
    business: { name: "Business", color: "blue", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    content: { name: "Content", color: "green", bgColor: "bg-green-50 dark:bg-green-900/20" },
    integrations: { name: "Integrations", color: "purple", bgColor: "bg-purple-50 dark:bg-purple-900/20" }
  };

  const groupedTabs = tabs.reduce((acc, tab) => {
    if (!acc[tab.category]) {
      acc[tab.category] = [];
    }
    acc[tab.category].push(tab);
    return acc;
  }, {} as Record<string, SettingsTab[]>);

  const handleTabClick = (tabId: string) => {
    // Add click effect
    setClickedTab(tabId);
    
    // Remove click effect after animation
    setTimeout(() => {
      setClickedTab(null);
    }, 150);
    
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 active:scale-95 active:bg-gray-200 dark:active:bg-gray-600"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentTab?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-xl animate-in slide-in-from-left duration-300 z-[10000] flex flex-col">
            {/* Mobile Menu Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 active:scale-95 active:bg-gray-200 dark:active:bg-gray-600"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your business configuration
              </p>
            </div>

            {/* Mobile Navigation - Scrollable */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-6">
              {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${categories[category as keyof typeof categories].color}-500`}></div>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {categories[category as keyof typeof categories].name}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {categoryTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 group border-2 relative overflow-hidden ${
                          activeTab === tab.id
                            ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                            : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        } ${
                          clickedTab === tab.id 
                            ? "scale-95 shadow-inner bg-blue-100 dark:bg-blue-800/50" 
                            : "hover:scale-[1.02] active:scale-95"
                        }`}
                      >
                        {/* Ripple effect */}
                        {clickedTab === tab.id && (
                          <div className="absolute inset-0 bg-blue-200 dark:bg-blue-700 opacity-30 animate-ping"></div>
                        )}
                        
                        <div className="flex items-start gap-3 relative z-10">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                            activeTab === tab.id
                              ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 shadow-md"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 group-hover:shadow-md"
                          } ${clickedTab === tab.id ? "scale-110" : ""}`}>
                            <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                              {tab.icon}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm transition-colors duration-200 ${
                              activeTab === tab.id
                                ? "text-blue-900 dark:text-blue-100"
                                : "text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white"
                            }`}>
                              {tab.name}
                            </div>
                            <div className={`text-xs mt-1 line-clamp-2 transition-colors duration-200 ${
                              activeTab === tab.id
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-gray-500 dark:text-gray-400"
                            }`}>
                              {tab.description}
                            </div>
                          </div>
                          
                          {activeTab === tab.id && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            
            {/* Bottom padding to ensure last item is visible */}
            <div className="h-4 flex-shrink-0"></div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Only shown on desktop */}
      <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
        {/* Desktop Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your business configuration
          </p>
        </div>

        {/* Desktop Navigation */}
        <nav className="p-6 space-y-6">
          {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-${categories[category as keyof typeof categories].color}-500`}></div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {categories[category as keyof typeof categories].name}
                </h3>
              </div>
              
              <div className="space-y-2">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 group border-2 relative overflow-hidden ${
                      activeTab === tab.id
                        ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                        : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    } ${
                      clickedTab === tab.id 
                        ? "scale-95 shadow-inner bg-blue-100 dark:bg-blue-800/50" 
                        : "hover:scale-[1.02] active:scale-95"
                    }`}
                  >
                    {/* Ripple effect */}
                    {clickedTab === tab.id && (
                      <div className="absolute inset-0 bg-blue-200 dark:bg-blue-700 opacity-30 animate-ping"></div>
                    )}
                    
                    <div className="flex items-start gap-3 relative z-10">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 shadow-md"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 group-hover:shadow-md"
                      } ${clickedTab === tab.id ? "scale-110" : ""}`}>
                        <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                          {tab.icon}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm transition-colors duration-200 ${
                          activeTab === tab.id
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white"
                        }`}>
                          {tab.name}
                        </div>
                        <div className={`text-xs mt-1 line-clamp-2 transition-colors duration-200 ${
                          activeTab === tab.id
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                      
                      {activeTab === tab.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
} 