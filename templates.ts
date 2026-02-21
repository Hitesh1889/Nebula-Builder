
// ─────────────────────────────────────────────────────────────────────────────
// VISINARO — Injected section templates
// These replace placeholder comments in AI-generated HTML so the AI doesn't
// have to generate these heavyweight sections and slow down generation.
// ─────────────────────────────────────────────────────────────────────────────

// ── AUTH / LOGIN ──────────────────────────────────────────────────────────────
export const AUTH_TEMPLATE = `
<section id="auth" class="page-section min-h-screen w-full hidden flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-16">
  <div class="w-full max-w-md">
    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 pt-10 pb-8 text-center">
        <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </div>
        <h2 class="text-2xl font-bold text-white" id="auth-title">Welcome Back</h2>
        <p class="text-indigo-100 text-sm mt-1" id="auth-subtitle">Sign in to your account</p>
      </div>

      <div class="px-8 py-6">
        <!-- Tab Toggle -->
        <div class="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button id="tab-login" onclick="switchAuthTab('login')" class="flex-1 py-2 rounded-lg text-sm font-semibold bg-white shadow text-indigo-600 transition-all">Sign In</button>
          <button id="tab-signup" onclick="switchAuthTab('signup')" class="flex-1 py-2 rounded-lg text-sm font-semibold text-slate-500 transition-all">Create Account</button>
        </div>

        <!-- Login Form -->
        <div id="login-form">
          <div class="space-y-4">
            <input type="email" placeholder="Email address" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"/>
            <div class="relative">
              <input type="password" placeholder="Password" id="login-pwd" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-12"/>
              <button onclick="document.getElementById('login-pwd').type = document.getElementById('login-pwd').type === 'password' ? 'text' : 'password'" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
            <div class="flex items-center justify-between text-xs">
              <label class="flex items-center gap-2 text-slate-600 cursor-pointer"><input type="checkbox" class="rounded"/> Remember me</label>
              <a href="#" class="text-indigo-600 hover:underline font-medium">Forgot password?</a>
            </div>
            <button onclick="showAuthSuccess()" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:scale-[1.02]">
              Sign In →
            </button>
          </div>
        </div>

        <!-- Signup Form (hidden by default) -->
        <div id="signup-form" class="hidden">
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <input type="text" placeholder="First name" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
              <input type="text" placeholder="Last name" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            </div>
            <input type="email" placeholder="Email address" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="tel" placeholder="Phone number" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <input type="password" placeholder="Create password" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
            <button onclick="showAuthSuccess()" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:scale-[1.02]">
              Create Account →
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-4 my-5">
          <div class="flex-1 h-px bg-slate-200"></div>
          <span class="text-xs text-slate-400 font-medium">or continue with</span>
          <div class="flex-1 h-px bg-slate-200"></div>
        </div>

        <!-- Social Login Buttons -->
        <div class="grid grid-cols-3 gap-3">
          <button onclick="showSocialAuth('Google')" class="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group">
            <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span class="text-xs font-medium text-slate-600">Google</span>
          </button>
          <button onclick="showSocialAuth('Facebook')" class="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-blue-50 transition-all">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span class="text-xs font-medium text-slate-600">Facebook</span>
          </button>
          <button onclick="showSocialAuth('Instagram')" class="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-pink-50 transition-all">
            <svg class="w-5 h-5" viewBox="0 0 24 24"><defs><radialGradient id="ig1" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#fd5"/><stop offset="10%" stop-color="#fd5"/><stop offset="50%" stop-color="#ff543e"/><stop offset="100%" stop-color="#c837ab"/></radialGradient></defs><rect width="24" height="24" rx="5" fill="url(#ig1)"/><rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="white" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" stroke-width="1.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="white"/></svg>
            <span class="text-xs font-medium text-slate-600">Instagram</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Auth Success Toast -->
  <div id="auth-toast" class="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl font-semibold text-sm hidden flex items-center gap-2">
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
    <span id="auth-toast-msg">Signed in successfully!</span>
  </div>
  <script>
    function switchAuthTab(tab) {
      const isLogin = tab === 'login';
      document.getElementById('login-form').classList.toggle('hidden', !isLogin);
      document.getElementById('signup-form').classList.toggle('hidden', isLogin);
      document.getElementById('tab-login').className = 'flex-1 py-2 rounded-lg text-sm font-semibold transition-all ' + (isLogin ? 'bg-white shadow text-indigo-600' : 'text-slate-500');
      document.getElementById('tab-signup').className = 'flex-1 py-2 rounded-lg text-sm font-semibold transition-all ' + (!isLogin ? 'bg-white shadow text-indigo-600' : 'text-slate-500');
      document.getElementById('auth-title').textContent = isLogin ? 'Welcome Back' : 'Create Account';
      document.getElementById('auth-subtitle').textContent = isLogin ? 'Sign in to your account' : 'Join thousands of happy users';
    }
    function showAuthSuccess() {
      const toast = document.getElementById('auth-toast');
      toast.classList.remove('hidden'); toast.classList.add('flex');
      setTimeout(() => { toast.classList.add('hidden'); toast.classList.remove('flex'); }, 3000);
    }
    function showSocialAuth(provider) {
      const toast = document.getElementById('auth-toast');
      document.getElementById('auth-toast-msg').textContent = 'Redirecting to ' + provider + '...';
      toast.classList.remove('hidden'); toast.classList.add('flex');
      setTimeout(() => { toast.classList.add('hidden'); toast.classList.remove('flex'); }, 2500);
    }
  </script>
</section>`;

