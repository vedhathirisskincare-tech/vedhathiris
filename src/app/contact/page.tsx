import { ContactForm } from './ContactForm'
import { MapPin, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-[85vh] bg-[#fbf9ff] py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-skin-bold mb-4">
            Get In Touch
          </h1>
          <p className="font-sans text-skin-bold/70 max-w-lg mx-auto text-base md:text-lg">
            Have questions about our premium personal care products? We would love to hear from you. Send us an enquiry or connect with us on socials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Contact Information & Socials */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-skin-primary/30 p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-2xl font-bold text-skin-bold">
                Contact Information
              </h3>

              {/* Location Card */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0 border border-violet-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-skin-bold text-sm">Our Location</h4>
                  <p className="text-sm text-skin-bold/70 mt-1 font-sans">
                    Chetpet, Chennai,<br />
                    Tamil Nadu, India
                  </p>
                </div>
              </div>

              {/* Hours Card */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0 border border-violet-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-skin-bold text-sm">Business Hours</h4>
                  <p className="text-sm text-skin-bold/70 mt-1 font-sans">
                    Mon - Sat: 9:00 AM - 6:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>

              {/* Email Support Card */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0 border border-violet-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-skin-bold text-sm">Email Us</h4>
                  <a href="mailto:support@vedhathiris.com" className="text-sm text-violet-600 hover:underline mt-1 block font-sans">
                    support@vedhathiris.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white rounded-3xl border border-skin-primary/30 p-8 shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-skin-bold mb-2">
                Connect With Us
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Instagram Profile */}
                <a 
                  href="https://www.instagram.com/vedhathirisskincare?utm_source=qr&igsh=MXE1dnM4dzJpZGpmZQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-2xl hover:border-pink-300 hover:bg-pink-50/30 transition-all group shrink-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Instagram</span>
                    <span className="block text-sm font-semibold text-skin-bold truncate max-w-[120px]" title="vedhathirisskincare">@vedhathirisskincare</span>
                  </div>
                </a>

                {/* Facebook Profile */}
                <a 
                  href="https://www.facebook.com/share/1DnRhJM86Z/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-2xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group shrink-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Facebook</span>
                    <span className="block text-sm font-semibold text-skin-bold">Vedhathiri's</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
