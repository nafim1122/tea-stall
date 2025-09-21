
import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { CartItem, Product } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
  total: number;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  total
}) => {
  if (!isOpen) return null;

  const cartWithProducts = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  }));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price).replace('BDT', '৳');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
            title="Close cart"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartWithProducts.map(({ productId, quantity, product, unitPriceAtTime, totalPriceAtTime, unit }) => (
                <div key={productId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-green-600 font-semibold mb-1">
                        {formatPrice(unitPriceAtTime)} per {unit}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {quantity} {unit} × {formatPrice(unitPriceAtTime)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(productId, quantity - (unit === 'kg' ? 0.1 : 1))}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label={`Decrease ${product.name} quantity`}
                            title={`Decrease ${product.name} quantity`}
                          >
                            <Minus className="h-4 w-4 text-gray-600" />
                          </button>
                          <span className="font-semibold px-3 py-1 bg-white rounded-lg min-w-[3rem] text-center">
                            {quantity} {unit}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(productId, quantity + (unit === 'kg' ? 0.1 : 1))}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label={`Increase ${product.name} quantity`}
                            title={`Increase ${product.name} quantity`}
                          >
                            <Plus className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => onRemoveItem(productId)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          aria-label={`Remove ${product.name} from cart`}
                          title={`Remove ${product.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="text-right mt-2">
                        <span className="text-lg font-bold text-gray-800">
                          {formatPrice(totalPriceAtTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">{formatPrice(total)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