// ── SHOP ──────────────────────────────────────────────────────────────────────
export const SHOP_TEMPLATE = `
<section id="shop" class="page-section min-h-screen w-full hidden bg-slate-50">
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-3xl font-bold text-slate-900">Our Shop</h2>
        <p class="text-slate-500 mt-1">Discover our curated collection</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <input type="text" placeholder="Search products..." class="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"/>
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <select class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none"><option>All Categories</option><option>Featured</option><option>New Arrivals</option><option>Best Sellers</option></select>
      </div>
    </div>
    <!-- Product Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${Array.from({length: 6}, (_, i) => {
        const products = [
          {name:'Premium Wireless Headphones',price:'₹2,999',usd:'$36',img:'headphones',rating:5,badge:'Best Seller'},
          {name:'Artisan Coffee Blend 250g',price:'₹599',usd:'$7',img:'coffee',rating:4,badge:'New'},
          {name:'Handcrafted Leather Wallet',price:'₹1,499',usd:'$18',img:'leather',rating:5,badge:''},
          {name:'Organic Face Serum 30ml',price:'₹899',usd:'$11',img:'serum',rating:4,badge:'Hot'},
          {name:'Minimal Desk Organizer',price:'₹1,199',usd:'$14',img:'desk',rating:5,badge:''},
          {name:'Canvas Tote Bag',price:'₹799',usd:'$10',img:'tote',rating:4,badge:'Sale'},
        ];
        const p = products[i];
        return `
      <div class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div class="relative overflow-hidden">
          <img src="https://picsum.photos/seed/${p.img}${i+1}/600/400" alt="${p.name}" class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"/>
          ${p.badge ? `<span class="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">${p.badge}</span>` : ''}
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button class="bg-white text-slate-900 font-bold text-sm px-5 py-2 rounded-full shadow-lg hover:bg-indigo-600 hover:text-white transition-colors">Quick View</button>
          </div>
        </div>
        <div class="p-5">
          <h3 class="font-bold text-slate-900 mb-1">${p.name}</h3>
          <div class="flex items-center gap-1 mb-3">${'<svg class="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>'.repeat(p.rating)}</div>
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xl font-bold text-indigo-600">${p.price}</span>
              <span class="text-xs text-slate-400 ml-1">${p.usd}</span>
            </div>
            <button class="add-to-cart bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all hover:scale-105" data-name="${p.name}" data-price="${p.price}">Add to Cart</button>
          </div>
        </div>
      </div>`;
      }).join('')}
    </div>
  </div>
</section>`;

// ── CART ──────────────────────────────────────────────────────────────────────
export const CART_TEMPLATE = `
<section id="cart" class="page-section min-h-screen w-full hidden bg-slate-50">
  <div class="max-w-6xl mx-auto px-4 py-12">
    <h2 class="text-3xl font-bold text-slate-900 mb-8">🛒 Your Cart <span class="cart-badge-text text-lg font-normal text-slate-500">(2 items)</span></h2>
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Cart Items -->
      <div class="flex-1 space-y-4" id="cart-items-container">
        <div class="bg-white rounded-2xl shadow-sm p-6 flex gap-5 items-center">
          <img src="https://picsum.photos/seed/cartitem1/200/200" class="w-24 h-24 rounded-xl object-cover"/>
          <div class="flex-1">
            <h3 class="font-bold text-slate-900">Premium Wireless Headphones</h3>
            <p class="text-sm text-slate-500 mt-0.5">Color: Midnight Black</p>
            <p class="text-indigo-600 font-bold mt-1">₹2,999</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="updateQty(this,-1)" class="w-8 h-8 rounded-full border-2 border-slate-200 hover:border-indigo-500 flex items-center justify-center font-bold text-slate-600 transition-colors">−</button>
            <span class="qty-val font-bold w-6 text-center">1</span>
            <button onclick="updateQty(this,1)" class="w-8 h-8 rounded-full border-2 border-slate-200 hover:border-indigo-500 flex items-center justify-center font-bold text-slate-600 transition-colors">+</button>
          </div>
          <button onclick="this.closest('.bg-white').remove(); recalcCart();" class="text-slate-300 hover:text-red-500 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="bg-white rounded-2xl shadow-sm p-6 flex gap-5 items-center">
          <img src="https://picsum.photos/seed/cartitem2/200/200" class="w-24 h-24 rounded-xl object-cover"/>
          <div class="flex-1">
            <h3 class="font-bold text-slate-900">Artisan Coffee Blend 250g</h3>
            <p class="text-sm text-slate-500 mt-0.5">Roast: Medium Dark</p>
            <p class="text-indigo-600 font-bold mt-1">₹599</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="updateQty(this,-1)" class="w-8 h-8 rounded-full border-2 border-slate-200 hover:border-indigo-500 flex items-center justify-center font-bold text-slate-600 transition-colors">−</button>
            <span class="qty-val font-bold w-6 text-center">2</span>
            <button onclick="updateQty(this,1)" class="w-8 h-8 rounded-full border-2 border-slate-200 hover:border-indigo-500 flex items-center justify-center font-bold text-slate-600 transition-colors">+</button>
          </div>
          <button onclick="this.closest('.bg-white').remove(); recalcCart();" class="text-slate-300 hover:text-red-500 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <!-- Promo Code -->
        <div class="bg-white rounded-2xl shadow-sm p-5 flex gap-3">
          <input type="text" placeholder="Promo code (try: SAVE10)" class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
          <button onclick="applyPromo()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors">Apply</button>
        </div>
      </div>
      <!-- Order Summary -->
      <div class="lg:w-80">
        <div class="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
          <h3 class="font-bold text-slate-900 text-lg mb-4">Order Summary</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-slate-600">Subtotal</span><span class="font-medium" id="cart-subtotal">₹4,197</span></div>
            <div class="flex justify-between"><span class="text-slate-600">Shipping</span><span class="text-green-600 font-medium">FREE</span></div>
            <div class="flex justify-between hidden" id="promo-row"><span class="text-green-600">Promo (SAVE10)</span><span class="text-green-600 font-medium">−₹420</span></div>
            <div class="border-t border-slate-100 pt-3 flex justify-between"><span class="font-bold text-slate-900">Total</span><span class="font-bold text-xl text-indigo-600" id="cart-total">₹4,197</span></div>
          </div>
          <button onclick="document.querySelectorAll('.page-section').forEach(s=>{s.style.display='none';s.classList.add('hidden')});document.getElementById('checkout').style.display='block';document.getElementById('checkout').classList.remove('hidden');window.scrollTo(0,0);" class="mt-6 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02]">
            Proceed to Checkout →
          </button>
          <button onclick="document.querySelectorAll('.page-section').forEach(s=>{s.style.display='none';s.classList.add('hidden')});document.getElementById('shop').style.display='block';document.getElementById('shop').classList.remove('hidden');window.scrollTo(0,0);" class="mt-3 w-full py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-sm transition-colors">
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  </div>
  <script>
    function updateQty(btn, delta) {
      const span = btn.parentElement.querySelector('.qty-val');
      let v = parseInt(span.textContent) + delta;
      if (v < 1) v = 1;
      span.textContent = v;
      recalcCart();
    }
    function recalcCart() {
      document.querySelectorAll('.cart-badge').forEach(el => el.textContent = document.querySelectorAll('#cart-items-container .bg-white').length - 1);
    }
    function applyPromo() {
      document.getElementById('promo-row').classList.remove('hidden');
      document.getElementById('cart-total').textContent = '₹3,777';
    }
  </script>
</section>`;

