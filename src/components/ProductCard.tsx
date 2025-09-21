
import React, { useState, useEffect, useRef } from 'react';
import { Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (quantity: number, totalPrice: number, weight?: string) => void;
}

type WeightOption = '1kg' | '0.5kg';

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // State for weight selection, quantity, and total price
  const [selectedWeight, setSelectedWeight] = useState<WeightOption>('0.5kg');
  const [quantity, setQuantity] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const priceAnnouncementRef = useRef<HTMLDivElement>(null);

  /**
   * PRICING CONFIGURATION - Using admin panel set prices
   * Properly calculates prices based on admin panel input
   */
  const getPriceConfiguration = () => {
    // Use the price set in admin panel (base_price_per_kg)
    const pricePerKg = product.base_price_per_kg;
    
    if (selectedWeight === '1kg') {
      return {
        currentPrice: pricePerKg,
        oldPrice: product.old_price_per_kg
      };
    } else {
      // For half kg: calculate as exactly half of the per kg price
      const pricePerHalfKg = product.price_per_half_kg || (pricePerKg * 0.5);
      return {
        currentPrice: pricePerHalfKg,
        oldPrice: product.old_price_per_half_kg || (product.old_price_per_kg ? product.old_price_per_kg * 0.5 : undefined)
      };
    }
  };

  const { currentPrice, oldPrice } = getPriceConfiguration();
  
  // Calculate discount percentage
  const discount = oldPrice && currentPrice && currentPrice > 0
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : 0;

  /**
   * Handle weight option selection
   * Updates price display instantly when weight changes
   */
  const handleWeightChange = (weight: WeightOption) => {
    setSelectedWeight(weight);
  };

  /**
   * Handle quantity input changes with validation
   */
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= 99) {
      setQuantity(value);
    }
  };

  /**
   * Increase quantity (max 99)
   */
  const increaseQuantity = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  /**
   * Decrease quantity (min 1)
   */
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  /**
   * Handle add to cart action
   */
  const handleAddToCart = () => {
    if (quantity > 0 && product.inStock) {
      onAddToCart(quantity, totalPrice, selectedWeight);
    }
  };

  /**
   * Format price in Bangladeshi Taka with proper symbol
   * Handles NaN and invalid values gracefully
   */
  const formatPrice = (price: number) => {
    const validPrice = isNaN(price) || price === undefined || price === null ? 0 : price;
    return `৳${validPrice.toFixed(2)}`;
  };

  /**
   * Calculate and update total price when quantity or weight changes
   * Runs whenever dependencies change to keep price in sync
   */
  useEffect(() => {
    const validCurrentPrice = currentPrice || 0;
    const validQuantity = quantity || 1;
    const newTotalPrice = validCurrentPrice * validQuantity;
    setTotalPrice(newTotalPrice);
    
    // Announce price change for screen readers (accessibility)
    if (priceAnnouncementRef.current) {
      const weightLabel = selectedWeight === '1kg' ? '1 kilogram' : 'half kilogram';
      priceAnnouncementRef.current.textContent = 
        `Price updated: ${formatPrice(newTotalPrice)} for ${validQuantity} ${weightLabel} of ${product.name}`;
    }
  }, [quantity, selectedWeight, currentPrice, product.name]);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
      {/* Product Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
            -{discount}%
          </div>
        )}
        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      {/* Product Content Section */}
      <div className="p-5">
        {/* Product Name */}
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Product Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-sm text-gray-500 ml-1">(4.8)</span>
        </div>
        
        {/* 
          WEIGHT OPTIONS SECTION
          Display weight selection buttons for products that support it
          Only shows for kg-based products with weight options enabled
        */}
        {product.hasWeightOptions && product.unit === 'kg' && (
          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Select Weight:
            </span>
            <div className="flex gap-2" role="radiogroup" aria-labelledby={`weight-label-${product.id}`}>
              {/* 1kg Option Button */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedWeight === '1kg' ? 'true' : 'false'}
                onClick={() => handleWeightChange('1kg')}
                className={`flex-1 py-2 px-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  selectedWeight === '1kg'
                    ? 'bg-green-600 border-green-600 text-white shadow-md' // Active style
                    : 'bg-white border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600' // Inactive style
                }`}
              >
                1 kg
              </button>
              
              {/* ½kg Option Button */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedWeight === '0.5kg' ? 'true' : 'false'}
                onClick={() => handleWeightChange('0.5kg')}
                className={`flex-1 py-2 px-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  selectedWeight === '0.5kg'
                    ? 'bg-green-600 border-green-600 text-white shadow-md' // Active style
                    : 'bg-white border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600' // Inactive style
                }`}
              >
                ½ kg
              </button>
            </div>
          </div>
        )}
        
        {/* 
          PRICE DISPLAY SECTION
          Shows current price per unit with currency symbol
          Updates instantly when weight option changes
        */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(currentPrice)}
            </span>
            <span className="text-sm text-gray-500">
              per {product.hasWeightOptions && product.unit === 'kg' 
                ? (selectedWeight === '1kg' ? 'kg' : '½ kg') 
                : product.unit}
            </span>
            {/* Show old price if there's a discount */}
            {oldPrice && oldPrice > currentPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>
          {/* Category Badge */}
          {product.category && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {product.category}
            </span>
          )}
        </div>
        
        {/* 
          QUANTITY SELECTION SECTION
          Includes +/- buttons and direct input for quantity
        */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity:
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
              {/* Decrease Quantity Button */}
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              {/* Quantity Input Field */}
              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 py-2 text-center border-none outline-none font-medium"
                aria-label="Quantity"
              />
              
              {/* Increase Quantity Button */}
              <button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity >= 99}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 
          TOTAL PRICE DISPLAY
          Shows calculated total with breakdown
          Updates live as quantity and weight change
        */}
        <div className="mb-4 p-3 bg-green-50 rounded-lg border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Price:</span>
            <div className="text-right">
              <span className="text-xl font-bold text-green-600">
                {formatPrice(totalPrice)}
              </span>
              <span className="block text-xs text-gray-500">
                {quantity} × {product.hasWeightOptions && product.unit === 'kg' 
                  ? (selectedWeight === '1kg' ? '1kg' : '½kg') 
                  : product.unit}
              </span>
            </div>
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 disabled:hover:to-emerald-600"
        >
          <ShoppingCart className="h-4 w-4" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
        
        {/* 
          ACCESSIBILITY: Screen reader announcements
          Hidden element that announces price changes to screen readers
        */}
        <div 
          ref={priceAnnouncementRef}
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        />
      </div>
    </div>
  );
};

export default ProductCard;
