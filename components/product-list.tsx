import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className={`
            stagger-item 
            stagger-delay-${(index % 5) + 1} 
            interactive-card 
            bg-card p-6 rounded-lg
          `}
        >
          <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
          <p className="text-muted-foreground mb-4">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="font-bold">${product.price}</span>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded hover-lift hover-glow">
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}