// ── CHECKOUT ──────────────────────────────────────────────────────────────────
export const CHECKOUT_TEMPLATE = `
<section id="checkout" class="page-section min-h-screen w-full hidden bg-slate-50">
  <div class="max-w-6xl mx-auto px-4 py-12">
    <!-- Progress Steps -->
    <div class="flex items-center justify-center gap-4 mb-10">
      <div class="flex items-center gap-2 text-indigo-600 font-bold text-sm"><div class="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>Cart</div>
      <div class="flex-1 max-w-16 h-0.5 bg-indigo-300 rounded"></div>
      <div class="flex items-center gap-2 text-indigo-600 font-bold text-sm"><div class="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>Shipping</div>
      <div class="flex-1 max-w-16 h-0.5 bg-slate-200 rounded"></div>
      <div class="flex items-center gap-2 text-slate-400 text-sm"><div class="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>Payment</div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Forms -->
      <div class="flex-1 space-y-6">
        <!-- Shipping -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h3 class="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
            Shipping Address
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input type="tel" placeholder="Phone Number" class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input type="text" placeholder="Address Line 1" class="sm:col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input type="text" placeholder="City" class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input type="text" placeholder="State" class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input type="text" placeholder="Pincode" class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
            <select class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"><option>India</option><option>USA</option><option>UK</option><option>UAE</option><option>Singapore</option></select>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h3 class="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            Payment Method
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Razorpay -->
            <button onclick="showPaymentModal('Razorpay','🇮🇳 India\'s most trusted payment gateway')" class="payment-btn group flex items-center gap-4 p-4 border-2 border-orange-200 hover:border-orange-500 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all text-left">
              <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <svg viewBox="0 0 24 24" class="w-8 h-8"><text y="18" font-size="14" font-weight="900" fill="#2563EB">R</text></svg>
                <span class="font-black text-blue-600 text-lg leading-none">R</span>
              </div>
              <div>
                <p class="font-bold text-slate-900 text-sm">Razorpay</p>
                <p class="text-xs text-slate-500">Cards, UPI, NetBanking, EMI</p>
                <span class="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">🇮🇳 India</span>
              </div>
            </button>
            <!-- Stripe -->
            <button onclick="showPaymentModal('Stripe','🌍 International card payments in 135+ currencies')" class="payment-btn group flex items-center gap-4 p-4 border-2 border-indigo-200 hover:border-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all text-left">
              <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <span class="font-black text-white text-lg">S</span>
              </div>
              <div>
                <p class="font-bold text-slate-900 text-sm">Stripe</p>
                <p class="text-xs text-slate-500">Visa, Mastercard, AMEX</p>
                <span class="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">🌍 Global</span>
              </div>
            </button>
            <!-- PayPal -->
            <button onclick="showPaymentModal('PayPal','🌐 200+ countries, buyer protection')" class="payment-btn group flex items-center gap-4 p-4 border-2 border-yellow-200 hover:border-yellow-400 bg-yellow-50 hover:bg-yellow-100 rounded-2xl transition-all text-left">
              <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-yellow-200">
                <span class="font-black text-blue-800 text-lg">P</span><span class="font-black text-blue-400 text-lg">P</span>
              </div>
              <div>
                <p class="font-bold text-slate-900 text-sm">PayPal</p>
                <p class="text-xs text-slate-500">Fast, secure, worldwide</p>
                <span class="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full font-bold">🌐 200+ Countries</span>
              </div>
            </button>
            <!-- COD -->
            <button onclick="showPaymentModal('Cash on Delivery','📦 Pay when your order arrives')" class="payment-btn group flex items-center gap-4 p-4 border-2 border-green-200 hover:border-green-500 bg-green-50 hover:bg-green-100 rounded-2xl transition-all text-left">
              <div class="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <div>
                <p class="font-bold text-slate-900 text-sm">Cash on Delivery</p>
                <p class="text-xs text-slate-500">Pay when it arrives</p>
                <span class="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">✅ No card needed</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Order Summary Sidebar -->
      <div class="lg:w-80">
        <div class="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
          <h3 class="font-bold text-slate-900 text-lg mb-4">Order Summary</h3>
          <div class="space-y-3 mb-4">
            <div class="flex gap-3 items-center py-2 border-b border-slate-50">
              <img src="https://picsum.photos/seed/orderprod1/100/100" class="w-12 h-12 rounded-lg object-cover"/>
              <div class="flex-1 text-sm"><p class="font-medium text-slate-900">Wireless Headphones</p><p class="text-slate-500">Qty: 1</p></div>
              <span class="font-bold text-slate-900 text-sm">₹2,999</span>
            </div>
            <div class="flex gap-3 items-center py-2 border-b border-slate-50">
              <img src="https://picsum.photos/seed/orderprod2/100/100" class="w-12 h-12 rounded-lg object-cover"/>
              <div class="flex-1 text-sm"><p class="font-medium text-slate-900">Artisan Coffee Blend</p><p class="text-slate-500">Qty: 2</p></div>
              <span class="font-bold text-slate-900 text-sm">₹1,198</span>
            </div>
          </div>
          <div class="space-y-2 text-sm border-t border-slate-100 pt-3">
            <div class="flex justify-between"><span class="text-slate-600">Subtotal</span><span>₹4,197</span></div>
            <div class="flex justify-between"><span class="text-slate-600">Shipping</span><span class="text-green-600 font-medium">FREE</span></div>
            <div class="flex justify-between"><span class="text-slate-600">Tax (18% GST)</span><span>₹755</span></div>
            <div class="border-t border-slate-100 pt-2 flex justify-between font-bold"><span>Total</span><span class="text-indigo-600 text-lg">₹4,952</span></div>
          </div>
          <div class="mt-3 p-3 bg-green-50 rounded-xl text-xs text-green-700 flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            256-bit SSL encryption · 100% secure checkout
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Modal -->
  <div id="payment-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
      <div class="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h3 id="modal-provider-title" class="text-xl font-bold text-slate-900 mb-2">Redirecting to Razorpay...</h3>
      <p id="modal-provider-desc" class="text-slate-500 text-sm mb-6"></p>
      <div class="w-full bg-slate-100 rounded-full h-2 mb-6"><div class="bg-indigo-600 h-2 rounded-full animate-pulse w-3/4"></div></div>
      <p class="text-xs text-slate-400 mb-4">🔒 You will be redirected to a secure payment page</p>
      <button onclick="placeOrder()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">Confirm & Pay ₹4,952</button>
      <button onclick="document.getElementById('payment-modal').style.display='none'" class="mt-3 w-full py-2 text-slate-500 hover:text-slate-700 text-sm">← Go Back</button>
    </div>
  </div>

  <!-- Order Success Modal -->
  <div id="order-success-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg class="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      </div>
      <h3 class="text-2xl font-bold text-slate-900 mb-2">Order Placed! 🎉</h3>
      <p class="text-slate-500 text-sm mb-2">Your order #VIS-<span id="order-id">28491</span> has been confirmed.</p>
      <p class="text-slate-400 text-xs mb-6">Estimated delivery: 3–5 business days</p>
      <button onclick="document.getElementById('order-success-modal').style.display='none'; document.querySelectorAll('.page-section').forEach(s=>{s.style.display='none';s.classList.add('hidden')}); document.getElementById('home').style.display='block'; document.getElementById('home').classList.remove('hidden');" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">Continue Shopping</button>
    </div>
  </div>

  <script>
    function showPaymentModal(provider, desc) {
      document.getElementById('modal-provider-title').textContent = 'Redirecting to ' + provider + '...';
      document.getElementById('modal-provider-desc').textContent = desc;
      const modal = document.getElementById('payment-modal');
      modal.style.display = 'flex';
      modal.classList.remove('hidden');
    }
    function placeOrder() {
      document.getElementById('payment-modal').style.display = 'none';
      document.getElementById('order-id').textContent = Math.floor(10000 + Math.random() * 90000);
      const m = document.getElementById('order-success-modal');
      m.style.display = 'flex';
      m.classList.remove('hidden');
    }
  </script>
</section>`;

