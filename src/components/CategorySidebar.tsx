import React from 'react';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:sticky top-0 left-0 h-screen lg:h-auto bg-white shadow-lg lg:shadow-none border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out",
        "w-64 lg:w-auto lg:min-w-[250px]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">Categories</h3>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Category List */}
          <div className="space-y-2">
            {/* All Products */}
            <button
              onClick={() => {
                onCategorySelect(null);
                onClose();
              }}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg transition-colors",
                selectedCategory === null
                  ? "bg-green-100 text-green-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              All Products
            </button>

            {/* Category Items */}
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onCategorySelect(category);
                  onClose();
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg transition-colors",
                  selectedCategory === category
                    ? "bg-green-100 text-green-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Price Range Filter (Future Enhancement) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-4">Price Range</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-gray-600">Under ৳500</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-gray-600">৳500 - ৳1000</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-gray-600">৳1000 - ৳2000</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-gray-600">Above ৳2000</span>
              </label>
            </div>
          </div>

          {/* Unit Filter */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-4">Unit Type</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-gray-600">Per Kg</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-gray-600">Per Piece</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategorySidebar;