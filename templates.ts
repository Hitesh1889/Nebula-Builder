// ─────────────────────────────────────────────────────────────────────────────
// VISINARO — Injected section templates
// ─────────────────────────────────────────────────────────────────────────────

// ── AUTH / LOGIN ──────────────────────────────────────────────────────────────
export const AUTH_TEMPLATE = `
<section id="auth" class="page-section min-h-screen w-full hidden flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-16">
  <div class="w-full max-w-md">
    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 pt-10 pb-8 text-center">
        <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </div>
        <h2 class="text-2xl font-bold text-white">Welcome Back</h2>
        <p class="text-indigo-100 text-sm mt-1">Sign in to your account</p>
      </div>
      <div class="px-8 py-6">
        <div class="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button id="tab-login" onclick="switchAuthTab('login')" class="flex-1 py-2 rounded-lg text-sm font-semibold bg-white shadow text-indigo-600 transition-all">Sign In</button>
          <button id="tab-signup" onclick="switchAuthTab('signup')" class="flex-1 py-2 rounded-lg text-sm font-semibold text-slate-500 transition-all">Create Account</button>
        </div>
        <div id="login-form">
          <div class="space-y-4">
            <input type="email" placeholder="Email address" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"/>
            <input type="password" placeholder="Password" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <button onclick="handleEmailLogin()" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02]">Sign In →</button>
          </div>
        </div>
        <div id="signup-form" class="hidden">
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <input type="text" placeholder="First name" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
              <input type="text" placeholder="Last name" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            </div>
            <input type="email" placeholder="Email address" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="password" placeholder="Create password" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <button onclick="handleEmailSignup()" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02]">Create Account →</button>
          </div>
        </div>
        <div class="flex items-center gap-4 my-5"><div class="flex-1 h-px bg-slate-200"></div><span class="text-xs text-slate-400 font-medium">or continue with</span><div class="flex-1 h-px bg-slate-200"></div></div>
        <div class="grid grid-cols-3 gap-3">
          <button onclick="handleSocialAuth('Google')" class="flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span class="text-xs font-medium text-slate-600">Google</span>
          </button>
          <button onclick="handleSocialAuth('Facebook')" class="flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl hover:bg-blue-50 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span class="text-xs font-medium text-slate-600">Facebook</span>
          </button>
          <button onclick="handleSocialAuth('Instagram')" class="flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl hover:bg-pink-50 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="url(#ig)"><defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#f09433"/><stop offset="25%" stop-color="#e6683c"/><stop offset="50%" stop-color="#dc2743"/><stop offset="75%" stop-color="#cc2366"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            <span class="text-xs font-medium text-slate-600">Instagram</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ── CONTACT ─────────────────────────────────────────────────────────────────
// Single contact form - no duplicate
export const CONTACT_TEMPLATE = `
<section id="contact" class="page-section min-h-screen w-full hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-16 flex items-center">
  <div class="max-w-5xl mx-auto w-full">
    <div class="text-center mb-12">
      <span class="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">Get In Touch</span>
      <h2 class="text-4xl font-bold text-white mb-3">Contact Us</h2>
      <p class="text-slate-400 max-w-lg mx-auto">Have a question or want to work together? We'd love to hear from you.</p>
    </div>
    <div class="grid md:grid-cols-5 gap-8">
      <div class="md:col-span-2 space-y-6">
        <div class="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
          <div class="p-2.5 bg-indigo-500/20 rounded-xl flex-shrink-0">
            <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div><p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Address</p><p class="text-white font-medium text-sm">123 Business Ave, Suite 100<br/>New York, NY 10001</p></div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
          <div class="p-2.5 bg-indigo-500/20 rounded-xl flex-shrink-0">
            <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          </div>
          <div><p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Phone</p><p class="text-white font-medium text-sm">+1 (555) 123-4567</p></div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
          <div class="p-2.5 bg-indigo-500/20 rounded-xl flex-shrink-0">
            <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <div><p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Email</p><p class="text-white font-medium text-sm">hello@yoursite.com</p></div>
        </div>
      </div>
      <div class="md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Your name" class="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"/>
          <input type="email" placeholder="Email address" class="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"/>
        </div>
        <input type="text" placeholder="Subject" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all mb-4"/>
        <textarea rows="5" placeholder="Your message..." class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none mb-4"></textarea>
        <button onclick="handleContactSubmit()" class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:scale-[1.02] text-sm">
          Send Message →
        </button>
      </div>
    </div>
  </div>