// ── CONTACT ───────────────────────────────────────────────────────────────────
export const CONTACT_TEMPLATE = `
<section id="contact" class="page-section min-h-screen w-full hidden flex flex-col relative bg-slate-50 overflow-hidden">
  <div class="absolute top-0 left-0 w-full h-80 bg-indigo-600 rounded-b-[4rem] z-0"></div>
  <div class="relative z-10 container mx-auto px-6 py-24 flex-1 flex flex-col justify-center">
    <div class="text-center mb-14">
      <h2 class="text-4xl font-serif font-bold text-white mb-3">Get in Touch</h2>
      <p class="text-indigo-100 max-w-xl mx-auto">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
    </div>
    <div class="max-w-4xl mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
      <div class="bg-slate-900 p-10 md:w-2/5 text-white flex flex-col justify-between">
        <div>
          <h3 class="text-2xl font-bold mb-6">Contact Info</h3>
          <div class="space-y-5">
            <div class="flex items-start gap-4"><div class="p-2 bg-white/10 rounded-lg"><svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></div><div><p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Phone</p><p class="font-medium">+91 98765 43210</p></div></div>
            <div class="flex items-start gap-4"><div class="p-2 bg-white/10 rounded-lg"><svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div><div><p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email</p><p class="font-medium">hello@visinaro.com</p></div></div>
            <div class="flex items-start gap-4"><div class="p-2 bg-white/10 rounded-lg"><svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg></div><div><p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Address</p><p class="font-medium">Bangalore, Karnataka 560001</p></div></div>
          </div>
        </div>
        <div class="flex gap-3 mt-8">
          <a href="#" class="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          <a href="#" class="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
          <a href="#" class="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        </div>
      </div>
      <div class="p-10 flex-1">
        <h3 class="text-xl font-bold text-slate-900 mb-6">Send a Message</h3>
        <form onsubmit="submitContact(event)" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Your Name" required class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input type="email" placeholder="Email" required class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>
          <input type="text" placeholder="Subject" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
          <textarea placeholder="Your message..." rows="4" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
          <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/30">
            Send Message →
          </button>
        </form>
        <div id="contact-success" class="hidden mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Message sent! We'll get back to you within 24 hours.
        </div>
      </div>
    </div>
  </div>
  <script>
    function submitContact(e) {
      e.preventDefault();
      const s = document.getElementById('contact-success');
      s.classList.remove('hidden'); s.classList.add('flex');
      e.target.reset();
    }
  </script>
</section>`;

