// Templates injected into AI-generated HTML by aiService.inject()

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const AUTH_TEMPLATE = `
<section id="auth" class="page-section w-full min-h-screen hidden">
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b);padding:4rem 1rem">
    <div style="width:100%;max-width:26rem">
      <div style="background:white;border-radius:1.5rem;box-shadow:0 40px 80px rgba(0,0,0,0.4);overflow:hidden">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:2.5rem 2rem 2rem;text-align:center">
          <div style="width:4rem;height:4rem;background:rgba(255,255,255,0.2);border-radius:1rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <svg width="28" height="28" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <h2 style="color:white;font-size:1.5rem;font-weight:800;margin:0 0 .25rem">Welcome Back</h2>
          <p style="color:rgba(255,255,255,0.8);font-size:.875rem;margin:0">Sign in to your account</p>
        </div>
        <div style="padding:2rem">
          <div style="display:flex;background:#f1f5f9;border-radius:.75rem;padding:.25rem;margin-bottom:1.5rem">
            <button id="tab-login" onclick="window.switchAuthTab('login')" style="flex:1;padding:.5rem;border-radius:.5rem;font-size:.875rem;font-weight:600;background:white;box-shadow:0 1px 3px rgba(0,0,0,.1);color:#6366f1;border:none;cursor:pointer">Sign In</button>
            <button id="tab-signup" onclick="window.switchAuthTab('signup')" style="flex:1;padding:.5rem;border-radius:.5rem;font-size:.875rem;font-weight:600;background:transparent;color:#64748b;border:none;cursor:pointer">Create Account</button>
          </div>
          <div id="login-form">
            <div style="display:flex;flex-direction:column;gap:.75rem">
              <input type="email" placeholder="Email address" style="width:100%;padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;box-sizing:border-box;outline:none"/>
              <input type="password" placeholder="Password" style="width:100%;padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;box-sizing:border-box;outline:none"/>
              <button onclick="window.handleEmailLogin()" style="width:100%;padding:.875rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:700;border-radius:.75rem;border:none;cursor:pointer;font-size:1rem;margin-top:.25rem">Sign In →</button>
            </div>
          </div>
          <div id="signup-form" style="display:none">
            <div style="display:flex;flex-direction:column;gap:.75rem">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
                <input type="text" placeholder="First name" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box"/>
                <input type="text" placeholder="Last name" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box"/>
              </div>
              <input type="email" placeholder="Email address" style="width:100%;padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;box-sizing:border-box;outline:none"/>
              <input type="password" placeholder="Password" style="width:100%;padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;box-sizing:border-box;outline:none"/>
              <button onclick="window.handleEmailSignup()" style="width:100%;padding:.875rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:700;border-radius:.75rem;border:none;cursor:pointer;font-size:1rem;margin-top:.25rem">Create Account →</button>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:1rem;margin:1.25rem 0">
            <div style="flex:1;height:1px;background:#e2e8f0"></div>
            <span style="font-size:.75rem;color:#94a3b8">or continue with</span>
            <div style="flex:1;height:1px;background:#e2e8f0"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem">
            <button onclick="window.handleSocialAuth('Google')" style="padding:.625rem;border:1.5px solid #e2e8f0;border-radius:.75rem;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.375rem;font-size:.75rem;font-weight:600;color:#374151">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button onclick="window.handleSocialAuth('Facebook')" style="padding:.625rem;border:1.5px solid #e2e8f0;border-radius:.75rem;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.375rem;font-size:.75rem;font-weight:600;color:#374151">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
            <button onclick="window.handleSocialAuth('Apple')" style="padding:.625rem;border:1.5px solid #e2e8f0;border-radius:.75rem;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.375rem;font-size:.75rem;font-weight:600;color:#374151">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ── CONTACT — neutral background, adapts to any site ─────────────────────────
export const CONTACT_TEMPLATE = `
<section id="contact" class="page-section w-full min-h-screen hidden" style="background:#f8fafc">
  <div style="max-width:72rem;margin:0 auto;padding:6rem 1.5rem">
    <div style="text-align:center;margin-bottom:3rem">
      <span style="display:inline-block;padding:.375rem 1rem;background:#ede9fe;color:#7c3aed;border-radius:9999px;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:1rem">Get In Touch</span>
      <h2 style="font-size:2.5rem;font-weight:800;color:#0f172a;margin-bottom:.75rem">Contact Us</h2>
      <p style="color:#64748b;max-width:36rem;margin:0 auto">Have a question or want to work together? We'd love to hear from you.</p>
    </div>
    <div style="display:grid;grid-template-columns:2fr 3fr;gap:3rem;align-items:start">
      <div style="display:flex;flex-direction:column;gap:1.25rem">
        <div style="background:white;border-radius:1rem;padding:1.25rem;display:flex;gap:1rem;align-items:flex-start;box-shadow:0 1px 3px rgba(0,0,0,.07)">
          <div style="padding:.625rem;background:#ede9fe;border-radius:.75rem;flex-shrink:0"><svg width="20" height="20" fill="none" stroke="#7c3aed" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
          <div><p style="font-size:.75rem;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:0 0 .25rem">Address</p><p style="color:#1e293b;font-weight:500;font-size:.9rem;margin:0">123 Main Street, Suite 100<br/>New York, NY 10001</p></div>
        </div>
        <div style="background:white;border-radius:1rem;padding:1.25rem;display:flex;gap:1rem;align-items:flex-start;box-shadow:0 1px 3px rgba(0,0,0,.07)">
          <div style="padding:.625rem;background:#ede9fe;border-radius:.75rem;flex-shrink:0"><svg width="20" height="20" fill="none" stroke="#7c3aed" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></div>
          <div><p style="font-size:.75rem;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:0 0 .25rem">Phone</p><p style="color:#1e293b;font-weight:500;font-size:.9rem;margin:0">+1 (555) 123-4567</p></div>
        </div>
        <div style="background:white;border-radius:1rem;padding:1.25rem;display:flex;gap:1rem;align-items:flex-start;box-shadow:0 1px 3px rgba(0,0,0,.07)">
          <div style="padding:.625rem;background:#ede9fe;border-radius:.75rem;flex-shrink:0"><svg width="20" height="20" fill="none" stroke="#7c3aed" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
          <div><p style="font-size:.75rem;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:0 0 .25rem">Email</p><p style="color:#1e293b;font-weight:500;font-size:.9rem;margin:0">hello@yoursite.com</p></div>
        </div>
      </div>
      <div style="background:white;border-radius:1.25rem;padding:2rem;box-shadow:0 4px 20px rgba(0,0,0,.08)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
          <input type="text" placeholder="Your name" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box;width:100%"/>
          <input type="email" placeholder="Email address" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box;width:100%"/>
        </div>
        <input type="text" placeholder="Subject" style="width:100%;padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box;margin-bottom:1rem"/>
        <textarea rows="5" placeholder="Your message..." style="width:100%;padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;resize:none;box-sizing:border-box;margin-bottom:1rem;font-family:inherit"></textarea>
        <button onclick="window.handleContactSubmit()" style="width:100%;padding:.875rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:700;border-radius:.75rem;border:none;cursor:pointer;font-size:1rem">Send Message →</button>
      </div>
    </div>
  </div>
