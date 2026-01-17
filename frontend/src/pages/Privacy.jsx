import Navbar from '../components/Navbar'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-black mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <div className="w-24 h-px bg-black mx-auto"></div>
        </div>

        <div className="space-y-8 text-base font-light text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-2xl font-light text-black mb-4">1. Introduction</h2>
            <p className="mb-4">
              Nile Africa Technologies Limited ("we," "us," or "our") is committed to protecting your 
              privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you visit our website and use our services.
            </p>
            <p>
              By using our website, you consent to the data practices described in this policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">2. Information We Collect</h2>
            <p className="mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Name, email address, phone number, and shipping address</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Order history and preferences</li>
              <li>Communications with us</li>
            </ul>
            <p className="mt-4">
              We also automatically collect certain information when you visit our website, such as 
              IP address, browser type, device information, and usage patterns.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and our services</li>
              <li>Improve our website and customer experience</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">4. Information Sharing</h2>
            <p className="mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Service providers who assist us in operating our website and conducting business</li>
              <li>Payment processors to handle transactions</li>
              <li>Shipping companies to deliver your orders</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the internet is 100% secure, and we cannot guarantee 
              absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your browsing experience, 
              analyze website traffic, and personalize content. You can control cookie preferences 
              through your browser settings.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">7. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate or incomplete data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">8. Children's Privacy</h2>
            <p>
              Our website is not intended for children under 18 years of age. We do not knowingly 
              collect personal information from children. If you believe we have collected information 
              from a child, please contact us immediately.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact 
              us through our website contact form or email.
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

export default Privacy