// ── FOOTER ─────────────────────────────────────────────────────────────────────
export const FOOTER_TEMPLATE = `
<footer class="bg-slate-900 text-slate-400 py-12 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      <div class="col-span-2 md:col-span-1">
        <div class="flex items-center gap-2 mb-4">
          <svg viewBox="0 0 32 32" fill="none" class="w-8 h-8"><path d="M8 6V26" stroke="#F97316" stroke-width="4" stroke-linecap="round"/><path d="M24 6V26" stroke="#10B981" stroke-width="4" stroke-linecap="round"/><path d="M8 26L24 6" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/></svg>
          <span class="text-white font-bold text-lg">Visinaro</span>
        </div>
        <p class="text-sm leading-relaxed mb-4">Built with AI-powered web generation. Create stunning websites in seconds.</p>
      </div>
      <div><h4 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Company</h4><ul class="space-y-2 text-sm"><li><a href="#home" class="hover:text-white transition-colors">Home</a></li><li><a href="#about" class="hover:text-white transition-colors">About</a></li><li><a href="#services" class="hover:text-white transition-colors">Services</a></li><li><a href="#portfolio" class="hover:text-white transition-colors">Portfolio</a></li></ul></div>
      <div><h4 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Support</h4><ul class="space-y-2 text-sm"><li><a href="#contact" class="hover:text-white transition-colors">Contact Us</a></li><li><a href="#" class="hover:text-white transition-colors">FAQ</a></li><li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li><li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li></ul></div>
      <div><h4 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Follow Us</h4><div class="flex gap-3"><a href="#" class="p-2 bg-white/5 hover:bg-white/15 rounded-lg transition-colors"><svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a><a href="#" class="p-2 bg-white/5 hover:bg-white/15 rounded-lg transition-colors"><svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a></div></div>
    </div>
    <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
      <p>© ${new Date().getFullYear()} Visinaro. Generated with AI. All rights reserved.</p>
      <p>Made with ❤️ · Powered by Groq + OpenRouter</p>
    </div>
  </div>
</footer>`;

