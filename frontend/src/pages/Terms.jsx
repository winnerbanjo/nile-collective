import Navbar from '../components/Navbar'

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-black mb-6 tracking-tight">
            Terms & Conditions
          </h1>
          <div className="w-24 h-px bg-black mx-auto"></div>
        </div>

        <div className="space-y-8 text-base font-light text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-2xl font-light text-black mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to Nile Collective. These Terms and Conditions ("Terms") govern your use of our 
              website and services operated by Nile Africa Technologies Limited ("we," "us," or "our"). 
              By accessing or using our website, you agree to be bound by these Terms.
            </p>
            <p>
              If you do not agree with any part of these Terms, you must not use our website or services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">2. Use of Website</h2>
            <p className="mb-4">
              You may use our website for lawful purposes only. You agree not to use the website:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To transmit any harmful code or malicious software</li>
              <li>To impersonate any person or entity</li>
              <li>To interfere with or disrupt the website or servers</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">3. Products and Pricing</h2>
            <p className="mb-4">
              We strive to provide accurate product descriptions and pricing. However, we reserve the 
              right to correct any errors, inaccuracies, or omissions and to change or update information 
              at any time without prior notice.
            </p>
            <p>
              All prices are displayed in Nigerian Naira (₦) and are subject to change without notice. 
              We reserve the right to refuse or cancel any order at our discretion.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">4. Orders and Payment</h2>
            <p className="mb-4">
              When you place an order, you are making an offer to purchase products at the prices and 
              terms stated. We reserve the right to accept or reject your order for any reason.
            </p>
            <p>
              Payment must be made in full at the time of order. We accept payment through Paystack 
              and bank transfer. All payments are processed securely.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">5. Shipping and Delivery</h2>
            <p className="mb-4">
              Shipping fees vary based on your location. We will provide shipping estimates during checkout. 
              Delivery times are estimates and not guaranteed.
            </p>
            <p>
              You are responsible for providing accurate shipping information. We are not liable for 
              delays or failures in delivery due to incorrect address information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">6. Returns and Refunds</h2>
            <p className="mb-4">
              Returns are accepted within 7 days of delivery, provided items are in original condition 
              with tags attached. Custom or personalized items may not be eligible for return.
            </p>
            <p>
              Refunds will be processed to the original payment method within 14 business days of 
              receiving the returned item.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">7. Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, images, and software, 
              is the property of Nile Africa Technologies Limited or its content suppliers and is 
              protected by copyright and trademark laws.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Nile Africa Technologies Limited shall not be 
              liable for any indirect, incidental, special, or consequential damages arising from 
              your use of the website or products.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Nigeria. 
              Any disputes arising from these Terms shall be subject to the exclusive jurisdiction 
              of the courts of Nigeria.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us through our website 
              contact form or email.
            </p>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm font-light text-gray-600">
              Last updated: 2026. © NILE AFRICA TECHNOLOGIES LIMITED 2026. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms
