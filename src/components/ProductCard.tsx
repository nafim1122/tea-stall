
import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (quantity: number, totalPrice: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState<number>(product.unit === 'kg' ? 0.5 : 1);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const discount = product.old_price_per_kg 
    ? Math.round(((product.old_price_per_kg - product.base_price_per_kg) / product.old_price_per_kg) * 100)
    : 0;

  // Update total price when quantity changes
  useEffect(() => {
    setTotalPrice(product.base_price_per_kg * quantity);
  }, [quantity, product.base_price_per_kg]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart(quantity, totalPrice);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price).replace('BDT', '৳');
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
            -{discount}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-sm text-gray-500 ml-1">(4.8)</span>
        </div>
        
        {/* Price per unit */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(product.base_price_per_kg)}
            </span>
            <span className="text-sm text-gray-500">per {product.unit}</span>
            {product.old_price_per_kg && product.old_price_per_kg > product.base_price_per_kg && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.old_price_per_kg)}
              </span>
            )}
          </div>
          {product.category && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {product.category}
            </span>
          )}
        </div>
        
        {/* Quantity Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity ({product.unit})
          </label>
          <input
            type="number"
            min={product.unit === 'kg' ? '0.1' : '1'}
            step={product.unit === 'kg' ? '0.1' : '1'}
            value={quantity}
            onChange={handleQuantityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder={`Enter ${product.unit}`}
          />
        </div>

        {/* Total Price */}
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Price:</span>
            <span className="text-xl font-bold text-green-600">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 disabled:hover:to-emerald-600"
        >
          <ShoppingCart className="h-4 w-4" />
          {product.inStock ? (quantity > 0 ? 'Add to Cart' : 'Enter Quantity') : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
