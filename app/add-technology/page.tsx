'use client';

import React from 'react';

export default function AddTechnologyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 slide-in-right">Add New Technology</h1>
      
      <form className="bg-card p-6 rounded-lg subtle-shadow">
        <div className="scale-in mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="name">
            Technology Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full p-2 border rounded-md bg-background"
            placeholder="e.g. GraphQL"
          />
        </div>
        
        <div className="scale-in mb-6" style={{animationDelay: '0.1s'}}>
          <label className="block text-sm font-medium mb-2" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className="w-full p-2 border rounded-md bg-background"
          >
            <option value="">Select a category</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="devops">DevOps</option>
            <option value="data">Data</option>
          </select>
        </div>
        
        <div className="scale-in mb-6" style={{animationDelay: '0.2s'}}>
          <label className="block text-sm font-medium mb-2" htmlFor="status">
            Status
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center">
              <input type="radio" id="assess" name="status" value="assess" className="mr-2" />
              <label htmlFor="assess">Assess</label>
            </div>
            <div className="flex items-center">
              <input type="radio" id="trial" name="status" value="trial" className="mr-2" />
              <label htmlFor="trial">Trial</label>
            </div>
            <div className="flex items-center">
              <input type="radio" id="adopt" name="status" value="adopt" className="mr-2" />
              <label htmlFor="adopt">Adopt</label>
            </div>
            <div className="flex items-center">
              <input type="radio" id="hold" name="status" value="hold" className="mr-2" />
              <label htmlFor="hold">Hold</label>
            </div>
          </div>
        </div>
        
        <div className="scale-in mb-6" style={{animationDelay: '0.3s'}}>
          <label className="block text-sm font-medium mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full p-2 border rounded-md bg-background"
            placeholder="Describe the technology and its benefits..."
          ></textarea>
        </div>
        
        <div className="fade-in mt-8 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border rounded-md hover-lift"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-lift hover-glow"
          >
            Add Technology
          </button>
        </div>
      </form>
    </div>
  );
}