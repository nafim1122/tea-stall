
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Plus, Minus, Star, Leaf, Shield, Truck } from 'lucide-react';
import { toast } from "sonner";
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CartModal from '../components/CartModal';
import PaymentModal from '../components/PaymentModal';
import AdminPanel from '../components/AdminPanel';
import OrderHistory from '../components/OrderHistory';
import HeroSection from '../components/HeroSection';
import { Product, CartItem, Order } from '../types';
import { initialProducts } from '../data/products';

const Index = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('gb_products');
    const savedOrders = localStorage.getItem('gb_orders');
    const savedCart = localStorage.getItem('gb_cart');

    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        setProducts(parsedProducts);
        setFilteredProducts(parsedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }

    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    }

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('gb_products', JSON.stringify(products));
    setFilteredProducts(products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [products, searchQuery]);

  useEffect(() => {
    localStorage.setItem('gb_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('gb_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart functions
  const addToCart = (productId: number, quantity: number = 1) => {
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { productId, quantity }]);
    }
    toast.success("Product added to cart!");
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
    toast.success("Product removed from cart");
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Order functions
  const createOrder = (orderData: Omit<Order, 'id' | 'date' | 'items' | 'total'>) => {
    const order: Order = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      items: cart.map(item => {
        const product = products.find(p => p.id === item.productId)!;
        return {
          name: product.name,
          quantity: item.quantity,
          price: product.price
        };
      }),
      total: getCartTotal(),
      ...orderData
    };
    
    setOrders(prev => [...prev, order]);
    clearCart();
    setIsCartOpen(false);
    setIsPaymentOpen(false);
    toast.success("Order placed successfully!");
    
    return order;
  };

  // Product management (Admin)
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts(prev => [...prev, newProduct]);
    toast.success("Product added successfully!");
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product =>
      product.id === id ? { ...product, ...updates } : product
    ));
    toast.success("Product updated successfully!");
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    toast.success("Product deleted successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center gap-2">
                <Leaf className="h-8 w-8 text-green-600" />
                <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Ghorer Bazar
                </span>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                products={products}
                onProductSelect={addToCart}
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#home" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Home
              </a>
              <a href="#products" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Products
              </a>
              <a href="#about" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                About
              </a>
              <button
                onClick={() => setIsAdminOpen(true)}
                className="text-red-600 hover:text-red-700 font-semibold transition-colors flex items-center gap-1"
              >
                <User className="h-4 w-4" />
                Admin
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {getCartCount()}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-green-600 hover:text-green-700 transition-colors"
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
              onProductSelect={addToCart}
            />
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-green-100 bg-white">
              <div className="px-4 py-4 space-y-2">
                <a href="#home" className="block py-2 text-gray-700 hover:text-green-600 font-medium transition-colors">
                  Home
                </a>
                <a href="#products" className="block py-2 text-gray-700 hover:text-green-600 font-medium transition-colors">
                  Products
                </a>
                <a href="#about" className="block py-2 text-gray-700 hover:text-green-600 font-medium transition-colors">
                  About
                </a>
                <button
                  onClick={() => {
                    setIsAdminOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block py-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
                >
                  Admin Panel
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Features */}
      <section className="py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">100% Organic</h3>
              <p className="text-gray-600">All our products are certified organic and natural</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Assured</h3>
              <p className="text-gray-600">Rigorous quality checks for every product</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and safe delivery across Bangladesh</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our premium collection of organic and natural products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product.id)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            About Ghorer Bazar
          </h2>
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Ghorer Bazar is Bangladesh's leading e-commerce platform committed to delivering safe, 
              healthy, and organic food products directly to your doorstep. We specialize in premium 
              quality items including pure mustard oil, organic ghee, natural honey, fresh dates, 
              chia seeds, and a carefully curated selection of nuts.
            </p>
            <p>
              Each product is meticulously sourced and crafted to ensure maximum health benefits, 
              meeting the highest standards of purity and freshness. Our commitment to quality means 
              every item undergoes rigorous testing before reaching your family.
            </p>
            <p>
              With a focus on convenience and reliability, Ghorer Bazar operates primarily online, 
              bringing the goodness of nature straight to your home with fast, secure delivery 
              across Bangladesh.
            </p>
          </div>
        </div>
      </section>

      {/* Order History */}
      <OrderHistory orders={orders} />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-8 w-8 text-green-400" />
                <span className="font-bold text-2xl">Ghorer Bazar</span>
              </div>
              <p className="text-gray-300 mb-4">
                Your trusted source for organic and natural products in Bangladesh.
              </p>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <strong>Call/WhatsApp:</strong> <a href="tel:+8801321208940" className="text-green-400 hover:text-green-300">+8801321208940</a>
                </p>
                <p className="text-gray-300">
                  <strong>Hotline:</strong> <a href="tel:09642-922922" className="text-green-400 hover:text-green-300">09642-922922</a>
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-300 hover:text-green-400 transition-colors">Home</a></li>
                <li><a href="#products" className="text-gray-300 hover:text-green-400 transition-colors">Products</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-green-400 transition-colors">About Us</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-green-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors">Return Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors">Customer Care</a></li>
                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors">Shipping Info</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 Ghorer Bazar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={getCartTotal()}
        onOrderComplete={createOrder}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        onAddProduct={addProduct}
        onUpdateProduct={updateProduct}
        onDeleteProduct={deleteProduct}
      />
    </div>
  );
};

export default Index;
