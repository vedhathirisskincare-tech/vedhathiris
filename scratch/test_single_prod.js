async function testProducts() {
  const tests = [
    { type: 'Soap', id: '0f9f0673-787d-477e-b30c-cdd609dddcd7' },
    { type: 'Shampoo', id: 'db0e1e6d-e7d1-4722-9303-b4ad10594d22' },
    { type: 'Hair Oil', id: '56ad2ca0-5f26-4dc3-b194-7cf75c23ed9c' },
  ];

  for (const item of tests) {
    console.log(`\nTesting ${item.type} (${item.id}):`);
    const r = await fetch(`http://localhost:3000/products/${item.id}`);
    const t = await r.text();
    console.log('  Title:', t.match(/<title>([^<]+)<\/title>/)?.[1]);
    console.log('  Description:', t.match(/<meta name="description" content="([^"]+)"/)?.[1]);
    console.log('  Keywords:', t.match(/<meta name="keywords" content="([^"]+)"/)?.[1]?.slice(0, 100) + '...');
    const schemas = t.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    console.log(`  Schemas count: ${schemas ? schemas.length : 0}`);
  }
}
testProducts();
