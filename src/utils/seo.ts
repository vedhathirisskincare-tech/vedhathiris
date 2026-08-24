import { SITE_URL, getCanonicalUrl } from './site';

export const CHENNAI_KEYWORDS = {
  soap: [
    'natural soap in Chennai',
    'handmade soap in Chennai',
    'herbal soap in Chennai',
    'organic soap Chennai',
    'cold process soap Chennai',
    'bath and body Chennai',
  ],
  skincare: [
    'natural skincare in Chennai',
    'natural skincare products in Chennai',
    'herbal skincare in Chennai',
    'organic personal care Chennai',
    'chemical free skincare Chennai',
    'botanical skincare Tamil Nadu',
  ],
  oil: [
    'natural hair oil in Chennai',
    'herbal hair oil in Chennai',
    'natural hair care in Chennai',
    'ayurvedic hair oil Chennai',
    'cold pressed hair oil Chennai',
  ],
  shampoo: [
    'natural shampoo in Chennai',
    'herbal shampoo in Chennai',
    'natural hair shampoo in Chennai',
    'sulfate free shampoo Chennai',
    'organic shampoo bar Chennai',
  ],
  all: [
    'natural soap in Chennai',
    'handmade soap in Chennai',
    'herbal soap in Chennai',
    'natural skincare in Chennai',
    'natural skincare products in Chennai',
    'herbal skincare in Chennai',
    'natural hair oil in Chennai',
    'herbal hair oil in Chennai',
    'natural hair care in Chennai',
    'natural shampoo in Chennai',
    'herbal shampoo in Chennai',
    'natural hair shampoo in Chennai',
  ],
};

export function getCategoryKeywords(category?: string | null): string[] {
  if (!category) return CHENNAI_KEYWORDS.all;
  const lower = category.toLowerCase();
  if (lower.includes('soap')) {
    return [...CHENNAI_KEYWORDS.soap, ...CHENNAI_KEYWORDS.skincare];
  }
  if (lower.includes('shampoo')) {
    return [...CHENNAI_KEYWORDS.shampoo, ...CHENNAI_KEYWORDS.oil];
  }
  if (lower.includes('oil') || lower.includes('elixir')) {
    return [...CHENNAI_KEYWORDS.oil, ...CHENNAI_KEYWORDS.shampoo];
  }
  return CHENNAI_KEYWORDS.all;
}

/**
 * Generate Schema.org LocalBusiness structured data for Chennai location
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['HealthAndBeautyBusiness', 'Store'],
    '@id': `${SITE_URL}/#localbusiness`,
    name: "Vedhathiri's Skin Care",
    alternateName: "Vedhathiri's Handcrafted Natural Skincare & Handmade Soaps",
    image: `${SITE_URL}/Vedhathiris_Logo.png`,
    url: SITE_URL,
    telephone: '+919999999999',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Chetpet',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      postalCode: '600031',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '13.0694',
      longitude: '80.2376',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:00',
        closes: '20:00',
      },
    ],
    areaServed: [
      {
        '@type': 'City',
        name: 'Chennai',
      },
      {
        '@type': 'State',
        name: 'Tamil Nadu',
      },
      {
        '@type': 'Country',
        name: 'India',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Natural Skincare & Handmade Soaps Catalog',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Natural & Handmade Soaps in Chennai',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Herbal Skincare Products in Chennai',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Natural Hair Oils in Chennai',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Natural Herbal Shampoos in Chennai',
        },
      ],
    },
  };
}

/**
 * Generate Schema.org Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: "Vedhathiri's Skin Care",
    url: SITE_URL,
    logo: `${SITE_URL}/Vedhathiris_Logo.png`,
    sameAs: [
      'https://www.instagram.com',
      'https://www.facebook.com',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Tamil'],
    },
  };
}

/**
 * Generate Schema.org WebSite structured data
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Vedhathiri's Skin Care",
    description:
      'Handcrafted natural skincare in Chennai. Shop pure handmade soap in Chennai, herbal shampoo, organic hair oil, and gentle personal care products.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Schema.org FAQPage structured data
 */
export function generateFAQSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

/**
 * Generate Schema.org BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path),
    })),
  };
}

/**
 * Generate Schema.org Product structured data
 */
export function generateProductSchema(product: {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category?: string | null;
  average_rating?: number | null;
  review_count?: number | null;
}) {
  const productUrl = getCanonicalUrl(`/products/${product.id}`);
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}/#product`,
    name: product.name,
    description:
      product.description ||
      `Authentic handcrafted ${product.name} from Vedhathiri's Skin Care in Chennai. Pure botanical and skin-safe formula.`,
    image: product.image_url ? [product.image_url] : [`${SITE_URL}/Vedhathiris_Logo.png`],
    brand: {
      '@type': 'Brand',
      name: "Vedhathiri's",
    },
    category: product.category || 'Skincare',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: "Vedhathiri's Skin Care",
      },
    },
  };

  if (product.average_rating && product.review_count && product.review_count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating.toFixed(1),
      reviewCount: product.review_count,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}
