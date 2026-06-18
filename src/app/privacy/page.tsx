export default function PrivacyPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold text-violet-600 mb-8">Privacy Policy</h1>
      <div className="prose prose-pink max-w-none text-gray-600 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you make a purchase, create an account, sign up for our newsletter, or communicate with us. This may include your name, email address, shipping address, and payment information.</p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect primarily to fulfill your orders, communicate with you about your account, and improve our skincare products and services.</p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
        </div>
      </div>
    </main>
  );
}
