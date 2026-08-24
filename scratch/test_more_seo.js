async function testAdditionalRoutes() {
  console.log('\nTesting /admin/login for noindex:');
  const adminRes = await fetch('http://localhost:3000/admin/login');
  console.log('Admin X-Robots-Tag:', adminRes.headers.get('x-robots-tag'));
  const adminHtml = await adminRes.text();
  console.log('Admin Robots Meta:', adminHtml.match(/<meta name="robots"[^>]+>/g));

  console.log('\nTesting /about for canonical & hreflang:');
  const aboutRes = await fetch('http://localhost:3000/about');
  const aboutHtml = await aboutRes.text();
  console.log('About Canonical:', aboutHtml.match(/<link rel="canonical"[^>]+>/g));
  console.log('About Hreflangs:', aboutHtml.match(/<link rel="alternate"[^>]+>/g));
}

testAdditionalRoutes();
