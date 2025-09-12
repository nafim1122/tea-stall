import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

interface PriceCalculatorProps {
  basePrice: number;
  unit: 'kg' | 'piece';
  onQuantityChange: (quantity: number, totalPrice: number) => void;
  initialQuantity?: number;
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  basePrice,
  unit,
  onQuantityChange,
  initialQuantity
}) => {
  const [quantity, setQuantity] = useState<number>(
    initialQuantity || (unit === 'kg' ? 0.5 : 1)
  );
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const total = basePrice * quantity;
    setTotalPrice(total);
    onQuantityChange(quantity, total);
  }, [quantity, basePrice, onQuantityChange]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setQuantity(value);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price).replace('BDT', '৳');
  };

  const incrementQuantity = () => {
    const increment = unit === 'kg' ? 0.1 : 1;
    setQuantity(prev => Math.round((prev + increment) * 10) / 10);
  };

  const decrementQuantity = () => {
    const decrement = unit === 'kg' ? 0.1 : 1;
    const newQuantity = Math.max(0, quantity - decrement);
    setQuantity(Math.round(newQuantity * 10) / 10);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4 text-green-600" />
        <span className="font-medium text-green-800">Price Calculator</span>
      </div>
      
      {/* Base Price Display */}
      <div className="mb-3">
        <span className="text-sm text-gray-600">Base Price: </span>
        <span className="font-semibold text-green-600">
          {formatPrice(basePrice)} per {unit}
        </span>
      </div>

      {/* Quantity Input with Controls */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity ({unit})
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decrementQuantity}
            className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600 transition-colors"
            disabled={quantity <= (unit === 'kg' ? 0.1 : 1)}
          >
            -
          </button>
          <input
            type="number"
            min={unit === 'kg' ? '0.1' : '1'}
            step={unit === 'kg' ? '0.1' : '1'}
            value={quantity}
            onChange={handleQuantityChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
            placeholder={`Enter ${unit}`}
          />
          <button
            type="button"
            onClick={incrementQuantity}
            className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Calculation Display */}
      <div className="bg-white rounded-lg p-3 border border-green-100">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
          <span>Calculation:</span>
          <span>{quantity} {unit} × {formatPrice(basePrice)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-800">Total Price:</span>
          <span className="text-xl font-bold text-green-600">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {/* Quick Quantity Buttons for kg products */}
      {unit === 'kg' && (
        <div className="mt-3">
          <span className="text-xs text-gray-500 mb-2 block">Quick Select:</span>
          <div className="flex gap-2">
            {[0.25, 0.5, 1, 2].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setQuantity(qty)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  quantity === qty
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {qty} kg
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;