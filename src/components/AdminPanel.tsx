
import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Package, Users, TrendingUp, Settings } from 'lucide-react';
import { Product, Order } from '../types';
import { toast } from "sonner";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onLogin: (credentials: { username: string; password: string }) => void;
  isAuthenticated: boolean;
  onProductAdd?: (product: Product) => void;
  onProductUpdate?: (product: Product) => void;
  onProductDelete?: (productId: number) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  onLogin,
  isAuthenticated,
  onProductAdd,
  onProductUpdate,
  onProductDelete
}) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    base_price_per_kg: 0,
    old_price_per_kg: 0,
    unit: 'kg' as 'kg' | 'piece',
    img: '',
    description: '',
    inStock: true
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editImagePreview, setEditImagePreview] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(credentials);
  };

  // Image upload handler for new products
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setNewProduct(prev => ({ ...prev, img: base64String }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Image upload handler for editing products
  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (editingProduct) {
        setEditingProduct(prev => prev ? { ...prev, img: base64String } : null);
        setEditImagePreview(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.base_price_per_kg || !newProduct.img) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const productToAdd: Product = {
      id: Date.now(),
      name: newProduct.name,
      base_price_per_kg: newProduct.base_price_per_kg,
      old_price_per_kg: newProduct.old_price_per_kg,
      unit: newProduct.unit,
      img: newProduct.img,
      description: newProduct.description,
      inStock: newProduct.inStock,
      hasWeightOptions: newProduct.unit === 'kg' // Automatically set weight options for kg-based products
    };

    // Use callback to update parent state - this will trigger localStorage save in Index.tsx
    if (onProductAdd) {
      onProductAdd(productToAdd);
    } else {
      // Fallback: Update localStorage directly only if callback is not available
      const currentProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const updatedProducts = [...currentProducts, productToAdd];
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    }
    
    // Reset form
    setNewProduct({
      name: '',
      base_price_per_kg: 0,
      old_price_per_kg: 0,
      unit: 'kg',
      img: '',
      description: '',
      inStock: true
    });
    setImagePreview('');
    
    toast.success('Product added successfully!');
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    // Use callback to update parent state - this will trigger localStorage save in Index.tsx
    if (onProductUpdate) {
      onProductUpdate(editingProduct);
    } else {
      // Fallback: Update localStorage directly only if callback is not available
      const currentProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const updatedProducts = currentProducts.map((p: Product) => 
        p.id === editingProduct.id ? editingProduct : p
      );
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    }
    
    setEditingProduct(null);
    setEditImagePreview('');
    toast.success('Product updated successfully!');
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Use callback to update parent state - this will trigger localStorage save in Index.tsx
      if (onProductDelete) {
        onProductDelete(id);
      } else {
        // Fallback: Update localStorage directly only if callback is not available
        const currentProducts = JSON.parse(localStorage.getItem('products') || '[]');
        const updatedProducts = currentProducts.filter((p: Product) => p.id !== id);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
      }
      
      toast.success('Product deleted successfully!');
    }
  };

  const resetAndClose = () => {
    setCredentials({ username: '', password: '' });
    setActiveTab('dashboard');
    setEditingProduct(null);
    setImagePreview('');
    setEditImagePreview('');
    onClose();
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Close admin panel"
            aria-label="Close admin panel"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-8">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-center mb-6">Admin Login</h3>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex h-[calc(90vh-80px)]">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'dashboard' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="h-5 w-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'products' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  Products ({products.length})
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'orders' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  Orders ({orders.length})
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800">Dashboard</h3>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-600">৳{totalRevenue}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Orders</p>
                          <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <Package className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Products</p>
                          <p className="text-2xl font-bold text-purple-600">{products.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h4>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          No orders yet
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {orders.slice(-5).reverse().map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm">#{order.id}</td>
                                  <td className="px-4 py-3 text-sm">{order.date}</td>
                                  <td className="px-4 py-3 text-sm">{order.phone || 'N/A'}</td>
                                  <td className="px-4 py-3 text-sm font-semibold text-green-600">৳{order.total}</td>
                                  <td className="px-4 py-3 text-sm">{order.paymentMethod}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">Products Management</h3>
                  </div>

                  {/* Add Product Form */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Add New Product</h4>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      {/* First Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                          type="text"
                          placeholder="Product Name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="number"
                          placeholder="Base Price per Kg/Piece"
                          value={newProduct.base_price_per_kg || ''}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, base_price_per_kg: Number(e.target.value) }))}
                          required
                          min="1"
                          step="0.01"
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="number"
                          placeholder="Old Price (Optional)"
                          value={newProduct.old_price_per_kg || ''}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, old_price_per_kg: Number(e.target.value) }))}
                          min="1"
                          step="0.01"
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <select
                          value={newProduct.unit}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value as 'kg' | 'piece' }))}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="Select pricing unit"
                          aria-label="Select pricing unit"
                        >
                          <option value="kg">Per Kg</option>
                          <option value="piece">Per Piece</option>
                        </select>
                      </div>

                      {/* Second Row - Image Upload and Description */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Image Upload Section */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Product Image</label>
                          <div className="flex flex-col items-center space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              required
                              className="hidden"
                              id="new-product-image"
                            />
                            <label
                              htmlFor="new-product-image"
                              className="cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition-colors w-full text-center"
                            >
                              {imagePreview ? (
                                <div className="relative">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-24 h-24 object-cover rounded-lg mx-auto mb-2"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setImagePreview('');
                                      setNewProduct(prev => ({ ...prev, img: '' }));
                                      // Reset the file input
                                      const fileInput = document.getElementById('new-product-image') as HTMLInputElement;
                                      if (fileInput) fileInput.value = '';
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                    title="Remove image"
                                  >
                                    ×
                                  </button>
                                  <p className="text-sm text-green-600">Click to change image</p>
                                </div>
                              ) : (
                                <div className="text-gray-500">
                                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <p className="text-sm">Click to upload image</p>
                                  <p className="text-xs text-gray-400">PNG, JPG, WebP up to 5MB</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="lg:col-span-2 space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            placeholder="Product description..."
                            value={newProduct.description}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Product
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Image</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Base Price</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <img src={product.img} alt={product.name} className="w-12 h-12 object-cover rounded" />
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                              <td className="px-4 py-3 text-sm text-green-600 font-semibold">৳{product.base_price_per_kg}</td>
                              <td className="px-4 py-3 text-sm">{product.unit}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setEditImagePreview('');
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit product"
                                    aria-label="Edit product"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete product"
                                    aria-label="Delete product"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800">Orders Management</h3>
                  
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {orders.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No orders yet
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Address</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {orders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-mono">#{order.id}</td>
                                <td className="px-4 py-3 text-sm">{order.date}</td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="space-y-1">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="text-xs">
                                        {item.name} × {item.quantity}
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-green-600">৳{order.total}</td>
                                <td className="px-4 py-3 text-sm">
                                  <div>
                                    <div className="font-medium">{order.paymentMethod}</div>
                                    {order.transactionId && (
                                      <div className="text-xs text-gray-500">{order.transactionId}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">{order.phone || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm max-w-xs truncate">{order.address || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Edit Product</h3>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setEditImagePreview('');
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Close edit dialog"
                  aria-label="Close edit dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateProduct} className="p-4 space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Base Price per Kg/Piece"
                  value={editingProduct.base_price_per_kg}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, base_price_per_kg: Number(e.target.value) } : null)}
                  required
                  min="1"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Old Price (Optional)"
                  value={editingProduct.old_price_per_kg || ''}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, old_price_per_kg: Number(e.target.value) } : null)}
                  min="1"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={editingProduct.unit}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, unit: e.target.value as 'kg' | 'piece' } : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Select pricing unit"
                  aria-label="Select pricing unit"
                >
                  <option value="kg">Per Kg</option>
                  <option value="piece">Per Piece</option>
                </select>
                
                {/* Image Upload Section for Edit */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Product Image</label>
                  <div className="flex flex-col items-center space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      className="hidden"
                      id="edit-product-image"
                    />
                    <label
                      htmlFor="edit-product-image"
                      className="cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition-colors w-full text-center"
                    >
                      {editImagePreview || editingProduct.img ? (
                        <div className="relative">
                          <img
                            src={editImagePreview || editingProduct.img}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg mx-auto mb-2"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditImagePreview('');
                              setEditingProduct(prev => prev ? { ...prev, img: '' } : null);
                              // Reset the file input
                              const fileInput = document.getElementById('edit-product-image') as HTMLInputElement;
                              if (fileInput) fileInput.value = '';
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            ×
                          </button>
                          <p className="text-sm text-green-600">Click to change image</p>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm">Click to upload new image</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WebP up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <textarea
                  placeholder="Description"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock !== false}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, inStock: e.target.checked } : null)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">In Stock</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update Product
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setEditImagePreview('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