</section>`;

// ── FOOTER — clean, no Visinaro/Groq/AI branding ─────────────────────────────
export const FOOTER_TEMPLATE = `
<footer id="site-footer" class="bg-slate-900 text-slate-400 py-10 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      <div class="col-span-2 md:col-span-1">
        <div id="footer-logo-slot" class="mb-3"></div>
        <p class="text-sm leading-relaxed">Your trusted partner for quality products and outstanding service.</p>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Company</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#home" class="hover:text-white transition-colors">Home</a></li>
          <li><a href="#about" class="hover:text-white transition-colors">About</a></li>
          <li><a href="#services" class="hover:text-white transition-colors">Services</a></li>
          <li><a href="#portfolio" class="hover:text-white transition-colors">Portfolio</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Support</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#contact" class="hover:text-white transition-colors">Contact Us</a></li>
          <li><a href="#" class="hover:text-white transition-colors">FAQ</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Follow Us</h4>
        <div class="flex gap-3">
          <a href="#" class="p-2 bg-white/5 hover:bg-white/15 rounded-lg transition-colors"><svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          <a href="#" class="p-2 bg-white/5 hover:bg-white/15 rounded-lg transition-colors"><svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
        </div>
      </div>
    </div>
    <div class="border-t border-white/10 pt-6 text-center text-xs text-slate-600">
      <p id="footer-copyright">© 2026 All rights reserved.</p>
    </div>
  </div>
