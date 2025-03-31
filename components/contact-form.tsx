'use client';

import { useState } from 'react';
import { Button } from './ui/button';

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };
  
  if (isSubmitted) {
    return (
      <div className="p-8 text-center bounce-in">
        <h3 className="text-2xl font-bold mb-4">Thank You!</h3>
        <p>Your message has been sent successfully.</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="slide-up">
        <label className="block text-sm font-medium mb-2">Name</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded-md" 
          required 
        />
      </div>
      
      <div className="slide-up" style={{animationDelay: '0.1s'}}>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input 
          type="email" 
          className="w-full p-2 border rounded-md" 
          required 
        />
      </div>
      
      <div className="slide-up" style={{animationDelay: '0.2s'}}>
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea 
          className="w-full p-2 border rounded-md h-32" 
          required
        ></textarea>
      </div>
      
      <div className="fade-in">
        <Button 
          type="submit" 
          className="w-full hover-lift"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="pulse">Sending...</span>
          ) : (
            "Send Message"
          )}
        </Button>
      </div>
    </form>
  );
}