"use client";

import React, { useState, useEffect, useRef } from 'react';
import ChatBot from '../../components/ChatBot';

export default function DashboardPage() {
  // Helper function to format price in rupees
  const formatRupees = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Add zoom state for the radar visualization
  const [zoomLevel, setZoomLevel] = useState(25);
  // State for chatbot visibility
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Function to handle zoom changes
  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
  };

  // Safely render the dashboard without any map dependencies
  return (
    <div className="p-6 relative">
      <h1 className="text-3xl font-bold mb-8 slide-in-right">Dashboard</h1>
      
      {/* Add Help button that opens the chatbot */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Help
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="scale-in bg-card p-4 rounded-lg subtle-shadow">
          <h3 className="text-muted-foreground">Total Technologies</h3>
          <p className="text-3xl font-bold">124</p>
        </div>
        
        <div className="scale-in bg-card p-4 rounded-lg subtle-shadow" style={{animationDelay: '0.1s'}}>
          <h3 className="text-muted-foreground">New Entries</h3>
          <p className="text-3xl font-bold">18</p>
        </div>
        
        <div className="scale-in bg-card p-4 rounded-lg subtle-shadow" style={{animationDelay: '0.2s'}}>
          <h3 className="text-muted-foreground">Categories</h3>
          <p className="text-3xl font-bold">6</p>
        </div>
        
        <div className="scale-in bg-card p-4 rounded-lg subtle-shadow" style={{animationDelay: '0.3s'}}>
          <h3 className="text-muted-foreground">Team Members</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
        
        <div className="scale-in bg-card p-4 rounded-lg subtle-shadow" style={{animationDelay: '0.4s'}}>
          <h3 className="text-muted-foreground">Average Price</h3>
          <p className="text-3xl font-bold">{formatRupees(42500)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="slide-up bg-card p-6 rounded-lg subtle-shadow">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="stagger-item stagger-delay-1 p-3 border-b">
              <p>New technology added: <span className="font-medium">React Server Components</span></p>
              <p className="text-sm text-muted-foreground">2 hours ago</p>
            </div>
            <div className="stagger-item stagger-delay-2 p-3 border-b">
              <p>Category updated: <span className="font-medium">Frontend Frameworks</span></p>
              <p className="text-sm text-muted-foreground">Yesterday</p>
            </div>
            <div className="stagger-item stagger-delay-3 p-3">
              <p>Technology moved: <span className="font-medium">GraphQL</span> to Adopt</p>
              <p className="text-sm text-muted-foreground">3 days ago</p>
            </div>
          </div>
        </div>
        
        <div className="slide-up bg-card p-6 rounded-lg subtle-shadow" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-semibold mb-4">Price Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border-b stagger-item stagger-delay-1">
              <div>
                <p className="font-medium">Smartphones</p>
                <p className="text-sm text-muted-foreground">32 products</p>
              </div>
              <p className="text-lg font-bold">{formatRupees(35000)}</p>
            </div>
            <div className="flex justify-between items-center p-3 border-b stagger-item stagger-delay-2">
              <div>
                <p className="font-medium">Laptops</p>
                <p className="text-sm text-muted-foreground">18 products</p>
              </div>
              <p className="text-lg font-bold">{formatRupees(65000)}</p>
            </div>
            <div className="flex justify-between items-center p-3 stagger-item stagger-delay-3">
              <div>
                <p className="font-medium">Accessories</p>
                <p className="text-sm text-muted-foreground">74 products</p>
              </div>
              <p className="text-lg font-bold">{formatRupees(2500)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Radar Overview</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Zoom: {zoomLevel}x</span>
            <div className="flex gap-2">
              <button 
                onClick={() => handleZoomChange(Math.max(5, zoomLevel - 5))}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                disabled={zoomLevel <= 5}
              >
                -
              </button>
              <button 
                onClick={() => handleZoomChange(Math.min(40, zoomLevel + 5))}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                disabled={zoomLevel >= 40}
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg subtle-shadow overflow-hidden">
          <div 
            className="h-96 flex items-center justify-center transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `scale(${zoomLevel / 10})`,
              transformOrigin: 'center center'
            }}
          >
            <div className="relative w-full h-full max-w-3xl mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Radar visualization at {zoomLevel}x zoom</p>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[80%] h-[80%] rounded-full border-2 border-dashed border-blue-200 opacity-30"></div>
                <div className="absolute w-[60%] h-[60%] rounded-full border-2 border-dashed border-blue-300 opacity-40"></div>
                <div className="absolute w-[40%] h-[40%] rounded-full border-2 border-dashed border-blue-400 opacity-50"></div>
                <div className="absolute w-[20%] h-[20%] rounded-full border-2 border-dashed border-blue-500 opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Standalone chatbot button that's always visible */}
      <div 
        className="fixed bottom-6 right-6 z-[9999]" 
        style={{ pointerEvents: 'auto' }}
      >
        <button 
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center"
          style={{ 
            width: '64px', 
            height: '64px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
          }}
        >
          {isChatbotOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Separate chatbot container */}
      {/* Chatbot component - Updated for better visibility */}
      {isChatbotOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-10 z-[9998]">
          <div className="absolute bottom-24 right-6">
            <ChatBot onClose={() => setIsChatbotOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}