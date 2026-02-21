// ─────────────────────────────────────────────────────────────────────────────
// VISINARO Templates — injected into AI-generated HTML
// ─────────────────────────────────────────────────────────────────────────────

// ── AUTH ──────────────────────────────────────────────────────────────────────
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
            <input type="email" placeholder="Email address" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="password" placeholder="Password" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <button onclick="handleEmailLogin()" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl transition-all hover:scale-[1.02]">Sign In →</button>
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
            <button onclick="handleEmailSignup()" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl transition-all hover:scale-[1.02]">Create Account →</button>
          </div>
        </div>
        <div class="flex items-center gap-4 my-5"><div class="flex-1 h-px bg-slate-200"></div><span class="text-xs text-slate-400">or continue with</span><div class="flex-1 h-px bg-slate-200"></div></div>
        <div class="grid grid-cols-3 gap-3">
          <button onclick="handleSocialAuth('Google')" class="flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span class="text-xs font-medium text-slate-600">Google</span>
          </button>
          <button onclick="handleSocialAuth('Facebook')" class="flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl hover:bg-blue-50 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span class="text-xs font-medium text-slate-600">Facebook</span>
          </button>
          <button onclick="handleSocialAuth('Apple')" class="flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <span class="text-xs font-medium text-slate-600">Apple</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ── CONTACT — single clean form ───────────────────────────────────────────────
export const CONTACT_TEMPLATE = `
<section id="contact" class="page-section min-h-screen w-full hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-16 flex items-center">
  <div class="max-w-5xl mx-auto w-full">
    <div class="text-center mb-12">
      <span class="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">Get In Touch</span>
      <h2 class="text-4xl font-bold text-white mb-3">Contact Us</h2>
      <p class="text-slate-400 max-w-lg mx-auto">Have a question? We would love to hear from you.</p>
    </div>
    <div class="grid md:grid-cols-5 gap-8">
      <div class="md:col-span-2 space-y-5">
        <div class="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
          <div class="p-2.5 bg-indigo-500/20 rounded-xl flex-shrink-0"><svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
          <div><p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Address</p><p class="text-white font-medium text-sm">123 Business Ave, Suite 100<br/>New York, NY 10001</p></div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
          <div class="p-2.5 bg-indigo-500/20 rounded-xl flex-shrink-0"><svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></div>
          <div><p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Phone</p><p class="text-white font-medium text-sm">+1 (555) 123-4567</p></div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
          <div class="p-2.5 bg-indigo-500/20 rounded-xl flex-shrink-0"><svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
          <div><p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Email</p><p class="text-white font-medium text-sm">hello@yoursite.com</p></div>
        </div>
      </div>
      <div class="md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Your name" class="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none col-span-1"/>
          <input type="email" placeholder="Email address" class="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none col-span-1"/>
        </div>
        <input type="text" placeholder="Subject" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-4"/>
        <textarea rows="5" placeholder="Your message..." class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-4"></textarea>
        <button onclick="handleContactSubmit()" class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] text-sm">Send Message →</button>
      </div>
    </div>
  </div>
</section>`;

