import Navbar from '../components/Navbar'

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-black mb-6 tracking-tight">
            About Nile Collective ✨
          </h1>
          <div className="w-24 h-px bg-black mx-auto"></div>
        </div>

        <div className="space-y-12 text-base font-light text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-2xl font-light text-black mb-4">Our Story 🌍</h2>
            <p className="mb-4">
              Nile Collective represents a fusion of Lagos street luxury and global craftsmanship. 
              Born in the vibrant heart of Nigeria's commercial capital, we bridge the gap between 
              local artistry and international design sensibilities. Our collection celebrates the 
              dynamic energy of Lagos while embracing the refined elegance of global luxury.
            </p>
            <p>
              We believe that true style emerges from the intersection of cultures—where the bold 
              creativity of Lagos meets the sophisticated craftsmanship of the world. Each piece in 
              our collection tells a story of this unique fusion, embodying both the vibrant spirit 
              of our city and the timeless quality of exceptional design.
            </p>
          </div>

          <div className="bg-gray-50 p-8 border border-gray-200 rounded-lg">
            <h2 className="text-2xl font-light text-black mb-4">Vision 2026 ✨</h2>
            <p className="mb-4">
              Our vision for 2026 is ambitious yet clear: to become the premier destination for 
              luxury goods that celebrate African craftsmanship while meeting global standards of 
              excellence. We envision Nile Collective as a bridge connecting talented local artisans 
              in Lagos with discerning customers worldwide.
            </p>
            <p className="mb-4">
              By 2026, we aim to have partnered with over 100 local merchants and artisans, creating 
              a curated collection of over 1,000 exceptional products. We're committed to supporting 
              local talent, fostering sustainable growth, and showcasing the best of what Lagos—and 
              Nigeria—has to offer on the global stage.
            </p>
            <p>
              Every purchase from Nile Collective contributes to this vision, supporting local 
              creators and helping build a sustainable ecosystem of luxury craftsmanship rooted 
              in authenticity and excellence.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">Lagos Street Luxury 👜</h2>
            <p className="mb-4">
              Lagos is a city of contrasts—where traditional markets meet modern boutiques, where 
              street style influences high fashion, and where local artisans create pieces that 
              resonate globally. At Nile Collective, we curate products that capture this unique 
              energy, working with merchants and creators who understand both the pulse of Lagos 
              and the standards of global luxury.
            </p>
            <p>
              Our products reflect the bold, confident aesthetic of Lagos street culture while 
              maintaining the quality and craftsmanship expected of luxury goods. We source from 
              trusted partners who share our vision of elevating local talent to global standards, 
              creating pieces that are both authentically Nigerian and universally appealing.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-black mb-4">Global Craftsmanship ✨</h2>
            <p className="mb-4">
              While rooted in Lagos, our commitment extends to global craftsmanship. We carefully 
              select products that meet international quality standards, ensuring that every item 
              in our collection represents the best of both worlds—the vibrant creativity of 
              Lagos and the refined excellence of global luxury.
            </p>
            <p>
              Nile Collective is more than a marketplace—it's a celebration of the fusion between 
              local authenticity and global sophistication. We invite you to explore our collection 
              and discover pieces that embody this unique blend, each one a testament to the power 
              of cultural exchange and exceptional craftsmanship.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