</section>`;

// ── FOOTER ─────────────────────────────────────────────────────────────────────
export const FOOTER_TEMPLATE = `
<footer id="site-footer" style="background:#0f172a;color:#94a3b8;padding:3rem 1.5rem 2rem">
  <div style="max-width:72rem;margin:0 auto">
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:2rem;margin-bottom:3rem">
      <div>
        <div id="footer-brand" style="color:white;font-weight:700;font-size:1.1rem;margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem"></div>
        <p style="font-size:.875rem;line-height:1.7;max-width:20rem">Your trusted partner for quality service and outstanding results.</p>
      </div>
      <div>
        <h4 style="color:white;font-weight:600;margin-bottom:1rem;font-size:.875rem;text-transform:uppercase;letter-spacing:.05em">Company</h4>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.625rem">
          <li><a href="#home" style="color:#94a3b8;text-decoration:none;font-size:.875rem;hover:color:white">Home</a></li>
          <li><a href="#about" style="color:#94a3b8;text-decoration:none;font-size:.875rem">About</a></li>
          <li><a href="#services" style="color:#94a3b8;text-decoration:none;font-size:.875rem">Services</a></li>
          <li><a href="#portfolio" style="color:#94a3b8;text-decoration:none;font-size:.875rem">Portfolio</a></li>
        </ul>
      </div>
      <div>
        <h4 style="color:white;font-weight:600;margin-bottom:1rem;font-size:.875rem;text-transform:uppercase;letter-spacing:.05em">Support</h4>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.625rem">
          <li><a href="#contact" style="color:#94a3b8;text-decoration:none;font-size:.875rem">Contact Us</a></li>
          <li><a href="#" style="color:#94a3b8;text-decoration:none;font-size:.875rem">FAQ</a></li>
          <li><a href="#" style="color:#94a3b8;text-decoration:none;font-size:.875rem">Privacy Policy</a></li>
          <li><a href="#" style="color:#94a3b8;text-decoration:none;font-size:.875rem">Terms of Service</a></li>
        </ul>
      </div>
      <div>
        <h4 style="color:white;font-weight:600;margin-bottom:1rem;font-size:.875rem;text-transform:uppercase;letter-spacing:.05em">Follow Us</h4>
        <div style="display:flex;gap:.625rem;flex-wrap:wrap">
          <a href="#" style="width:2.25rem;height:2.25rem;background:rgba(255,255,255,.07);border-radius:.5rem;display:flex;align-items:center;justify-content:center;color:white;text-decoration:none">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" style="width:2.25rem;height:2.25rem;background:rgba(255,255,255,.07);border-radius:.5rem;display:flex;align-items:center;justify-content:center;color:white;text-decoration:none">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          </a>
          <a href="#" style="width:2.25rem;height:2.25rem;background:rgba(255,255,255,.07);border-radius:.5rem;display:flex;align-items:center;justify-content:center;color:white;text-decoration:none">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 3.677a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
        </div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,.08);padding-top:1.5rem;text-align:center">
      <p id="footer-copyright" style="font-size:.8rem;color:#475569;margin:0"></p>
    </div>
  </div>
