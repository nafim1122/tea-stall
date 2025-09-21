
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, User } from 'lucide-react';
import { toast } from 'sonner';
import { Product, CartItem, Order, PaymentData } from '../types';
import { initialProducts } from '../data/products';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import HeroSection from '../components/HeroSection';
import CartModal from '../components/CartModal';
import PaymentModal from '../components/PaymentModal';
import OrderHistory from '../components/OrderHistory';
import AdminPanel from '../components/AdminPanel';
import ResponsiveGrid from '../components/ResponsiveGrid';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import ProfileModal from '../components/ProfileModal';
import ErrorBoundary from '../components/ErrorBoundary';

const Index = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Legacy authentication state for admin panel backwards compatibility
  const [isAuthenticated_legacy, setIsAuthenticated_legacy] = useState(false);

  // Temporary fix: Force clear cart on component mount to resolve stuck state
  useEffect(() => {
    console.log('Checking cart state on mount...');
    const currentCart = localStorage.getItem('cart');
    console.log('Current cart in localStorage:', currentCart);
    
    // Temporarily force clear cart to fix stuck state
    localStorage.removeItem('cart');
    setCart([]);
    console.log('Cart forcefully cleared');
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('products');
      const savedCart = localStorage.getItem('cart');
      const savedOrders = localStorage.getItem('orders');
      
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          setProducts(parsedProducts);
        }
      }
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            // Validate cart items and filter out invalid ones
            const validCartItems = parsedCart.filter(item => 
              item && 
              typeof item.productId === 'number' && 
              typeof item.quantity === 'number' && 
              item.quantity > 0 &&
              typeof item.totalPriceAtTime === 'number'
            );
            setCart(validCartItems);
            
            // If we filtered out items, update localStorage
            if (validCartItems.length !== parsedCart.length) {
              console.warn('Found invalid cart items, cleaning up cart');
              localStorage.setItem('cart', JSON.stringify(validCartItems));
            }
          } else {
            console.warn('Cart data is not an array, clearing cart');
            localStorage.removeItem('cart');
            setCart([]);
          }
        } catch (parseError) {
          console.error('Error parsing cart data, clearing cart:', parseError);
          localStorage.removeItem('cart');
          setCart([]);
        }
      }
      
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        }
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      toast.error('Error loading saved data');
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }, [orders]);

  // Security: Input sanitization
  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>]/g, '').trim();
  };

  const addToCart = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // This would normally be handled by backend API
    const quantity = product.unit === 'kg' ? 0.5 : 1;
    const unitPrice = product.base_price_per_kg;
    const totalPrice = unitPrice * quantity;

    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { 
              ...item, 
              quantity: item.quantity + quantity,
              totalPriceAtTime: item.totalPriceAtTime + totalPrice
            }
          : item
      ));
    } else {
      setCart([...cart, { 
        productId, 
        quantity,
        unit: product.unit,
        unitPriceAtTime: unitPrice,
        totalPriceAtTime: totalPrice
      }]);
    }
    
    toast.success('Product added to cart!');
  };

  const addToCartWithQuantity = (productId: number, quantity: number, totalPrice: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const unitPrice = product.base_price_per_kg;
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { 
              ...item, 
              quantity: item.quantity + quantity,
              totalPriceAtTime: item.totalPriceAtTime + totalPrice
            }
          : item
      ));
    } else {
      setCart([...cart, { 
        productId, 
        quantity,
        unit: product.unit,
        unitPriceAtTime: unitPrice,
        totalPriceAtTime: totalPrice
      }]);
    }
    
    toast.success('Product added to cart!');
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const unitPrice = product.base_price_per_kg;
    const totalPrice = unitPrice * quantity;
    
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity, totalPriceAtTime: totalPrice }
        : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
    toast.info('Product removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    toast.success('Cart cleared successfully');
  };

  // Debug function to reset cart and localStorage if stuck
  const resetCartCompletely = () => {
    setCart([]);
    localStorage.removeItem('cart');
    localStorage.removeItem('products');
    localStorage.removeItem('orders');
    window.location.reload();
  };

  const getCartTotal = () => {
    try {
      if (!Array.isArray(cart)) return 0;
      return cart.reduce((total, item) => {
        if (!item || typeof item.totalPriceAtTime !== 'number') return total;
        return total + item.totalPriceAtTime;
      }, 0);
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  };

  const getCartItemCount = () => {
    try {
      if (!Array.isArray(cart)) {
        console.warn('Cart is not an array, clearing cart state');
        setCart([]);
        return 0;
      }
      
      const count = cart.reduce((total, item) => {
        if (!item || typeof item.quantity !== 'number' || item.quantity < 0) {
          console.warn('Invalid cart item found:', item);
          return total;
        }
        return total + item.quantity;
      }, 0);
      
      return count;
    } catch (error) {
      console.error('Error calculating cart item count:', error);
      // Reset cart on error to prevent stuck state
      setCart([]);
      return 0;
    }
  };

  const handleOrderComplete = (paymentData: PaymentData) => {
    try {
      if (!Array.isArray(cart) || cart.length === 0) {
        toast.error('Cart is empty');
        return;
      }

      const orderItems = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          name: product?.name || 'Unknown Product',
          quantity: item.quantity || 0,
          unit: (item.unit as "kg" | "piece") || 'piece',
          unitPrice: item.unitPriceAtTime || 0,
          totalPrice: item.totalPriceAtTime || 0
        };
      });

      const newOrder: Order = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB'),
        items: orderItems,
        total: getCartTotal(),
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        address: paymentData.address,
        phone: paymentData.phone,
        status: 'pending'
      };

      setOrders([...orders, newOrder]);
      clearCart();
      setIsPaymentOpen(false);
      setIsCartOpen(false);
      
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const handleProductSelect = (productId: number) => {
    const element = document.getElementById(`product-${productId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredProducts = searchQuery
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  const handleAdminLogin = (credentials: { username: string; password: string }) => {
    // Security: Simple authentication (in production, use proper backend authentication)
    const sanitizedUsername = sanitizeInput(credentials.username);
    const sanitizedPassword = sanitizeInput(credentials.password);
    
    if (sanitizedUsername === 'admin' && sanitizedPassword === 'admin123') {
      setIsAuthenticated_legacy(true);
      toast.success('Admin login successful');
    } else {
      toast.error('Invalid credentials');
    }
  };

  // Auth modal handlers
  const handleLoginClick = () => {
    setIsLoginOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegisterOpen(true);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const handleAdminClick = () => {
    if (isAuthenticated && user?.role === 'admin') {
      setIsAdminOpen(true);
    } else {
      toast.error('Admin access required. Please log in as an administrator.');
      setIsLoginOpen(true);
    }
  };

  const switchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  // Product management callback functions for AdminPanel
  const handleProductAdd = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts(prev => prev.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
  };

  const handleProductDelete = (productId: number) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      // Hidden debug feature: Ctrl+Shift+R to reset cart completely
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        console.log('Manual cart reset triggered');
        resetCartCompletely();
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <img 
                src="/tea-stall-logo.svg" 
                alt="Tea Stall Logo" 
                className="h-10 w-10"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Tea Stall
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">
                Home
              </a>
              <a href="#products" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">
                Products
              </a>
              <a href="#about" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">
                About
              </a>
              {isAuthenticated && user?.role === 'admin' && (
                <button
                  onClick={handleAdminClick}
                  className="text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Admin
                </button>
              )}
              
              {/* Authentication Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{user?.name}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLoginClick}
                    className="text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                products={products}
                onProductSelect={handleProductSelect}
              />
            </div>

            {/* Cart and Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-amber-600 hover:text-amber-700 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-amber-600 transition-colors mobile-menu-container"
                title={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden px-4 pb-4">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              products={products}
              onProductSelect={handleProductSelect}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 mobile-menu-container">
            <div className="px-4 py-2 space-y-2">
              <a
                href="#home"
                className="block px-3 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#products"
                className="block px-3 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </a>
              <a
                href="#about"
                className="block px-3 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              
              {/* Mobile Auth Buttons */}
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      handleProfileClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                  >
                    My Profile ({user?.name})
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        handleAdminClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Admin Dashboard
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      handleRegisterClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Products Section */}
      <section id="products" className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Premium Tea Collection
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our finest tea selections from the gardens of Sreemangal
            </p>
          </div>

          <div className="flex gap-8">
            {/* Products Grid */}
            <div className="flex-1">
              <ResponsiveGrid cols={{ default: 1, sm: 2, md: 2, lg: 2, xl: 3 }}>
                {filteredProducts.map((product) => (
                  <div key={product.id} id={`product-${product.id}`}>
                    <ProductCard
                      product={product}
                      onAddToCart={(quantity, totalPrice) => addToCartWithQuantity(product.id, quantity, totalPrice)}
                    />
                  </div>
                ))}
              </ResponsiveGrid>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found</p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                      }}
                      className="mt-4 text-green-600 hover:text-green-700 font-medium"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            About Tea Stall
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              Welcome to Tea Stall, your one-stop destination for the finest tea straight from 
              the heart of Sreemangal, the tea capital of Bangladesh. We are passionate about 
              delivering premium-quality tea leaves, blends, and accessories directly from the 
              gardens to your doorstep.
            </p>
            <p className="mb-6">
              Our journey started with a deep love for nature, tradition, and the aroma of 
              freshly brewed tea. Whether you're a casual sipper or a true tea connoisseur, 
              we have something special for everyone. We work closely with local tea growers 
              to ensure every product meets the highest standards of freshness and authenticity.
            </p>
            <div className="bg-white/70 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-amber-800 mb-4">Contact Information</h3>
              <div className="space-y-2 text-left max-w-md mx-auto">
                <p><strong>Business Name:</strong> Tea Stall</p>
                <p><strong>Phone Numbers:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>📞 <a href="tel:+8801742236623" className="text-amber-600 hover:text-amber-700">+880 1742-236623</a></li>
                  <li>📞 <a href="tel:+8801731085367" className="text-amber-600 hover:text-amber-700">+880 1731-085367</a></li>
                </ul>
                <p><strong>Address:</strong> Sreemangal - 3210, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order History */}
      <OrderHistory orders={orders} />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Tea Stall</h3>
              <p className="text-gray-300">
                Your trusted source for premium tea from Sreemangal, Bangladesh.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="#home" className="block text-gray-300 hover:text-white transition-colors">Home</a>
                <a href="#products" className="block text-gray-300 hover:text-white transition-colors">Products</a>
                <a href="#about" className="block text-gray-300 hover:text-white transition-colors">About</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-300">
                <p>Phone: <a href="tel:+8801742236623" className="text-amber-400 hover:text-amber-300">+880 1742-236623</a></p>
                <p>Phone: <a href="tel:+8801731085367" className="text-amber-400 hover:text-amber-300">+880 1731-085367</a></p>
                <p>Address: Sreemangal - 3210, Bangladesh</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Tea Stall. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ErrorBoundary fallback={
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-2">Cart Error</h3>
            <p className="text-gray-600 mb-4">There was an issue with the cart. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Refresh
            </button>
          </div>
        </div>
      }>
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          products={products}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={() => {
            setIsCartOpen(false);
            setIsPaymentOpen(true);
          }}
          total={getCartTotal()}
          onClearCart={resetCartCompletely}
        />
      </ErrorBoundary>

      <ErrorBoundary fallback={
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-2">Payment Error</h3>
            <p className="text-gray-600 mb-4">There was an issue with the payment system. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Refresh
            </button>
          </div>
        </div>
      }>
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => {
            setIsPaymentOpen(false);
          }}
          total={getCartTotal()}
          onOrderComplete={handleOrderComplete}
          onLoginRequired={() => {
            setIsPaymentOpen(false);
            setIsLoginOpen(true);
          }}
          onRegisterRequired={() => {
            setIsPaymentOpen(false);
            setIsRegisterOpen(true);
          }}
        />
      </ErrorBoundary>

      {/* Authentication Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={switchToRegister}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        onLogin={handleAdminLogin}
        isAuthenticated={isAuthenticated && user?.role === 'admin' ? true : isAuthenticated_legacy}
        onProductAdd={handleProductAdd}
        onProductUpdate={handleProductUpdate}
        onProductDelete={handleProductDelete}
      />
    </div>
  );
};

export default Index;
