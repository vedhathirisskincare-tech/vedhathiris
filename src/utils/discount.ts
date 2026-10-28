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
  ingredients?: string[];
  sizes?: any;
}

export interface DBCategoryOffer {
  category: string;
  discount_percentage: number;
  is_active: boolean;
}

const SOAP_COLLECTIONS = ["Luxury Collection", "Floral Collection", "Herbal Collection", "Super Luxury Collection"];

export function applyDiscountsToProducts(products: DBProduct[], categoryOffers: DBCategoryOffer[] | null) {
  if (!products) return [];
  
  return products.map(product => {
    const isSoap = SOAP_COLLECTIONS.includes(product.category) || product.category === "Soap";
    const categoryName = isSoap ? "Soap" : product.category;
    const categoryOffer = categoryOffers?.find(o => o.category === categoryName);
    const categoryDiscount = categoryOffer ? categoryOffer.discount_percentage : 0;
    const effectiveDiscount = Math.max(product.discount_percentage || 0, categoryDiscount || 0);
    const discountedPrice = effectiveDiscount > 0 
      ? Math.round(product.price * (1 - effectiveDiscount / 100)) 
      : product.price;

    let discountedSizes = product.sizes;
    if (Array.isArray(product.sizes) && effectiveDiscount > 0) {
      discountedSizes = product.sizes.map((s: any) => ({
        ...s,
        original_price: s.price,
        price: Math.round(s.price * (1 - effectiveDiscount / 100)),
      }));
    }
    
    return {
      ...product,
      original_price: product.price,
      price: discountedPrice,
      discount_percentage: effectiveDiscount,
      sizes: discountedSizes,
    };
  });
}

export function applyDiscountToSingleProduct(product: DBProduct, categoryOffers: DBCategoryOffer[] | null) {
  if (!product) return null;
  const isSoap = SOAP_COLLECTIONS.includes(product.category) || product.category === "Soap";
  const categoryName = isSoap ? "Soap" : product.category;
  const categoryOffer = categoryOffers?.find(o => o.category === categoryName);
  const categoryDiscount = categoryOffer ? categoryOffer.discount_percentage : 0;
  const effectiveDiscount = Math.max(product.discount_percentage || 0, categoryDiscount || 0);
  const discountedPrice = effectiveDiscount > 0 
    ? Math.round(product.price * (1 - effectiveDiscount / 100)) 
    : product.price;

  let discountedSizes = product.sizes;
  if (Array.isArray(product.sizes) && effectiveDiscount > 0) {
    discountedSizes = product.sizes.map((s: any) => ({
      ...s,
      original_price: s.price,
      price: Math.round(s.price * (1 - effectiveDiscount / 100)),
    }));
  }
  
  return {
    ...product,
    original_price: product.price,
    price: discountedPrice,
    discount_percentage: effectiveDiscount,
    sizes: discountedSizes,
  };
}