// ── FOOTER — reads brand name from nav, no "Your Company" ────────────────────
export const FOOTER_TEMPLATE = `
<footer id="site-footer" class="bg-slate-900 text-slate-400 py-10 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      <div class="col-span-2 md:col-span-1">
        <div id="footer-brand" class="flex items-center gap-2 mb-3 text-white font-bold text-lg"></div>
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
          <a href="#" class="p-2 bg-white/5 hover:bg-white/15 rounded-lg transition-colors"><svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="url(#ig-grad)"><defs><linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#f09433"/><stop offset="50%" stop-color="#dc2743"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 3.677a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
        </div>
      </div>
    </div>
    <div class="border-t border-white/10 pt-6 text-center text-xs text-slate-600">
      <p id="footer-copyright">© 2026 All rights reserved.</p>
    </div>
  </div>
</footer>
<script>
(function(){
  // Get brand name from nav logo or h1
  var brandName = '';
  var navLogo = document.getElementById('nav-logo');
  if(navLogo){ brandName = navLogo.textContent.trim(); }
  if(!brandName){ var h1 = document.querySelector('h1'); if(h1) brandName = h1.textContent.trim().slice(0,40); }
  if(!brandName){ brandName = document.title || 'Our Company'; }
  
  // Set footer brand
  var fb = document.getElementById('footer-brand');
  if(fb && navLogo){
    var clone = navLogo.cloneNode(true);
    clone.removeAttribute('href'); clone.style.cssText = 'display:flex;align-items:center;gap:8px;';
    fb.appendChild(clone);
  } else if(fb){
    fb.textContent = brandName;
  }
  
  // Set copyright with real brand name
  var cp = document.getElementById('footer-copyright');
  if(cp) cp.textContent = '© ' + new Date().getFullYear() + ' ' + brandName + '. All rights reserved.';
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
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      ${[
        {name:'Signature Blend',price:'$24.99',img:'coffeebag',tag:'Best Seller'},
        {name:'Single Origin',price:'$19.99',img:'coffeebeans',tag:'Popular'},
        {name:'Cold Brew Kit',price:'$39.99',img:'coldbrew',tag:'New'},
        {name:'Pour Over Set',price:'$34.99',img:'pourover',tag:'Sale'},
        {name:'Espresso Roast',price:'$22.99',img:'espresso',tag:''},
        {name:'French Press',price:'$49.99',img:'frenchpress',tag:''},
        {name:'Gift Box',price:'$59.99',img:'giftbox',tag:'Limited'},
        {name:'Starter Bundle',price:'$14.99',img:'bundle',tag:''},
      ].map(p=>`
      <div class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
        <div class="relative overflow-hidden">
          <img src="https://picsum.photos/seed/${p.img}/400/300" alt="${p.name}" class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"/>
          ${p.tag?`<span class="absolute top-3 left-3 px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">${p.tag}</span>`:''}
          <button onclick="addToWishlist(this)" class="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </button>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-slate-900 text-sm mb-1">${p.name}</h3>
          <p class="text-indigo-600 font-bold text-base mb-3">${p.price}</p>
          <button onclick="window.addToCart(this,'${p.name}','${p.price}')" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
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
            <button onclick="window.navigateTo('shop')" class="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all">Browse Products</button>
          </div>
        </div>
      </div>
      <div>
        <div class="bg-white rounded-2xl p-6 border border-slate-100 sticky top-4">
          <h3 class="font-bold text-slate-900 mb-5 text-lg">Order Summary</h3>
          <div class="space-y-3 text-sm mb-5">
            <div class="flex justify-between text-slate-600"><span>Subtotal</span><span id="cart-subtotal">$0.00</span></div>
            <div class="flex justify-between text-slate-600"><span>Shipping</span><span class="text-green-600 font-medium">Free</span></div>
            <div class="flex justify-between text-slate-600"><span>Tax (8%)</span><span id="cart-tax">$0.00</span></div>
            <div class="border-t pt-3 flex justify-between font-bold text-slate-900 text-base"><span>Total</span><span id="cart-total">$0.00</span></div>
          </div>
          <button onclick="window.navigateTo('checkout')" class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:scale-[1.02] text-sm">Proceed to Checkout →</button>
          <button onclick="window.navigateTo('shop')" class="w-full py-2.5 mt-3 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">← Continue Shopping</button>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ── CHECKOUT — with Stripe, GPay, PayPal, Cash on Delivery ───────────────────
