async function testSEO() {
  try {
    console.log('Testing /robots.txt:');
    const robotsRes = await fetch('http://localhost:3000/robots.txt');
    console.log('Status:', robotsRes.status);
    console.log(await robotsRes.text());

    console.log('\nTesting /sitemap.xml:');
    const sitemapRes = await fetch('http://localhost:3000/sitemap.xml');
    console.log('Status:', sitemapRes.status);
    console.log((await sitemapRes.text()).slice(0, 1500));

    console.log('\nTesting HTML / for Meta Tags & X-Robots-Tag:');
    const homeRes = await fetch('http://localhost:3000/');
    console.log('X-Robots-Tag Header:', homeRes.headers.get('x-robots-tag'));
    const html = await homeRes.text();
    
    const canonicalMatches = html.match(/<link rel="canonical"[^>]+>/g);
    console.log('Canonical Tag:', canonicalMatches);

    const alternateMatches = html.match(/<link rel="alternate"[^>]+>/g);
    console.log('Alternate / Hreflang Tags:', alternateMatches);

    const robotsMatches = html.match(/<meta name="(robots|googlebot)"[^>]+>/g);
    console.log('Robots Meta Tags:', robotsMatches);

  } catch (err) {
    console.error('Error during SEO test:', err);
  }
}

testSEO();
