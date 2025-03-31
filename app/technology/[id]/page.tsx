'use client';

import React, { useEffect, useState } from 'react';

export default function TechnologyDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="pulse w-16 h-16 rounded-full bg-primary/20"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="slide-in-right mb-6">
        <button className="text-primary hover:underline">&larr; Back to list</button>
      </div>
      
      <div className="scale-in">
        <h1 className="text-3xl font-bold mb-2">React Server Components</h1>
        <div className="flex items-center mb-6">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Frontend</span>
          <span className="ml-3 text-muted-foreground">Added on May 15, 2023</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="slide-up bg-card p-6 rounded-lg subtle-shadow">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="mb-4">
              React Server Components allow developers to build applications that span the server and client, combining the rich interactivity of client-side apps with the improved performance of traditional server rendering.
            </p>
            <p>
              This technology enables rendering React components on the server and streaming them to the client, reducing the JavaScript bundle size and improving performance.
            </p>
          </div>
        </div>
        
        <div className="fade-in">
          <div className="bg-card p-6 rounded-lg subtle-shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-chart-2 mr-2"></div>
              <span>Trial</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Currently being evaluated in selected projects
            </p>
          </div>
          
          <div className="interactive-card bg-card p-6 rounded-lg subtle-shadow">
            <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Adoption</p>
                <div className="w-full bg-secondary h-2 rounded-full mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <div className="w-full bg-secondary h-2 rounded-full mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maturity</p>
                <div className="w-full bg-secondary h-2 rounded-full mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="slide-up bg-card p-6 rounded-lg subtle-shadow">
        <h2 className="text-xl font-semibold mb-4">Related Technologies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="hover-lift p-4 border rounded-lg">Next.js</div>
          <div className="hover-lift p-4 border rounded-lg">Remix</div>
          <div className="hover-lift p-4 border rounded-lg">Astro</div>
        </div>
      </div>
    </div>
  );
}