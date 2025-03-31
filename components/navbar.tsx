import Link from 'next/link';
import { Button } from './ui/button';

export function Navbar() {
  return (
    <nav className="w-full py-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold gradient-text">
          techradar
        </Link>
        
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex space-x-4">
            {['Products', 'Categories', 'Deals', 'About'].map((item, index) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`}
                className={`hover-lift stagger-item stagger-delay-${index + 1}`}
              >
                {item}
              </Link>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" className="slide-in-right" style={{animationDelay: '0.2s'}}>
              Sign In
            </Button>
            <Button className="slide-in-right" style={{animationDelay: '0.3s'}}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}