</footer>
<script>
(function(){
  var brand = '';
  var navLogo = document.getElementById('nav-logo');
  if(navLogo) brand = navLogo.textContent.trim();
  if(!brand){ var h1 = document.querySelector('h1'); if(h1) brand = h1.textContent.trim().slice(0,50); }
  if(!brand) brand = document.title || 'Our Company';
  var fb = document.getElementById('footer-brand');
  if(fb && navLogo){
    var clone = navLogo.cloneNode(true);
    clone.removeAttribute('href'); clone.style.display='flex'; clone.style.alignItems='center'; clone.style.gap='.5rem';
    fb.appendChild(clone);
  } else if(fb) { fb.textContent = brand; }
  var cp = document.getElementById('footer-copyright');
  if(cp) cp.textContent = '\u00a9 ' + new Date().getFullYear() + ' ' + brand + '. All rights reserved.';
})();
</script>`;

// ── SHOP ──────────────────────────────────────────────────────────────────────
export const SHOP_TEMPLATE = `
<section id="shop" class="page-section w-full min-h-screen hidden" style="background:#f8fafc;padding:5rem 1rem">
  <div style="max-width:72rem;margin:0 auto">
    <div style="text-align:center;margin-bottom:3rem">
      <span style="display:inline-block;padding:.375rem 1rem;background:#ede9fe;color:#7c3aed;border-radius:9999px;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:1rem">Our Store</span>
      <h2 style="font-size:2.5rem;font-weight:800;color:#0f172a;margin-bottom:.75rem">Featured Products</h2>
      <p style="color:#64748b">Discover our handpicked collection of premium products</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.5rem" id="shop-grid">
      ${[
        {name:'Signature Blend',price:'$24.99',tag:'Best Seller',lock:30},
        {name:'Single Origin',price:'$19.99',tag:'Popular',lock:31},
        {name:'Cold Brew Kit',price:'$39.99',tag:'New',lock:32},
        {name:'Pour Over Set',price:'$34.99',tag:'Sale',lock:33},
        {name:'Espresso Roast',price:'$22.99',tag:'',lock:34},
        {name:'French Press',price:'$49.99',tag:'',lock:35},
        {name:'Gift Box',price:'$59.99',tag:'Limited',lock:36},
        {name:'Starter Bundle',price:'$14.99',tag:'',lock:37},
      ].map(p=>`
      <div style="background:white;border-radius:1.25rem;box-shadow:0 2px 8px rgba(0,0,0,.07);overflow:hidden;transition:transform .2s,box-shadow .2s" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 30px rgba(0,0,0,.12)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,.07)'">
        <div style="position:relative;overflow:hidden">
          <img src="https://loremflickr.com/400/280/product?lock=${p.lock}" alt="${p.name}" style="width:100%;height:11rem;object-fit:cover;display:block"/>
          ${p.tag?`<span style="position:absolute;top:.75rem;left:.75rem;background:#6366f1;color:white;font-size:.7rem;font-weight:700;padding:.25rem .625rem;border-radius:9999px">${p.tag}</span>`:''}
          <button onclick="window.addToWishlist(this)" style="position:absolute;top:.75rem;right:.75rem;width:2rem;height:2rem;background:white;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;box-shadow:0 2px 8px rgba(0,0,0,.15)" onmouseover="this.style.opacity=1" class="wish-btn">
            <svg width="16" height="16" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </button>
        </div>
        <div style="padding:1rem">
          <h3 style="font-weight:600;color:#0f172a;margin:0 0 .25rem;font-size:.95rem">${p.name}</h3>
          <p style="color:#6366f1;font-weight:700;font-size:1.1rem;margin:0 0 .875rem">${p.price}</p>
          <button onclick="window.addToCart(this,'${p.name}','${p.price}')" style="width:100%;padding:.625rem;background:#6366f1;color:white;border:none;border-radius:.75rem;font-weight:600;font-size:.875rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.375rem;transition:background .2s" onmouseover="this.style.background='#4f46e5'" onmouseout="this.style.background='#6366f1'">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Add to Cart
          </button>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;

// ── CART ──────────────────────────────────────────────────────────────────────
export const CART_TEMPLATE = `
<section id="cart" class="page-section w-full min-h-screen hidden" style="background:#f8fafc;padding:5rem 1rem">
  <div style="max-width:56rem;margin:0 auto">
    <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:2rem">
      <h2 style="font-size:2rem;font-weight:800;color:#0f172a;margin:0">Your Cart</h2>
      <span id="cart-item-count" style="background:#ede9fe;color:#7c3aed;padding:.25rem .75rem;border-radius:9999px;font-size:.875rem;font-weight:600">0 items</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 320px;gap:1.5rem;align-items:start">
      <div id="cart-items-list">
        <div style="background:white;border-radius:1.25rem;padding:3rem;text-align:center;color:#94a3b8;box-shadow:0 1px 3px rgba(0,0,0,.06)">
          <svg width="48" height="48" fill="none" stroke="#cbd5e1" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto 1rem"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          <p style="font-weight:600;font-size:1.1rem;margin:0 0 .5rem">Your cart is empty</p>
          <p style="font-size:.875rem;margin:0 0 1.25rem">Add some products to get started</p>
          <button onclick="window.navigateTo('shop')" style="padding:.625rem 1.5rem;background:#6366f1;color:white;border:none;border-radius:.75rem;font-weight:600;cursor:pointer">Browse Products</button>
        </div>
      </div>
      <div style="background:white;border-radius:1.25rem;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,.06);position:sticky;top:1rem">
        <h3 style="font-weight:700;color:#0f172a;margin:0 0 1.25rem;font-size:1.1rem">Order Summary</h3>
        <div style="display:flex;flex-direction:column;gap:.75rem;font-size:.875rem;margin-bottom:1.25rem">
          <div style="display:flex;justify-content:space-between;color:#64748b"><span>Subtotal</span><span id="cart-subtotal">$0.00</span></div>
          <div style="display:flex;justify-content:space-between;color:#16a34a;font-weight:500"><span>Shipping</span><span>Free</span></div>
          <div style="display:flex;justify-content:space-between;color:#64748b"><span>Tax (8%)</span><span id="cart-tax">$0.00</span></div>
          <div style="border-top:1px solid #f1f5f9;padding-top:.75rem;display:flex;justify-content:space-between;font-weight:700;color:#0f172a;font-size:1.1rem"><span>Total</span><span id="cart-total">$0.00</span></div>
        </div>
        <button onclick="window.navigateTo('checkout')" style="width:100%;padding:.875rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:700;border:none;border-radius:.875rem;cursor:pointer;font-size:1rem;margin-bottom:.75rem">Proceed to Checkout →</button>
        <button onclick="window.navigateTo('shop')" style="width:100%;padding:.625rem;background:transparent;color:#64748b;border:none;cursor:pointer;font-size:.875rem">← Continue Shopping</button>
      </div>
    </div>
  </div>
</section>`;

// ── CHECKOUT ─────────────────────────────────────────────────────────────────
export const CHECKOUT_TEMPLATE = `
<section id="checkout" class="page-section w-full min-h-screen hidden" style="background:#f8fafc;padding:5rem 1rem">
  <div style="max-width:72rem;margin:0 auto">
    <h2 style="font-size:2rem;font-weight:800;color:#0f172a;margin-bottom:2rem">Checkout</h2>
    <div style="display:grid;grid-template-columns:1fr 340px;gap:2rem;align-items:start">
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div style="background:white;border-radius:1.25rem;padding:1.75rem;box-shadow:0 1px 3px rgba(0,0,0,.06)">
          <h3 style="font-weight:700;color:#0f172a;margin:0 0 1.25rem;display:flex;align-items:center;gap:.625rem">
            <span style="width:1.75rem;height:1.75rem;background:#6366f1;color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700">1</span>
            Delivery Information
          </h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <input type="text" placeholder="First name" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box"/>
            <input type="text" placeholder="Last name" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box"/>
            <input type="email" placeholder="Email address" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box;grid-column:span 2"/>
            <input type="tel" placeholder="Phone number" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box;grid-column:span 2"/>
            <input type="text" placeholder="Street address" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box;grid-column:span 2"/>
            <input type="text" placeholder="City" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box"/>
            <input type="text" placeholder="ZIP Code" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box"/>
          </div>
        </div>
        <div style="background:white;border-radius:1.25rem;padding:1.75rem;box-shadow:0 1px 3px rgba(0,0,0,.06)">
          <h3 style="font-weight:700;color:#0f172a;margin:0 0 1.25rem;display:flex;align-items:center;gap:.625rem">
            <span style="width:1.75rem;height:1.75rem;background:#6366f1;color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700">2</span>
            Payment Method
          </h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem" id="payment-methods">
            <button onclick="window.selectPaymentMethod('stripe',this)" id="pm-stripe" style="display:flex;align-items:center;gap:.75rem;padding:1rem;border:2px solid #6366f1;background:#eef2ff;border-radius:.875rem;cursor:pointer;text-align:left">
              <span style="font-size:1.5rem">💳</span><div><p style="font-weight:600;font-size:.875rem;color:#0f172a;margin:0">Stripe</p><p style="font-size:.75rem;color:#64748b;margin:0">Credit/Debit Card</p></div>
            </button>
            <button onclick="window.selectPaymentMethod('gpay',this)" id="pm-gpay" style="display:flex;align-items:center;gap:.75rem;padding:1rem;border:2px solid #e2e8f0;background:white;border-radius:.875rem;cursor:pointer;text-align:left">
              <span style="font-size:1.5rem">G</span><div><p style="font-weight:600;font-size:.875rem;color:#0f172a;margin:0">Google Pay</p><p style="font-size:.75rem;color:#64748b;margin:0">Pay with Google</p></div>
            </button>
            <button onclick="window.selectPaymentMethod('paypal',this)" id="pm-paypal" style="display:flex;align-items:center;gap:.75rem;padding:1rem;border:2px solid #e2e8f0;background:white;border-radius:.875rem;cursor:pointer;text-align:left">
              <span style="font-size:1.5rem">🅿</span><div><p style="font-weight:600;font-size:.875rem;color:#0f172a;margin:0">PayPal</p><p style="font-size:.75rem;color:#64748b;margin:0">PayPal balance</p></div>
            </button>
            <button onclick="window.selectPaymentMethod('cod',this)" id="pm-cod" style="display:flex;align-items:center;gap:.75rem;padding:1rem;border:2px solid #e2e8f0;background:white;border-radius:.875rem;cursor:pointer;text-align:left">
              <span style="font-size:1.5rem">💵</span><div><p style="font-weight:600;font-size:.875rem;color:#0f172a;margin:0">Cash on Delivery</p><p style="font-size:.75rem;color:#64748b;margin:0">Pay at your door</p></div>
            </button>
          </div>
          <div id="stripe-fields" style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:.875rem;padding:1.25rem;display:flex;flex-direction:column;gap:.75rem">
            <input id="card-number" type="text" placeholder="1234 5678 9012 3456" maxlength="19" oninput="window.formatCardNumber&&window.formatCardNumber(this)" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box;width:100%"/>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
              <input type="text" placeholder="MM / YY" maxlength="7" oninput="window.formatExpiry&&window.formatExpiry(this)" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box"/>
              <input type="text" placeholder="CVV" maxlength="4" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box"/>
            </div>
            <input type="text" placeholder="Cardholder name" style="padding:.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;box-sizing:border-box;width:100%"/>
          </div>
          <div id="gpay-info" style="display:none;background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:.875rem;padding:1.25rem;text-align:center;color:#0369a1"><div style="font-size:2rem;margin-bottom:.5rem">G Pay</div><p style="margin:0;font-size:.875rem">Click Place Order to authenticate with Google Pay</p></div>
          <div id="paypal-info" style="display:none;background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:.875rem;padding:1.25rem;text-align:center;color:#0369a1"><div style="font-size:2rem;margin-bottom:.5rem">PayPal</div><p style="margin:0;font-size:.875rem">You will be redirected to PayPal to complete payment</p></div>
          <div id="cod-info" style="display:none;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:.875rem;padding:1.25rem;color:#166534"><p style="font-weight:600;margin:0 0 .25rem">✓ Cash on Delivery</p><p style="font-size:.875rem;margin:0">Pay with cash when your order arrives</p></div>
        </div>
      </div>
      <div style="background:white;border-radius:1.25rem;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,.06);position:sticky;top:1rem">
        <h3 style="font-weight:700;color:#0f172a;margin:0 0 1rem;font-size:1.1rem">Order Summary</h3>
        <div id="checkout-items" style="margin-bottom:1rem;font-size:.875rem;color:#64748b;max-height:12rem;overflow-y:auto"></div>
        <div style="border-top:1px solid #f1f5f9;padding-top:1rem;display:flex;flex-direction:column;gap:.625rem;font-size:.875rem;margin-bottom:1.25rem">
          <div style="display:flex;justify-content:space-between;color:#64748b"><span>Subtotal</span><span id="checkout-subtotal">$0.00</span></div>
          <div style="display:flex;justify-content:space-between;color:#16a34a;font-weight:500"><span>Shipping</span><span>FREE</span></div>
          <div style="display:flex;justify-content:space-between;color:#64748b"><span>Tax (8%)</span><span id="checkout-tax">$0.00</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;color:#0f172a;font-size:1.1rem;padding-top:.5rem;border-top:1px solid #f1f5f9"><span>Total</span><span id="checkout-total">$0.00</span></div>
        </div>
        <button onclick="window.placeOrder()" id="place-order-btn" style="width:100%;padding:1rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:700;border:none;border-radius:.875rem;cursor:pointer;font-size:1rem">Place Order →</button>
        <p style="text-align:center;font-size:.75rem;color:#94a3b8;margin:.75rem 0 0;display:flex;align-items:center;justify-content:center;gap:.25rem">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          256-bit SSL secured
        </p>
      </div>
    </div>
  </div>
</section>`;

// ── ALL SCRIPTS (cart, checkout, auth, contact) ─────────────────────────────
export const AUTH_SCRIPTS = `
<script>
(function(){
  var _cart = [];
  function fmt(n){ return '$'+parseFloat(n).toFixed(2); }
  function cartTotal(){ return _cart.reduce(function(s,i){ return s+(parseFloat(i.price.replace(/[^0-9.]/g,''))*i.qty); },0); }

  window.updateCartUI = function(){
    var count = _cart.reduce(function(s,i){ return s+i.qty; },0);
    document.querySelectorAll('.cart-badge,.cart-count').forEach(function(el){
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
    });
    var ci = document.getElementById('cart-item-count');
    if(ci) ci.textContent = count+' item'+(count!==1?'s':'');

    var list = document.getElementById('cart-items-list');
    if(list){
      if(!_cart.length){
        list.innerHTML = '<div style="background:white;border-radius:1.25rem;padding:3rem;text-align:center;color:#94a3b8;box-shadow:0 1px 3px rgba(0,0,0,.06)"><p style="font-weight:600;font-size:1.1rem;margin:0 0 .5rem">Your cart is empty</p><button onclick="window.navigateTo(\'shop\')" style="margin-top:1rem;padding:.625rem 1.5rem;background:#6366f1;color:white;border:none;border-radius:.75rem;font-weight:600;cursor:pointer">Browse Products</button></div>';
      } else {
        list.innerHTML = _cart.map(function(item,idx){
          return '<div style="background:white;border-radius:1.25rem;padding:1rem;display:flex;align-items:center;gap:1rem;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:.75rem">'
            +'<img src="https://loremflickr.com/80/80/product?lock='+(50+idx)+'" style="width:4rem;height:4rem;border-radius:.75rem;object-fit:cover;flex-shrink:0"/>'
            +'<div style="flex:1;min-width:0"><p style="font-weight:600;color:#0f172a;margin:0 0 .25rem;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+item.name+'</p><p style="color:#6366f1;font-weight:700;margin:0">'+item.price+'</p></div>'
            +'<div style="display:flex;align-items:center;gap:.5rem">'
            +'<button onclick="window.changeQty('+idx+',-1)" style="width:2rem;height:2rem;background:#f1f5f9;border:none;border-radius:.5rem;cursor:pointer;font-weight:700;color:#475569">−</button>'
            +'<span style="width:2rem;text-align:center;font-weight:600">'+item.qty+'</span>'
            +'<button onclick="window.changeQty('+idx+',1)" style="width:2rem;height:2rem;background:#f1f5f9;border:none;border-radius:.5rem;cursor:pointer;font-weight:700;color:#475569">+</button>'
            +'</div>'
            +'<button onclick="window.removeFromCart('+idx+')" style="padding:.5rem;background:transparent;border:none;cursor:pointer;color:#94a3b8;border-radius:.5rem">'
            +'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>';
        }).join('');
      }
    }

    var sub=cartTotal(), tax=sub*0.08, tot=sub+tax;
    ['cart','checkout'].forEach(function(p){
      var s=document.getElementById(p+'-subtotal');
      var t=document.getElementById(p+'-tax');
      var tt=document.getElementById(p+'-total');
      if(s)s.textContent=fmt(sub);
      if(t)t.textContent=fmt(tax);
      if(tt)tt.textContent=fmt(tot);
    });
    var ci2=document.getElementById('checkout-items');
    if(ci2){
      if(!_cart.length){ ci2.innerHTML='<p style="color:#94a3b8;font-style:italic">No items — add from shop</p>'; }
      else { ci2.innerHTML=_cart.map(function(i){ return '<div style="display:flex;justify-content:space-between;padding:.375rem 0;border-bottom:1px solid #f1f5f9"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:.5rem">'+i.name+' × '+i.qty+'</span><span style="font-weight:600;flex-shrink:0">'+i.price+'</span></div>'; }).join(''); }
    }
    var ob=document.getElementById('place-order-btn');
    if(ob){ ob.disabled=!_cart.length; ob.style.opacity=_cart.length?'1':'0.5'; ob.style.cursor=_cart.length?'pointer':'not-allowed'; }
  };

  window.addToCart = function(btn, name, price){
    var ex=_cart.find(function(i){ return i.name===name; });
    if(ex){ ex.qty++; } else { _cart.push({name:name,price:price,qty:1}); }
    window.updateCartUI();
    if(btn){
      var orig=btn.innerHTML; btn.innerHTML='✓ Added!'; btn.style.background='#16a34a';
      setTimeout(function(){ btn.innerHTML=orig; btn.style.background=''; }, 1500);
    }
  };
  window.changeQty = function(idx,delta){
    if(!_cart[idx])return; _cart[idx].qty+=delta;
    if(_cart[idx].qty<=0)_cart.splice(idx,1);
    window.updateCartUI();
  };
  window.removeFromCart = function(idx){ _cart.splice(idx,1); window.updateCartUI(); };
  window.addToWishlist = function(btn){
    var s=btn?btn.querySelector('svg'):null; if(s){s.setAttribute('fill','#ef4444');}
    var t=document.createElement('div');
    t.style.cssText='position:fixed;top:1.25rem;right:1.25rem;z-index:99999;background:#ef4444;color:white;padding:.75rem 1.25rem;border-radius:.75rem;font-size:.875rem;font-weight:600;box-shadow:0 8px 24px rgba(239,68,68,.4)';
    t.textContent='♥ Added to Wishlist'; document.body.appendChild(t);
    setTimeout(function(){t.remove();},2000);
  };

  window.selectedPayment = 'stripe';
  window.selectPaymentMethod = function(method, btn){
    document.querySelectorAll('#payment-methods button').forEach(function(b){
      b.style.borderColor='#e2e8f0'; b.style.background='white';
    });
    if(btn){ btn.style.borderColor = method==='stripe'?'#6366f1':method==='gpay'?'#2563eb':method==='paypal'?'#0070ba':'#16a34a'; btn.style.background = method==='stripe'?'#eef2ff':method==='gpay'?'#eff6ff':method==='paypal'?'#eff6ff':'#f0fdf4'; }
    window.selectedPayment = method;
    ['stripe-fields','gpay-info','paypal-info','cod-info'].forEach(function(id){
      var el=document.getElementById(id); if(el)el.style.display='none';
    });
    var show = method==='stripe'?'stripe-fields':method==='gpay'?'gpay-info':method==='paypal'?'paypal-info':'cod-info';
    var se=document.getElementById(show); if(se)se.style.display='';
  };
  window.formatCardNumber = function(i){ i.value=i.value.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 '); };
  window.formatExpiry = function(i){ var v=i.value.replace(/\D/g,''); if(v.length>=3)v=v.slice(0,2)+'/'+v.slice(2,4); i.value=v; };

  window.placeOrder = function(){
    if(!_cart.length){ alert('Please add items to cart first'); window.navigateTo&&window.navigateTo('shop'); return; }
    var methods={stripe:'Credit/Debit Card',gpay:'Google Pay',paypal:'PayPal',cod:'Cash on Delivery'};
    var total=(document.getElementById('checkout-total')||{}).textContent||'$0.00';
    var ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';
    ov.innerHTML='<div style="background:white;border-radius:1.5rem;padding:2.5rem 2rem;max-width:24rem;width:90%;text-align:center;box-shadow:0 40px 80px rgba(0,0,0,0.4)">'
      +'<div id="ord-loading"><div style="width:3.5rem;height:3.5rem;border:4px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;margin:0 auto 1rem;animation:vi-spin .8s linear infinite"></div><p style="font-weight:700;font-size:1.1rem;margin:0 0 .25rem;color:#0f172a">Processing...</p><p style="color:#64748b;font-size:.875rem">Connecting to '+methods[window.selectedPayment]+'</p></div>'
      +'<div id="ord-success" style="display:none">'
      +'<div style="width:4rem;height:4rem;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem"><svg width="28" height="28" fill="none" stroke="#065f46" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></div>'
      +'<h3 style="font-size:1.5rem;font-weight:800;color:#0f172a;margin:0 0 .5rem">Order Placed! 🎉</h3>'
      +'<p style="color:#64748b;margin:0 0 .25rem">Amount: <strong>'+total+'</strong></p>'
      +'<p style="color:#64748b;font-size:.875rem;margin:0 0 .25rem">Via: <strong>'+methods[window.selectedPayment]+'</strong></p>'
      +'<p style="color:#64748b;font-size:.875rem;margin:0 0 1.5rem">Order #VIS-'+Math.floor(Math.random()*90000+10000)+'</p>'
      +'<button onclick="window.closeOrder()" style="padding:.75rem 2rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:.875rem;cursor:pointer;font-weight:700;font-size:1rem">Continue Shopping</button>'
      +'</div></div>';
    if(!document.getElementById('vi-spin-css')){
      var st=document.createElement('style'); st.id='vi-spin-css';
      st.textContent='@keyframes vi-spin{to{transform:rotate(360deg)}}'; document.head.appendChild(st);
    }
    ov.id='vi-order-overlay'; document.body.appendChild(ov);
    setTimeout(function(){ var l=document.getElementById('ord-loading'),s=document.getElementById('ord-success'); if(l)l.style.display='none'; if(s)s.style.display='block'; },1800);
  };
  window.closeOrder = function(){
    var ov=document.getElementById('vi-order-overlay');
    if(ov) ov.remove();
    _cart.length=0; window.updateCartUI(); window.navigateTo&&window.navigateTo('shop');
  };

  window.switchAuthTab = function(tab){
    var lf=document.getElementById('login-form'), sf=document.getElementById('signup-form');
    var lt=document.getElementById('tab-login'), st=document.getElementById('tab-signup');
    if(!lf||!sf)return;
    if(tab==='login'){ lf.style.display=''; sf.style.display='none'; if(lt){lt.style.background='white';lt.style.boxShadow='0 1px 3px rgba(0,0,0,.1)';lt.style.color='#6366f1';} if(st){st.style.background='transparent';st.style.boxShadow='none';st.style.color='#64748b';} }
    else { sf.style.display=''; lf.style.display='none'; if(st){st.style.background='white';st.style.boxShadow='0 1px 3px rgba(0,0,0,.1)';st.style.color='#6366f1';} if(lt){lt.style.background='transparent';lt.style.boxShadow='none';lt.style.color='#64748b';} }
  };

  function popup(icon,title,msg,btn){
    var o=document.createElement('div');
    o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
    o.innerHTML='<div style="background:white;border-radius:1.25rem;padding:2.25rem;text-align:center;max-width:20rem;width:90%;box-shadow:0 40px 80px rgba(0,0,0,.3)">'
      +'<div style="font-size:2.75rem;margin-bottom:.875rem">'+icon+'</div>'
      +'<p style="font-weight:800;font-size:1.2rem;margin:0 0 .5rem;color:#0f172a">'+title+'</p>'
      +'<p style="color:#64748b;font-size:.875rem;margin:0 0 1.25rem;line-height:1.6">'+msg+'</p>'
      +'<button onclick="this.closest(\'div\').parentElement.remove()" style="padding:.75rem 1.75rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:.75rem;cursor:pointer;font-weight:700">'+btn+'</button></div>';
    document.body.appendChild(o);
  }
  window.handleSocialAuth = function(p){ popup('🔐',p+' Sign In','In production, integrate the '+p+' OAuth SDK.','Got it'); };
  window.handleEmailLogin = function(){ popup('✅','Signed In!','Connect Firebase or Supabase for real authentication.','Continue'); };
  window.handleEmailSignup = function(){ popup('🎉','Account Created!','Connect your auth backend to save user data.','Get Started'); };
  window.handleContactSubmit = function(){ popup('📬','Message Sent!','We\'ll get back to you within 24 hours. Thanks!','Close'); };

  window.updateCartUI();
})();
</script>`;