export const CHECKOUT_TEMPLATE = `
<section id="checkout" class="page-section min-h-screen w-full hidden bg-slate-50 px-4 py-16">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-slate-900 mb-8">Checkout</h2>
    <div class="grid md:grid-cols-5 gap-8">
      <div class="md:col-span-3 space-y-6">
        <div class="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            Delivery Information
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <input type="text" placeholder="First name" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="text" placeholder="Last name" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="email" placeholder="Email address" class="col-span-2 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="tel" placeholder="Phone number" class="col-span-2 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="text" placeholder="Street address" class="col-span-2 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="text" placeholder="City" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="text" placeholder="ZIP Code" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            Payment Method
          </h3>
          <div class="grid grid-cols-2 gap-3 mb-4" id="payment-methods">
            <!-- Stripe -->
            <button onclick="selectPaymentMethod('stripe',this)" id="pm-stripe" class="payment-method-btn flex items-center gap-3 p-4 border-2 border-indigo-500 bg-indigo-50 rounded-xl cursor-pointer transition-all">
              <svg viewBox="0 0 60 26" class="h-6 w-auto flex-shrink-0"><path d="M59.64 14.28h-8.06c.19 1.93 1.86 2.76 3.76 2.76 1.34 0 2.44-.42 3.38-1.23l1.92 1.91c-1.28 1.47-3.14 2.35-5.43 2.35-4.34 0-7.25-2.9-7.25-7.23 0-4.3 2.97-7.24 6.99-7.24 4.32 0 6.69 3.16 6.69 7.24v1.44zm-7.64-4.5c-1.45 0-2.6.97-2.88 2.48h5.64c-.27-1.55-1.41-2.48-2.76-2.48zm-16.26-5.03c-2.34 0-3.84 1.17-3.84 2.94 0 1.56.9 2.46 3.06 3.06 1.56.45 1.98.75 1.98 1.5 0 .69-.63 1.08-1.71 1.08-1.44 0-2.82-.6-3.84-1.5l-1.44 2.16c1.26 1.02 3.06 1.68 5.22 1.68 2.64 0 4.38-1.2 4.38-3.12 0-1.68-1.02-2.58-3.18-3.18-1.56-.45-1.92-.72-1.92-1.38 0-.57.54-.93 1.5-.93 1.14 0 2.22.45 3.12 1.2l1.44-2.1c-1.14-.93-2.7-1.41-4.77-1.41zm-7.29.48H24v14.1h4.45V5.23zm-2.22-4.8a2.22 2.22 0 100 4.44 2.22 2.22 0 000-4.44zM12.43 5.23H8v14.1h4.43V5.23zM10.22.43a2.22 2.22 0 100 4.44 2.22 2.22 0 000-4.44z" fill="#6772E5"/></svg>
              <div class="text-left"><p class="font-semibold text-sm text-slate-900">Stripe</p><p class="text-xs text-slate-500">Card payment</p></div>
            </button>
            <!-- Google Pay -->
            <button onclick="selectPaymentMethod('gpay',this)" id="pm-gpay" class="payment-method-btn flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all hover:border-slate-400">
              <svg viewBox="0 0 48 48" class="h-6 w-auto flex-shrink-0"><path d="M44.5 20H24v8h11.8C34.7 33.9 29.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.2-6.2C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.4 20-21 0-1.4-.2-2.7-.5-4z" fill="#FBC02D"/><path d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.2-6.2C34.6 5.1 29.6 3 24 3c-7.7 0-14.3 4.3-17.7 10.7z" fill="#E53935"/><path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.7 36.1 27 37 24 37c-5.1 0-9.6-3.1-11.7-7.6l-6.9 5.3C9.3 40.3 16.2 45 24 45z" fill="#4CAF50"/><path d="M44.5 20H24v8h11.8c-.5 2.2-1.8 4.1-3.5 5.5l6.6 5.4C42.4 35.5 45 30.1 45 24c0-1.4-.2-2.7-.5-4z" fill="#1565C0"/></svg>
              <div class="text-left"><p class="font-semibold text-sm text-slate-900">Google Pay</p><p class="text-xs text-slate-500">Pay with Google</p></div>
            </button>
            <!-- PayPal -->
            <button onclick="selectPaymentMethod('paypal',this)" id="pm-paypal" class="payment-method-btn flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all hover:border-blue-400">
              <svg viewBox="0 0 48 48" class="h-6 w-auto flex-shrink-0"><path d="M40 22c0 9.4-7.6 17-17 17H13l-3 9H5L11 8h15c7.7 0 14 6.3 14 14z" fill="#002F86"/><path d="M44 16c0 9.4-7.6 17-17 17H17l-3 9H9L15 2h15c7.7 0 14 6.3 14 14z" fill="#009BE1"/></svg>
              <div class="text-left"><p class="font-semibold text-sm text-slate-900">PayPal</p><p class="text-xs text-slate-500">PayPal balance</p></div>
            </button>
            <!-- Cash on Delivery -->
            <button onclick="selectPaymentMethod('cod',this)" id="pm-cod" class="payment-method-btn flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all hover:border-green-400">
              <svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <div class="text-left"><p class="font-semibold text-sm text-slate-900">Cash on Delivery</p><p class="text-xs text-slate-500">Pay at door</p></div>
            </button>
          </div>
          <!-- Stripe card fields (visible by default) -->
          <div id="stripe-fields" class="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div class="relative">
              <input id="card-number" type="text" placeholder="1234 5678 9012 3456" maxlength="19" oninput="formatCardNumber(this)" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-12"/>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <svg class="h-5" viewBox="0 0 48 32"><rect width="48" height="32" rx="4" fill="#1A1F71"/><circle cx="19" cy="16" r="9" fill="#EB001B"/><circle cx="29" cy="16" r="9" fill="#F79E1B"/><path d="M24 9.1A9 9 0 0129 16a9 9 0 01-5 6.9A9 9 0 0119 16a9 9 0 015-6.9z" fill="#FF5F00"/></svg>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <input type="text" placeholder="MM / YY" maxlength="7" oninput="formatExpiry(this)" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
              <input type="text" placeholder="CVV" maxlength="4" class="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            </div>
            <input type="text" placeholder="Cardholder name" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <p class="text-xs text-slate-400 flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>Your card details are encrypted and secure</p>
          </div>
          <div id="gpay-info" class="hidden p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-800 text-center">
            <div class="text-2xl mb-2">G Pay</div>
            Click "Place Order" to authenticate with Google Pay on your device.
          </div>
          <div id="paypal-info" class="hidden p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-800 text-center">
            <div class="text-2xl mb-2">PayPal</div>
            You'll be redirected to PayPal to complete your payment securely.
          </div>
          <div id="cod-info" class="hidden p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800">
            <p class="font-semibold mb-1">✓ Cash on Delivery selected</p>
            <p>Pay with cash when your order arrives. No advance payment needed.</p>
          </div>
        </div>
      </div>
      <!-- Order Summary -->
      <div class="md:col-span-2">
        <div class="bg-white rounded-2xl p-6 border border-slate-100 sticky top-4">
          <h3 class="font-bold text-slate-900 mb-4 text-lg">Order Summary</h3>
          <div id="checkout-items" class="space-y-2 mb-4 text-sm text-slate-600 max-h-48 overflow-y-auto"></div>
          <div class="border-t pt-4 space-y-2 text-sm">
            <div class="flex justify-between text-slate-600"><span>Subtotal</span><span id="checkout-subtotal">$0.00</span></div>
            <div class="flex justify-between text-green-600 font-medium"><span>Shipping</span><span>FREE</span></div>
            <div class="flex justify-between text-slate-600"><span>Tax (8%)</span><span id="checkout-tax">$0.00</span></div>
            <div class="border-t pt-3 flex justify-between font-bold text-slate-900 text-lg"><span>Total</span><span id="checkout-total">$0.00</span></div>
          </div>
          <button onclick="window.placeOrder()" class="mt-5 w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] text-sm" id="place-order-btn">
            Place Order →
          </button>
          <div class="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            256-bit SSL encryption
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ── ALL SCRIPTS — cart, checkout, auth, contact ───────────────────────────────
// NOTE: All functions exposed on window.* so they work from any onclick attribute
// including in new-tab standalone HTML where there's no module scope
export const AUTH_SCRIPTS = `
<script>
(function(){
  // ── CART STATE ──────────────────────────────────────────────────────────────
  var cartItems = window._cartItems = window._cartItems || [];

  function fmt(n){ return '$' + parseFloat(n).toFixed(2); }
  function getTotal(){ return cartItems.reduce(function(s,i){ return s + (parseFloat(i.price.replace(/[^0-9.]/g,'')) * i.qty); }, 0); }

  window.updateCartUI = function(){
    var count = cartItems.reduce(function(s,i){ return s + i.qty; }, 0);
    document.querySelectorAll('.cart-badge,.cart-count').forEach(function(el){
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
    var ci = document.getElementById('cart-item-count');
    if(ci) ci.textContent = count + ' item' + (count !== 1 ? 's' : '');

    var list = document.getElementById('cart-items-list');
    if(list){
      if(cartItems.length === 0){
        list.innerHTML = '<div class="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">' +
          '<p class="font-medium text-lg mb-2">Your cart is empty</p>' +
          '<p class="text-sm mb-4">Add some products to get started</p>' +
          '<button onclick="window.navigateTo(\'shop\')" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all">Browse Products</button></div>';
      } else {
        list.innerHTML = cartItems.map(function(item, idx){
          return '<div class="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4">' +
            '<img src="https://picsum.photos/seed/' + (item.img||'product') + '/80/80" class="w-16 h-16 rounded-xl object-cover flex-shrink-0"/>' +
            '<div class="flex-1 min-w-0"><p class="font-semibold text-slate-900 text-sm truncate">' + item.name + '</p>' +
            '<p class="text-indigo-600 font-bold">' + item.price + '</p></div>' +
            '<div class="flex items-center gap-2">' +
            '<button onclick="window.changeQty(' + idx + ',-1)" class="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold">−</button>' +
            '<span class="w-8 text-center font-semibold">' + item.qty + '</span>' +
            '<button onclick="window.changeQty(' + idx + ',1)" class="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold">+</button></div>' +
            '<button onclick="window.removeFromCart(' + idx + ')" class="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all">' +
            '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>';
        }).join('');
      }
    }

    var sub = getTotal();
    var tax = sub * 0.08;
    var tot = sub + tax;
    ['cart','checkout'].forEach(function(p){
      var s = document.getElementById(p + '-subtotal');
      var t = document.getElementById(p + '-tax');
      var tt = document.getElementById(p + '-total');
      if(s) s.textContent = fmt(sub);
      if(t) t.textContent = fmt(tax);
      if(tt) tt.textContent = fmt(tot);
    });

    var ci2 = document.getElementById('checkout-items');
    if(ci2){
      if(cartItems.length === 0){
        ci2.innerHTML = '<p class="text-slate-400 text-sm italic">No items yet — add products from the shop</p>';
      } else {
        ci2.innerHTML = cartItems.map(function(i){
          return '<div class="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">' +
            '<span class="text-slate-700 truncate mr-2">' + i.name + ' <span class="text-slate-400">× ' + i.qty + '</span></span>' +
            '<span class="font-semibold text-slate-900 flex-shrink-0">' + i.price + '</span></div>';
        }).join('');
      }
    }

    var btn = document.getElementById('place-order-btn');
    if(btn){
      btn.textContent = cartItems.length === 0 ? 'Add items to cart first' : 'Place Order →';
      btn.disabled = cartItems.length === 0;
      btn.style.opacity = cartItems.length === 0 ? '0.5' : '1';
      btn.style.cursor = cartItems.length === 0 ? 'not-allowed' : 'pointer';
    }
  };

  window.addToCart = function(btn, name, price){
    var imgEl = btn ? btn.closest('[class*="group"]') : null;
    var img = imgEl ? (imgEl.querySelector('img') ? imgEl.querySelector('img').src.split('/seed/')[1].split('/')[0] : 'product') : 'product';
    var existing = cartItems.find(function(i){ return i.name === name; });
    if(existing){ existing.qty++; } else { cartItems.push({name:name, price:price, img:img, qty:1}); }
    window._cartItems = cartItems;
    window.updateCartUI();
    if(btn){
      var orig = btn.innerHTML;
      btn.innerHTML = '<svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg> Added!';
      btn.style.background = '#16a34a';
      btn.style.borderColor = '#16a34a';
      setTimeout(function(){ btn.innerHTML = orig; btn.style.background = ''; btn.style.borderColor = ''; }, 1500);
    }
  };

  window.changeQty = function(idx, delta){
    if(!cartItems[idx]) return;
    cartItems[idx].qty += delta;
    if(cartItems[idx].qty <= 0) cartItems.splice(idx, 1);
    window._cartItems = cartItems;
    window.updateCartUI();
  };

  window.removeFromCart = function(idx){
    cartItems.splice(idx, 1);
    window._cartItems = cartItems;
    window.updateCartUI();
  };

  window.addToWishlist = function(btn){
    var svg = btn ? btn.querySelector('svg') : null;
    if(svg){ svg.style.color = '#ef4444'; svg.setAttribute('fill','currentColor'); }
    var heart = document.createElement('div');
    heart.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;background:#ef4444;color:white;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(239,68,68,0.4);animation:fadeIn 0.3s ease;';
    heart.textContent = '♥ Added to Wishlist';
    document.body.appendChild(heart);
    setTimeout(function(){ heart.remove(); }, 2000);
  };

  // ── PAYMENT SELECTION ────────────────────────────────────────────────────────
  window.selectedPayment = 'stripe';
  window.selectPaymentMethod = function(method, btn){
    window.selectedPayment = method;
    document.querySelectorAll('.payment-method-btn').forEach(function(b){
      b.style.borderColor = '#e2e8f0';
      b.style.background = 'white';
      b.classList.remove('border-indigo-500','bg-indigo-50','border-blue-500','bg-blue-50','border-green-500','bg-green-50');
    });
    if(btn){
      if(method==='stripe'){ btn.style.borderColor='#6366f1'; btn.style.background='#eef2ff'; }
      else if(method==='gpay'){ btn.style.borderColor='#2563eb'; btn.style.background='#eff6ff'; }
      else if(method==='paypal'){ btn.style.borderColor='#0070ba'; btn.style.background='#eff6ff'; }
      else if(method==='cod'){ btn.style.borderColor='#16a34a'; btn.style.background='#f0fdf4'; }
    }
    ['stripe-fields','gpay-info','paypal-info','cod-info'].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.classList.add('hidden');
    });
    var show = method==='stripe'?'stripe-fields':method==='gpay'?'gpay-info':method==='paypal'?'paypal-info':'cod-info';
    var showEl = document.getElementById(show);
    if(showEl) showEl.classList.remove('hidden');
  };

  window.formatCardNumber = function(input){
    var v = input.value.replace(/\D/g,'').slice(0,16);
    input.value = v.replace(/(\d{4})(?=\d)/g,'$1 ');
  };
  window.formatExpiry = function(input){
    var v = input.value.replace(/\D/g,'');
    if(v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4);
    input.value = v;
  };
  window.formatCard = window.formatCardNumber;

  // ── PLACE ORDER ──────────────────────────────────────────────────────────────
  window.placeOrder = function(){
    if(cartItems.length === 0){
      alert('Please add items to your cart first!');
      window.navigateTo && window.navigateTo('shop');
      return;
    }
    var method = window.selectedPayment || 'stripe';
    var methodLabels = {stripe:'Credit/Debit Card', gpay:'Google Pay', paypal:'PayPal', cod:'Cash on Delivery'};
    var total = document.getElementById('checkout-total') ? document.getElementById('checkout-total').textContent : '$0.00';

    // Show processing animation
    var overlay = document.createElement('div');
    overlay.id = 'order-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);';
    overlay.innerHTML = '<div id="order-modal" style="background:white;border-radius:24px;padding:40px 36px;max-width:400px;width:90%;text-align:center;box-shadow:0 30px 60px rgba(0,0,0,0.4);">' +
      '<div id="order-loading" style="display:block">' +
      '<div style="width:56px;height:56px;border:4px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;margin:0 auto 16px;animation:spin 0.8s linear infinite;"></div>' +
      '<p style="font-size:16px;font-weight:700;color:#1e293b;margin:0 0 6px">Processing payment…</p>' +
      '<p style="font-size:13px;color:#64748b">Connecting to ' + methodLabels[method] + '</p></div>' +
      '<div id="order-success" style="display:none">' +
      '<div style="width:64px;height:64px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">' +
      '<svg style="width:32px;height:32px;color:#065f46" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>' +
      '<h3 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 8px">Order Placed! 🎉</h3>' +
      '<p style="color:#6b7280;font-size:14px;margin:0 0 4px">Amount: <strong>' + total + '</strong></p>' +
      '<p style="color:#6b7280;font-size:13px;margin:0 0 4px">Via: <strong>' + methodLabels[method] + '</strong></p>' +
      '<p style="color:#6b7280;font-size:13px;margin:0 0 24px">Order #VIS-' + Math.floor(Math.random()*90000+10000) + ' · Confirmation emailed</p>' +
      '<button onclick="window.closeOrder()" style="padding:12px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:12px;cursor:pointer;font-weight:700;font-size:15px;box-shadow:0 4px 14px rgba(99,102,241,0.4);">Continue Shopping</button></div>' +
      '</div>';
    document.body.appendChild(overlay);

    // Add spin keyframe if needed
    if(!document.getElementById('vi-spin-style')){
      var st = document.createElement('style');
      st.id = 'vi-spin-style';
      st.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(st);
    }

    setTimeout(function(){
      var loading = document.getElementById('order-loading');
      var success = document.getElementById('order-success');
      if(loading) loading.style.display = 'none';
      if(success) success.style.display = 'block';
    }, 1800);
  };

  window.closeOrder = function(){
    var overlay = document.getElementById('order-overlay');
    if(overlay) overlay.remove();
    cartItems.length = 0;
    window._cartItems = cartItems;
    window.updateCartUI();
    window.navigateTo && window.navigateTo('shop');
  };

  // ── AUTH FUNCTIONS ────────────────────────────────────────────────────────────
  window.switchAuthTab = function(tab){
    var lf = document.getElementById('login-form');
    var sf = document.getElementById('signup-form');
    var lt = document.getElementById('tab-login');
    var st = document.getElementById('tab-signup');
    if(!lf || !sf) return;
    if(tab === 'login'){
      lf.classList.remove('hidden'); sf.classList.add('hidden');
      if(lt) lt.className = 'flex-1 py-2 rounded-lg text-sm font-semibold bg-white shadow text-indigo-600 transition-all';
      if(st) st.className = 'flex-1 py-2 rounded-lg text-sm font-semibold text-slate-500 transition-all';
    } else {
      sf.classList.remove('hidden'); lf.classList.add('hidden');
      if(st) st.className = 'flex-1 py-2 rounded-lg text-sm font-semibold bg-white shadow text-indigo-600 transition-all';
      if(lt) lt.className = 'flex-1 py-2 rounded-lg text-sm font-semibold text-slate-500 transition-all';
    }
  };

  function showPopup(icon, title, msg, btn){
    var o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    o.innerHTML = '<div style="background:white;border-radius:20px;padding:36px;text-align:center;max-width:320px;width:90%;box-shadow:0 25px 50px rgba(0,0,0,0.3);">' +
      '<div style="font-size:44px;margin-bottom:14px">' + icon + '</div>' +
      '<p style="font-weight:800;font-size:19px;margin:0 0 8px;color:#111827">' + title + '</p>' +
      '<p style="color:#6b7280;font-size:13px;margin:0 0 22px;line-height:1.5">' + msg + '</p>' +
      '<button onclick="this.closest(\'div\').parentElement.remove()" style="padding:11px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:11px;cursor:pointer;font-weight:700;font-size:14px;">' + btn + '</button></div>';
    document.body.appendChild(o);
  }

  window.handleSocialAuth = function(provider){ showPopup('🔐', provider + ' Sign In', 'In production, integrate the ' + provider + ' OAuth SDK. This is a UI demo.', 'Got it'); };
  window.handleEmailLogin = function(){ showPopup('✅', 'Signed In!', 'In production, connect Firebase, Supabase, or your own auth backend here.', 'Continue'); };
  window.handleEmailSignup = function(){ showPopup('🎉', 'Account Created!', 'In production, connect your auth backend to save user data securely.', 'Get Started'); };
  window.handleContactSubmit = function(){ showPopup('📬', 'Message Sent!', 'We\'ll get back to you within 24 hours. Thanks for reaching out!', 'Close'); };

  // Init
  window.updateCartUI();
})();
</script>`;
