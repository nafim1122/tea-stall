
import { Product } from '../types';

export const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Premium Black Tea',
    base_price_per_kg: 800,
    old_price_per_kg: 900,
    unit: 'kg',
    img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    description: 'Premium quality black tea from Sreemangal gardens',
    category: 'Black Tea',
    inStock: true
  },
  {
    id: 2,
    name: 'Green Tea Special',
    base_price_per_kg: 1200,
    old_price_per_kg: 1350,
    unit: 'kg',
    img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop',
    description: 'Fresh green tea with natural antioxidants',
    category: 'Green Tea',
    inStock: true
  },
  {
    id: 3,
    name: 'Organic Honey',
    base_price_per_kg: 1500,
    old_price_per_kg: 1700,
    unit: 'kg',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    description: 'Pure organic honey from Sundarban forests',
    category: 'Honey',
    inStock: true
  },
  {
    id: 4,
    name: 'Tea Cups Set',
    base_price_per_kg: 250,
    old_price_per_kg: 300,
    unit: 'piece',
    img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
    description: 'Traditional ceramic tea cups (sold per piece)',
    category: 'Accessories',
    inStock: true
  },
  {
    id: 5,
    name: 'White Tea Premium',
    base_price_per_kg: 2000,
    old_price_per_kg: 2200,
    unit: 'kg',
    img: 'https://images.unsplash.com/photo-1558642891-54be180ea339?w=400&h=300&fit=crop',
    description: 'Rare white tea with delicate flavor profile',
    category: 'White Tea',
    inStock: true
  },
  {
    id: 6,
    name: 'Oolong Tea Special',
    base_price_per_kg: 1800,
    old_price_per_kg: 2000,
    unit: 'kg',
    img: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400&h=300&fit=crop',
    description: 'Semi-fermented oolong tea with complex taste',
    category: 'Oolong Tea',
    inStock: true
  },
  {
    id: 7,
    name: 'Tea Strainer',
    base_price_per_kg: 150,
    old_price_per_kg: 180,
    unit: 'piece',
    img: 'https://images.unsplash.com/photo-1589985901429-897dea6b2b1e?w=400&h=300&fit=crop',
    description: 'Stainless steel tea strainer (sold per piece)',
    category: 'Accessories',
    inStock: true
  },
  {
    id: 8,
    name: 'Herbal Tea Mix',
    base_price_per_kg: 1000,
    old_price_per_kg: 1150,
    unit: 'kg',
    img: 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=400&h=300&fit=crop',
    description: 'Blend of medicinal herbs and tea leaves',
    category: 'Herbal Tea',
    inStock: true
  }
];
