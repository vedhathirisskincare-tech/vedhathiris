async function testProductSEO() {
  console.log('Fetching products to test dynamic product page SEO...');
  const res = await fetch('http://localhost:3000/sitemap.xml');
  const xml = await res.text();
  const productUrls = xml.match(/<loc>(https:\/\/vedhathiris\.com\/products\/[^<]+)<\/loc>/g);
  
  if (productUrls && productUrls.length > 0) {
    const sampleProductUrl = productUrls[0].replace(/<loc>https:\/\/vedhathiris\.com|<\/loc>/g, '');
    console.log('Testing product route:', sampleProductUrl);
    
    const prodPageRes = await fetch(`http://localhost:3000${sampleProductUrl}`);
    const prodHtml = await prodPageRes.text();
    
    const titleMatch = prodHtml.match(/<title>([^<]+)<\/title>/);
    console.log('Product Title:', titleMatch ? titleMatch[1] : 'Not found');

    const descMatch = prodHtml.match(/<meta name="description" content="([^"]+)"/);
    console.log('Product Description:', descMatch ? descMatch[1] : 'Not found');

    const keywordsMatch = prodHtml.match(/<meta name="keywords" content="([^"]+)"/);
    console.log('Product Keywords:', keywordsMatch ? keywordsMatch[1].slice(0, 100) + '...' : 'Not found');

    const schemas = prodHtml.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    console.log(`Found ${schemas ? schemas.length : 0} JSON-LD schemas on product page.`);
  } else {
    console.log('No product URLs found in sitemap or Supabase.');
  }
}

testProductSEO();
