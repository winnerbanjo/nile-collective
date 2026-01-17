import Navbar from '../components/Navbar'

const Merchants = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-black mb-6 tracking-tight">
            Partner With Us 🌍
          </h1>
          <div className="w-24 h-px bg-black mx-auto"></div>
        </div>

        <div className="space-y-12 text-base font-light text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-2xl font-light text-black mb-4">Join Nile Collective ✨</h2>
            <p className="mb-4">
              We're looking for talented local Lagos artisans and merchants who share our passion 
              for quality craftsmanship and exceptional design. If you create beautiful, high-quality 
              products and want to reach a discerning global audience, we'd love to partner with you.
            </p>
            <p>
              Nile Collective provides a premium platform where your creations can shine alongside 
              other exceptional pieces. We handle the technical aspects of e-commerce, payments, 
              and customer service, so you can focus on what you do best—creating extraordinary products.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">What We're Looking For 👜</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>High-quality, handmade or artisanal products</li>
              <li>Unique designs that reflect Lagos creativity</li>
              <li>Consistent quality and attention to detail</li>
              <li>Commitment to craftsmanship and authenticity</li>
              <li>Products that align with luxury lifestyle aesthetic</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">Benefits of Partnering With Us</h2>
            <p className="mb-4">
              When you join Nile Collective, you become part of a curated marketplace that celebrates 
              both local talent and global sophistication. We provide:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>A premium platform to showcase your products</li>
              <li>Access to a growing customer base</li>
              <li>Professional product photography and presentation</li>
              <li>Streamlined order management and fulfillment</li>
              <li>Marketing support and brand visibility</li>
              <li>Secure payment processing</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-8 border border-gray-200 rounded-lg">
            <h2 className="text-2xl font-light text-black mb-4">Get In Touch</h2>
            <p className="mb-4">
              Ready to partner with Nile Collective? We'd love to hear from you and learn about 
              your products. Send us a message through our contact form or reach out via email 
              with details about your work.
            </p>
            <p className="text-sm font-light text-gray-600">
              We review all merchant applications carefully and will respond to promising partnerships 
              within 7-10 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Merchants
