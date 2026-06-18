export interface DBProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  image_url?: string;
  discount_percentage?: number;
  created_at: string;
}

export interface DBCategoryOffer {
  category: string;
  discount_percentage: number;
  is_active: boolean;
}

export function applyDiscountsToProducts(products: DBProduct[], categoryOffers: DBCategoryOffer[] | null) {
  if (!products) return [];
  
  return products.map(product => {
    const categoryOffer = categoryOffers?.find(o => o.category === product.category);
    const categoryDiscount = categoryOffer ? categoryOffer.discount_percentage : 0;
    const effectiveDiscount = Math.max(product.discount_percentage || 0, categoryDiscount || 0);
    const discountedPrice = effectiveDiscount > 0 
      ? Math.round(product.price * (1 - effectiveDiscount / 100)) 
      : product.price;
    
    return {
      ...product,
      original_price: product.price,
      price: discountedPrice,
      discount_percentage: effectiveDiscount
    };
  });
}

export function applyDiscountToSingleProduct(product: DBProduct, categoryOffers: DBCategoryOffer[] | null) {
  if (!product) return null;
  const categoryOffer = categoryOffers?.find(o => o.category === product.category);
  const categoryDiscount = categoryOffer ? categoryOffer.discount_percentage : 0;
  const effectiveDiscount = Math.max(product.discount_percentage || 0, categoryDiscount || 0);
  const discountedPrice = effectiveDiscount > 0 
    ? Math.round(product.price * (1 - effectiveDiscount / 100)) 
    : product.price;
  
  return {
    ...product,
    original_price: product.price,
    price: discountedPrice,
    discount_percentage: effectiveDiscount
  };
}