</footer>
<script>
// Copy brand logo into footer
(function(){
  var nav = document.getElementById('main-nav');
  var slot = document.getElementById('footer-logo-slot');
  if(nav && slot){
    var brand = nav.querySelector('a[href="#home"] svg, a[href="#home"] img, .brand-logo, #nav-logo');
    if(brand){ var c = brand.cloneNode(true); c.style.width='32px'; c.style.height='32px'; slot.appendChild(c); }
  }
  // Set copyright with site name
  var title = document.title || 'Your Company';
  var cp = document.getElementById('footer-copyright');
  if(cp) cp.textContent = '© ' + new Date().getFullYear() + ' ' + title + '. All rights reserved.';
})();
</script>`;

// ── SHOP ─────────────────────────────────────────────────────────────────────
export const SHOP_TEMPLATE = `
<section id="shop" class="page-section min-h-screen w-full hidden bg-slate-50 px-4 py-16">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <span class="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">Our Store</span>
      <h2 class="text-4xl font-bold text-slate-900 mb-3">Featured Products</h2>
      <p class="text-slate-500 max-w-lg mx-auto">Discover our handpicked collection of premium products</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" id="products-grid">
      ${[
        {name:'Premium Bundle',price:'₹2,499',img:'product1',tag:'Best Seller'},
        {name:'Starter Pack',price:'₹1,299',img:'product2',tag:'Popular'},
        {name:'Pro Edition',price:'₹3,999',img:'product3',tag:'New'},
        {name:'Classic Set',price:'₹899',img:'product4',tag:'Sale'},
        {name:'Deluxe Box',price:'₹5,499',img:'product5',tag:''},
        {name:'Value Pack',price:'₹699',img:'product6',tag:''},
        {name:'Signature Collection',price:'₹4,299',img:'product7',tag:'Limited'},
        {name:'Essential Kit',price:'₹1,099',img:'product8',tag:''},
      ].map(p=>`
      <div class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div class="relative overflow-hidden">
          <img src="https://picsum.photos/seed/${p.img}/400/300" alt="${p.name}" class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"/>
          ${p.tag?`<span class="absolute top-3 left-3 px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">${p.tag}</span>`:''}
          <button onclick="addToWishlist(this)" class="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
            <svg class="w-4 h-4 text-slate-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </button>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-slate-900 text-sm mb-1">${p.name}</h3>
          <p class="text-indigo-600 font-bold text-base mb-3">${p.price}</p>
          <button onclick="addToCart(this,'${p.name}','${p.price}')" class="add-to-cart w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Add to Cart
          </button>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;

// ── CART ─────────────────────────────────────────────────────────────────────
export const CART_TEMPLATE = `
<section id="cart" class="page-section min-h-screen w-full hidden bg-slate-50 px-4 py-16">
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center gap-3 mb-8">
      <h2 class="text-3xl font-bold text-slate-900">Your Cart</h2>
      <span id="cart-item-count" class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">0 items</span>
    </div>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-2">
        <div id="cart-items-list" class="space-y-4">
          <div class="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
            <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <p class="font-medium">Your cart is empty</p>
            <p class="text-sm mt-1">Add some products to get started</p>
            <button onclick="navigateTo('shop')" class="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all">Browse Products</button>
          </div>
        </div>
      </div>
      <div>
        <div class="bg-white rounded-2xl p-6 border border-slate-100 sticky top-4">
          <h3 class="font-bold text-slate-900 mb-5 text-lg">Order Summary</h3>
          <div class="space-y-3 text-sm mb-5">
            <div class="flex justify-between text-slate-600"><span>Subtotal</span><span id="cart-subtotal">₹0</span></div>
            <div class="flex justify-between text-slate-600"><span>Shipping</span><span class="text-green-600 font-medium">Free</span></div>
            <div class="flex justify-between text-slate-600"><span>Tax (18%)</span><span id="cart-tax">₹0</span></div>
            <div class="border-t pt-3 flex justify-between font-bold text-slate-900 text-base"><span>Total</span><span id="cart-total">₹0</span></div>
          </div>
          <button onclick="navigateTo('checkout')" class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:scale-[1.02] text-sm">
            Proceed to Checkout →
          </button>
          <button onclick="navigateTo('shop')" class="w-full py-2.5 mt-3 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ── CHECKOUT ─────────────────────────────────────────────────────────────────
export const CHECKOUT_TEMPLATE = `
<section id="checkout" class="page-section min-h-screen w-full hidden bg-slate-50 px-4 py-16">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-slate-900 mb-8">Checkout</h2>
    <div class="grid md:grid-cols-5 gap-8">
      <div class="md:col-span-3 space-y-6">
        <!-- Delivery Info -->
        <div class="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2"><span class="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span> Delivery Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <input type="text" placeholder="First name" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="text" placeholder="Last name" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="email" placeholder="Email" class="col-span-2 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="tel" placeholder="Phone" class="col-span-2 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="text" placeholder="Address line 1" class="col-span-2 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="text" placeholder="City" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="text" placeholder="PIN Code" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
          </div>
        </div>
        <!-- Payment Method -->
        <div class="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2"><span class="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span> Payment Method</h3>
          <div class="space-y-3" id="payment-options">
            <label class="flex items-center gap-3 p-4 border-2 border-indigo-500 bg-indigo-50 rounded-xl cursor-pointer" onclick="selectPayment(this,'stripe')">
              <input type="radio" name="payment" checked class="text-indigo-600"/>
              <div class="flex items-center gap-2 flex-1">
                <svg class="w-8 h-5" viewBox="0 0 60 25" fill="none"><path d="M59.64 14.28h-8.06v-2.34h8.06v2.34zm-18.95-8.41c-2.34 0-3.84 1.17-3.84 2.94 0 1.56.9 2.46 3.06 3.06 1.56.45 1.98.75 1.98 1.5 0 .69-.63 1.08-1.71 1.08-1.44 0-2.82-.6-3.84-1.5l-1.44 2.16c1.26 1.02 3.06 1.68 5.22 1.68 2.64 0 4.38-1.2 4.38-3.12 0-1.68-1.02-2.58-3.18-3.18-1.56-.45-1.92-.72-1.92-1.38 0-.57.54-.93 1.5-.93 1.14 0 2.22.45 3.12 1.2l1.44-2.1c-1.14-.93-2.7-1.41-4.77-1.41z" fill="#6772E5"/><path d="M25.35 5.87c-2.82 0-5.1 2.16-5.1 5.22 0 3.3 2.34 5.22 5.7 5.22 1.62 0 3.06-.48 4.14-1.44l-1.68-1.92c-.72.6-1.56.9-2.4.9-1.44 0-2.52-.78-2.82-2.1h7.56c.06-.33.09-.66.09-1.02 0-2.82-1.8-4.86-5.49-4.86zm-2.22 4.14c.27-1.32 1.11-2.04 2.22-2.04 1.2 0 1.95.78 2.07 2.04h-4.29z" fill="#6772E5"/></svg>
                <div><p class="font-semibold text-sm text-slate-900">Stripe</p><p class="text-xs text-slate-500">Credit / Debit Card</p></div>
              </div>
            </label>
            <label class="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 transition-all" onclick="selectPayment(this,'paypal')">
              <input type="radio" name="payment" class="text-blue-600"/>
              <div class="flex items-center gap-2 flex-1">
                <svg class="w-16 h-5" viewBox="0 0 80 21" fill="none"><path d="M9.93 2.32H4.35C3.97 2.32 3.65 2.59 3.6 2.97L1.34 16.58c-.04.28.17.54.45.54h2.77c.38 0 .7-.27.76-.64l.58-3.71c.05-.37.38-.64.76-.64h1.77c3.68 0 5.8-1.78 6.36-5.31.25-1.54.01-2.75-.71-3.6-.8-.94-2.21-1.4-4.15-1.4z" fill="#003087"/><path d="M29.68 2.32h-5.58c-.38 0-.7.27-.76.64L21.08 16.58c-.04.28.17.54.45.54h2.64c.27 0 .49-.19.53-.46l.61-3.89c.05-.37.38-.64.76-.64h1.77c3.68 0 5.8-1.78 6.36-5.31.25-1.54.01-2.75-.71-3.6-.8-.94-2.21-1.4-4.81-1.4z" fill="#009CDE"/></svg>
                <div><p class="font-semibold text-sm text-slate-900">PayPal</p><p class="text-xs text-slate-500">Pay with PayPal balance</p></div>
              </div>
            </label>
            <label class="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-green-400 transition-all" onclick="selectPayment(this,'cod')">
              <input type="radio" name="payment" class="text-green-600"/>
              <div class="flex items-center gap-2 flex-1">
                <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                <div><p class="font-semibold text-sm text-slate-900">Cash on Delivery</p><p class="text-xs text-slate-500">Pay when you receive</p></div>
              </div>
            </label>
            <!-- Stripe card inputs (shown when stripe selected) -->
            <div id="stripe-fields" class="space-y-3 mt-1 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input type="text" placeholder="Card number (e.g. 4242 4242 4242 4242)" maxlength="19" oninput="formatCard(this)" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
              <div class="grid grid-cols-2 gap-3">
                <input type="text" placeholder="MM / YY" maxlength="7" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
                <input type="text" placeholder="CVV" maxlength="4" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Order Summary -->
      <div class="md:col-span-2">
        <div class="bg-white rounded-2xl p-6 border border-slate-100 sticky top-4">
          <h3 class="font-bold text-slate-900 mb-4 text-lg">Order Summary</h3>
          <div id="checkout-items" class="space-y-3 mb-5 text-sm text-slate-600"></div>
          <div class="border-t pt-4 space-y-2 text-sm">
            <div class="flex justify-between text-slate-600"><span>Subtotal</span><span id="checkout-subtotal">₹0</span></div>
            <div class="flex justify-between text-green-600 font-medium"><span>Shipping</span><span>FREE</span></div>
            <div class="flex justify-between text-slate-600"><span>Tax (18%)</span><span id="checkout-tax">₹0</span></div>
            <div class="border-t pt-3 flex justify-between font-bold text-slate-900 text-base"><span>Total</span><span id="checkout-total">₹0</span></div>
          </div>
          <button onclick="placeOrder()" class="mt-5 w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:scale-[1.02] text-sm">
            Place Order →
          </button>
          <div class="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            Secured by SSL encryption
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ── AUTH_SCRIPTS ────────────────────────────────────────────────────────────
export const AUTH_SCRIPTS = `
<script data-vi="1">
// Cart state
var cartItems = [];
function getCartTotal(){ return cartItems.reduce(function(s,i){ return s + (parseFloat(i.price.replace(/[^0-9.]/g,'')) * i.qty); }, 0); }
function updateCartUI(){
  var count = cartItems.reduce(function(s,i){return s+i.qty;},0);
  document.querySelectorAll('.cart-badge,.cart-count').forEach(function(el){el.textContent=count;el.style.display=count>0?'':'none';});
  document.getElementById('cart-item-count') && (document.getElementById('cart-item-count').textContent = count + ' item' + (count!==1?'s':''));
  // Cart list
  var list = document.getElementById('cart-items-list');
  if(list){
    if(cartItems.length===0){
      list.innerHTML = '<div class="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100"><p class="font-medium">Your cart is empty</p><button onclick="navigateTo(\'shop\')" class="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all">Browse Products</button></div>';
    } else {
      list.innerHTML = cartItems.map(function(item,idx){
        return '<div class="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4"><img src="https://picsum.photos/seed/'+item.img+'/80/80" class="w-16 h-16 rounded-xl object-cover flex-shrink-0"/><div class="flex-1"><p class="font-semibold text-slate-900 text-sm">'+item.name+'</p><p class="text-indigo-600 font-bold">'+item.price+'</p></div><div class="flex items-center gap-2"><button onclick="changeQty('+idx+',-1)" class="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold transition-all">−</button><span class="w-8 text-center font-semibold">'+item.qty+'</span><button onclick="changeQty('+idx+',1)" class="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold transition-all">+</button></div><button onclick="removeFromCart('+idx+')" class="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>';
      }).join('');
    }
  }
  // Totals
  var sub = getCartTotal(); var tax = sub * 0.18; var tot = sub + tax;
  ['cart','checkout'].forEach(function(pfx){
    var s=document.getElementById(pfx+'-subtotal'); var t=document.getElementById(pfx+'-tax'); var tt=document.getElementById(pfx+'-total');
    if(s) s.textContent = '₹' + sub.toFixed(0);
    if(t) t.textContent = '₹' + tax.toFixed(0);
    if(tt) tt.textContent = '₹' + tot.toFixed(0);
  });
  // Checkout items list
  var ci = document.getElementById('checkout-items');
  if(ci) ci.innerHTML = cartItems.map(function(i){return '<div class="flex justify-between"><span>'+i.name+' × '+i.qty+'</span><span class="font-medium">'+i.price+'</span></div>';}).join('');
}
function addToCart(btn, name, price){
  var img = btn.closest('.group') ? (btn.closest('.group').querySelector('img')?.getAttribute('src')?.split('/seed/')[1]?.split('/')[0] || 'product') : 'product';
  var existing = cartItems.find(function(i){return i.name===name;});
  if(existing){ existing.qty++; } else { cartItems.push({name:name,price:price,img:img,qty:1}); }
  updateCartUI();
  var orig = btn.innerHTML;
  btn.innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Added!';
  btn.style.background = '#16a34a';
  setTimeout(function(){ btn.innerHTML = orig; btn.style.background = ''; }, 1500);
}
function changeQty(idx, delta){
  cartItems[idx].qty += delta;
  if(cartItems[idx].qty <= 0) cartItems.splice(idx,1);
  updateCartUI();
}
function removeFromCart(idx){ cartItems.splice(idx,1); updateCartUI(); }
function addToWishlist(btn){ btn.querySelector('svg').style.color='#ef4444'; btn.querySelector('svg').setAttribute('fill','currentColor'); }
function selectPayment(label, method){
  document.querySelectorAll('#payment-options label').forEach(function(l){l.style.borderColor='';l.style.borderWidth='2px';});
  label.style.borderColor = method==='cod'?'#22c55e':method==='paypal'?'#2563eb':'#4f46e5';
  document.getElementById('stripe-fields') && (document.getElementById('stripe-fields').style.display = method==='stripe'?'block':'none');
}
function formatCard(input){ input.value = input.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim(); }
function placeOrder(){
  var method = document.querySelector('#payment-options input:checked');
  var methodName = method ? method.closest('label').querySelector('p').textContent : 'Card';
  var total = document.getElementById('checkout-total')?.textContent || '₹0';
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
  overlay.innerHTML = '<div style="background:white;border-radius:24px;padding:40px;max-width:380px;width:90%;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,0.3);">'
    + '<div style="width:64px;height:64px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">'
    + '<svg style="width:32px;height:32px;color:#16a34a" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></div>'
    + '<h3 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 8px">Order Placed! 🎉</h3>'
    + '<p style="color:#6b7280;font-size:14px;margin:0 0 6px">Your order of <strong>' + total + '</strong> has been placed.</p>'
    + '<p style="color:#6b7280;font-size:13px;margin:0 0 24px">Payment via ' + methodName + ' · Confirmation sent to your email.</p>'
    + '<button onclick="this.closest(\'div\').parentElement.remove();cartItems=[];updateCartUI();navigateTo(\'shop\');" style="padding:12px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:12px;cursor:pointer;font-weight:700;font-size:14px;">Continue Shopping</button></div>';
  document.body.appendChild(overlay);
}
// Auth
function switchAuthTab(tab){
  var lf=document.getElementById('login-form'), sf=document.getElementById('signup-form');
  var lt=document.getElementById('tab-login'), st=document.getElementById('tab-signup');
  if(!lf||!sf)return;
  if(tab==='login'){ lf.classList.remove('hidden'); sf.classList.add('hidden'); if(lt){lt.className='flex-1 py-2 rounded-lg text-sm font-semibold bg-white shadow text-indigo-600 transition-all';} if(st){st.className='flex-1 py-2 rounded-lg text-sm font-semibold text-slate-500 transition-all';} }
  else { sf.classList.remove('hidden'); lf.classList.add('hidden'); if(st){st.className='flex-1 py-2 rounded-lg text-sm font-semibold bg-white shadow text-indigo-600 transition-all';} if(lt){lt.className='flex-1 py-2 rounded-lg text-sm font-semibold text-slate-500 transition-all';} }
}
function handleSocialAuth(provider){
  var o=document.createElement('div');
  o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;';
  o.innerHTML='<div style="background:#1e293b;border:1px solid rgba(255,255,255,0.1);padding:32px;border-radius:20px;text-align:center;max-width:300px;">'
    +'<div style="font-size:36px;margin-bottom:12px">🔐</div>'
    +'<p style="color:white;font-weight:700;font-size:16px;margin:0 0 8px">'+provider+' Login</p>'
    +'<p style="color:#94a3b8;font-size:13px;margin:0 0 20px">Integrate '+provider+' OAuth SDK in production.</p>'
    +'<button onclick="this.closest(\'div\').parentElement.remove()" style="padding:10px 24px;background:#6366f1;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;">Got it</button></div>';
  document.body.appendChild(o);
}
function handleEmailLogin(){
  var o=document.createElement('div');
  o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;';
  o.innerHTML='<div style="background:white;border-radius:20px;padding:32px;text-align:center;max-width:300px;box-shadow:0 25px 50px rgba(0,0,0,0.3);">'
    +'<div style="font-size:36px;margin-bottom:12px">✅</div>'
    +'<p style="font-weight:700;font-size:18px;margin:0 0 8px;color:#111827">Signed In!</p>'
    +'<p style="color:#6b7280;font-size:13px;margin:0 0 20px">Connect Firebase/Supabase for real auth.</p>'
    +'<button onclick="this.closest(\'div\').parentElement.remove()" style="padding:10px 24px;background:#6366f1;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;">Continue</button></div>';
  document.body.appendChild(o);
}
function handleEmailSignup(){ handleEmailLogin(); }
function handleContactSubmit(){
  var o=document.createElement('div');
  o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;';
  o.innerHTML='<div style="background:white;border-radius:20px;padding:32px;text-align:center;max-width:300px;box-shadow:0 25px 50px rgba(0,0,0,0.3);">'
    +'<div style="font-size:36px;margin-bottom:12px">📬</div>'
    +'<p style="font-weight:700;font-size:18px;margin:0 0 8px;color:#111827">Message Sent!</p>'
    +'<p style="color:#6b7280;font-size:13px;margin:0 0 20px">We\'ll get back to you within 24 hours.</p>'
    +'<button onclick="this.closest(\'div\').parentElement.remove()" style="padding:10px 24px;background:#6366f1;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;">Close</button></div>';
  document.body.appendChild(o);
}
// Init cart badge display
updateCartUI();
</script>`;
