
export const CONTACT_TEMPLATE = `
<section id="contact" class="min-h-screen w-full hidden flex flex-col relative bg-slate-50 overflow-hidden">
  <!-- Background Decorations -->
  <div class="absolute top-0 left-0 w-full h-96 bg-indigo-600 rounded-b-[4rem] z-0"></div>
  
  <div class="relative z-10 container mx-auto px-6 py-24 flex-1 flex flex-col justify-center">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-serif font-bold text-white mb-4">Get in Touch</h2>
      <p class="text-indigo-100 max-w-xl mx-auto text-lg">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
    </div>

    <div class="max-w-4xl mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
      <!-- Contact Info -->
      <div class="bg-slate-900 p-10 md:w-2/5 text-white flex flex-col justify-between">
        <div>
          <h3 class="text-2xl font-serif font-bold mb-6">Contact Info</h3>
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="p-2 bg-white/10 rounded-lg">
                <svg class="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              </div>
              <div>
                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Phone</p>
                <p class="font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div class="flex items-start gap-4">
              <div class="p-2 bg-white/10 rounded-lg">
                <svg class="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <div>
                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email</p>
                <p class="font-medium">hello@example.com</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="p-2 bg-white/10 rounded-lg">
                <svg class="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <div>
                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Office</p>
                <p class="font-medium">123 Innovation Dr,<br>Tech City, TC 90210</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-10">
           <div class="flex gap-4">
             <a href="#" class="p-2 bg-white/5 hover:bg-white/20 rounded-full transition-colors"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
             <a href="#" class="p-2 bg-white/5 hover:bg-white/20 rounded-full transition-colors"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
           </div>
        </div>
      </div>

      <!-- Form -->
      <div class="p-10 md:w-3/5 bg-white">
        <form onsubmit="event.preventDefault(); alert('Thanks for your message! This is a demo form.');">
          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-900">First Name</label>
                <input type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="John" />
              </div>
              <div class="space-y-2">
                 <label class="text-sm font-semibold text-slate-900">Last Name</label>
                <input type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="Doe" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-900">Email Address</label>
              <input type="email" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="john@company.com" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-900">Message</label>
              <textarea rows="4" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none" placeholder="How can we help you?"></textarea>
            </div>

            <button type="submit" class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
`;

export const FOOTER_TEMPLATE = `
<footer class="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 relative z-50">
  <div class="container mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
      <div class="col-span-1 md:col-span-2">
        <h3 class="text-2xl font-serif font-bold text-white mb-4">Brand.</h3>
        <p class="mb-4 max-w-sm">Building digital experiences that matter. We create stunning, responsive websites tailored to your needs.</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-white transition-colors">Twitter</a>
          <a href="#" class="hover:text-white transition-colors">LinkedIn</a>
          <a href="#" class="hover:text-white transition-colors">Instagram</a>
        </div>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-4">Quick Links</h4>
        <ul class="space-y-2">
          <li><a href="#home" class="hover:text-indigo-400 transition-colors">Home</a></li>
          <li><a href="#about" class="hover:text-indigo-400 transition-colors">About</a></li>
          <li><a href="#services" class="hover:text-indigo-400 transition-colors">Services</a></li>
          <li><a href="#portfolio" class="hover:text-indigo-400 transition-colors">Portfolio</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-4">Legal</h4>
        <ul class="space-y-2">
          <li><a href="#" class="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
          <li><a href="#" class="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
          <li><a href="#" class="hover:text-indigo-400 transition-colors">Cookie Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
      <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
      <p>Designed with Visinaro AI</p>
    </div>
  </div>
</footer>
`;
