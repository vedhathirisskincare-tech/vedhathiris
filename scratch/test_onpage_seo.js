async function verifyOnPageSEO() {
  console.log('==================================================');
  console.log('RUNNING ON-PAGE SEO VERIFICATION');
  console.log('==================================================\n');

  // 1. Home Page
  console.log('--- 1. Testing Home Page (/) ---');
  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();
  
  const titleMatch = homeHtml.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', titleMatch ? titleMatch[1] : 'Not Found');

  const metaDesc = homeHtml.match(/<meta name="description" content="([^"]+)"/);
  console.log('Description:', metaDesc ? metaDesc[1] : 'Not Found');

  const metaKeywords = homeHtml.match(/<meta name="keywords" content="([^"]+)"/);
  console.log('Keywords:', metaKeywords ? metaKeywords[1].slice(0, 150) + '...' : 'Not Found');

  const jsonLdScripts = homeHtml.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  console.log(`Found ${jsonLdScripts ? jsonLdScripts.length : 0} JSON-LD Schema scripts.`);
  if (jsonLdScripts) {
    jsonLdScripts.forEach((s, idx) => {
      const content = s.replace(/<script[^>]*>|<\/script>/g, '');
      try {
        const parsed = JSON.parse(content);
        console.log(`  Schema #${idx + 1}:`, Array.isArray(parsed) ? parsed.map(p => p['@type']) : parsed['@type']);
      } catch (e) {
        console.log(`  Schema #${idx + 1} Raw:`, content.slice(0, 100));
      }
    });
  }

  // 2. Products Page
  console.log('\n--- 2. Testing Products Page (/products) ---');
  const prodRes = await fetch('http://localhost:3000/products');
  const prodHtml = await prodRes.text();
  const prodTitle = prodHtml.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', prodTitle ? prodTitle[1] : 'Not Found');
  const prodDesc = prodHtml.match(/<meta name="description" content="([^"]+)"/);
  console.log('Description:', prodDesc ? prodDesc[1] : 'Not Found');
  const prodJsonLd = prodHtml.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  console.log(`Found ${prodJsonLd ? prodJsonLd.length : 0} JSON-LD Schema scripts on /products.`);

  // 3. Contact Page
  console.log('\n--- 3. Testing Contact Page (/contact) ---');
  const contactRes = await fetch('http://localhost:3000/contact');
  const contactHtml = await contactRes.text();
  const contactTitle = contactHtml.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', contactTitle ? contactTitle[1] : 'Not Found');
  const contactJsonLd = contactHtml.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  console.log(`Found ${contactJsonLd ? contactJsonLd.length : 0} JSON-LD Schema scripts on /contact.`);

  // 4. Checking keyword matches across home HTML
  console.log('\n--- 4. Checking Target Keyword Matches on Home HTML ---');
  const keywordsToCheck = [
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
    'natural hair shampoo in Chennai'
  ];

  keywordsToCheck.forEach(kw => {
    const count = (homeHtml.toLowerCase().match(new RegExp(kw.toLowerCase(), 'g')) || []).length;
    console.log(`  "${kw}": ${count} occurrence(s)`);
  });

  console.log('\n==================================================');
  console.log('VERIFICATION COMPLETE');
  console.log('==================================================');
}

verifyOnPageSEO();
