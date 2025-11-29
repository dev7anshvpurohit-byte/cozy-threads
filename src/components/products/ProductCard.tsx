import { Link } from 'react-router-dom';
import { Product } from '@/types/database';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <p className="font-semibold text-foreground">{formatPrice(product.price)}</p>
        <div className="flex gap-1">
          {product.sizes.map(size => (
            <span key={size} className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground">
              {size}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