// ─── AUTH_SCRIPTS — JavaScript for login/signup tab switching ────────────────
export const AUTH_SCRIPTS = `
<script data-visinaro-injected="true">
  function switchTab(tab) {
    const loginForm  = document.getElementById('form-login');
    const signupForm = document.getElementById('form-signup');
    const loginTab   = document.getElementById('tab-login');
    const signupTab  = document.getElementById('tab-signup');
    if (!loginForm || !signupForm) return;
    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      if (loginTab)  { loginTab.className  = 'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all bg-white text-slate-900 shadow-lg'; }
      if (signupTab) { signupTab.className = 'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all text-slate-400 hover:text-white'; }
    } else {
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      if (signupTab) { signupTab.className  = 'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all bg-white text-slate-900 shadow-lg'; }
      if (loginTab)  { loginTab.className   = 'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all text-slate-400 hover:text-white'; }
    }
  }
  function handleSocialAuth(provider) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = '<div style="background:#1e293b;border:1px solid rgba(255,255,255,0.1);padding:32px;border-radius:24px;text-align:center;max-width:320px;">'
      + '<div style="font-size:40px;margin-bottom:12px">🔐</div>'
      + '<p style="color:white;font-weight:bold;font-size:16px;margin-bottom:6px">Connect ' + provider + '</p>'
      + '<p style="color:#94a3b8;font-size:13px;margin-bottom:20px">In production, integrate the ' + provider + ' OAuth SDK here.</p>'
      + '<button onclick="this.closest(\'div\').parentElement.remove()" style="padding:10px 28px;background:#4f46e5;color:white;border:none;border-radius:12px;cursor:pointer;font-weight:600;font-size:14px">Got it</button>'
      + '</div>';
    document.body.appendChild(overlay);
  }
  function handleEmailLogin()  { alert('✅ Sign in successful!\n\nConnect your backend auth (Firebase / Supabase / custom) here.'); }
  function handleEmailSignup() { alert('🎉 Account created!\n\nConnect your backend auth (Firebase / Supabase / custom) here.'); }
</script>
`;
