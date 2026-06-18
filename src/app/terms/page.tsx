export default function TermsPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold text-violet-600 mb-8">Terms of Service</h1>
      <div className="prose prose-pink max-w-none text-gray-600 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using the Vedhathiri's website, you accept and agree to be bound by the terms and provisions of this agreement.</p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Products and Pricing</h2>
          <p>All of our skincare products are handcrafted and subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice.</p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Health Disclaimer</h2>
          <p>Our products are made with natural ingredients. However, please review the ingredient list carefully for any potential allergens. We recommend performing a patch test before regular use.</p>
        </div>
      </div>
    </main>
  );
}
