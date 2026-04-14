// =====================================================================
// DORMEDS FAST MEDICINE — Complete Application Engine
// All views, routing, state management, and business logic
// =====================================================================

class DormedsApp {
  constructor() {
    this.db = new DormedsDB();
    this.user = JSON.parse(localStorage.getItem('dmed_user') || 'null');
    this.role = localStorage.getItem('dmed_role') || null;
    this.cart = this.db.get('cart');
    this.searchTimeout = null;
  }

  // ---- Init ----
  init() {
    window.addEventListener('hashchange', () => this.route());
    this.showSplash();
  }

  // ---- Toast Notifications ----
  toast(msg, type = 'success') {
    const el = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast toast-${type[0]}`;
    t.innerHTML = `<span style="font-size:16px">${icons[type]}</span><span class="toast-msg">${msg}</span><span class="toast-x" onclick="this.parentElement.remove()">✕</span>`;
    el.appendChild(t);
    setTimeout(() => { if (t.parentElement) t.remove(); }, 3500);
  }

  // ---- Splash ----
  showSplash() {
    document.getElementById('app').innerHTML = `
      <div class="splash" id="splash">
        <img src="assets/logo.png" class="splash-logo-img" alt="DORMEDS" />
        <div class="splash-sub">Fast Healthcare</div>
        <div class="splash-bar"></div>
      </div>`;
    setTimeout(() => {
      document.getElementById('splash')?.classList.add('out');
      setTimeout(() => this.route(), 500);
    }, 1600);
  }

  // ---- Router ----
  route() {
    const hash = location.hash || '#/';
    const app = document.getElementById('app');
    if (hash === '#/' || hash === '') {
      if (this.user) { location.hash = `#/${this.role}/home`; return; }
      this.viewLanding(app); return;
    }
    const [, role, view, param] = hash.match(/#\/([^/]+)\/?([^/]*)\/?(.*)/) || [];
    if (role === 'login') { this.viewLogin(app, view); return; }
    switch (role) {
      case 'customer': this.viewCustomer(app, view || 'home', param); break;
      case 'pharmacy': this.viewDash(app, 'pharmacy', view || 'home', param); break;
      case 'delivery': this.viewDash(app, 'delivery', view || 'home', param); break;
      case 'admin': this.viewDash(app, 'admin', view || 'home', param); break;
      default: this.viewLanding(app);
    }
  }

  // ===== LANDING =====
  viewLanding(app) {
    app.innerHTML = `
    <div class="landing">
      <div class="land-content anim-up">
        <div class="land-logo"><img src="assets/logo.png" class="logo-img" alt="DORMEDS" /></div>
        <h1>Your Medicine,<br><span class="hl">Delivered Fast</span></h1>
        <p class="land-sub">Order medicines from nearby pharmacies with real-time tracking, prescription verification, and smart refill reminders. India's smartest medicine delivery.</p>
        <div class="roles">
          <div class="role-c anim-up stg-1" onclick="A.go('customer')" id="role-customer"><span class="rc-icon">🛒</span><h3>Customer</h3><p>Order medicines fast</p></div>
          <div class="role-c anim-up stg-2" onclick="A.go('pharmacy')" id="role-pharmacy"><span class="rc-icon">🏪</span><h3>Pharmacy</h3><p>Manage orders & stock</p></div>
          <div class="role-c anim-up stg-3" onclick="A.go('delivery')" id="role-delivery"><span class="rc-icon">🚴</span><h3>Delivery</h3><p>Deliver & earn</p></div>
          <div class="role-c anim-up stg-4" onclick="A.go('admin')" id="role-admin"><span class="rc-icon">⚙️</span><h3>Admin</h3><p>Control everything</p></div>
        </div>
      </div>
    </div>`;
  }

  go(role) { location.hash = `#/login/${role}`; }

  // ===== LOGIN =====
  viewLogin(app, role) {
    const labels = { customer: '🛒 Customer', pharmacy: '🏪 Pharmacy', delivery: '🚴 Delivery', admin: '⚙️ Admin' };
    const icons = { customer: '📱', pharmacy: '💊', delivery: '🏍️', admin: '🛡️' };
    app.innerHTML = `
    <div class="login">
      <div class="login-card anim-up">
        <div class="login-icon">${icons[role]}</div>
        <h2>Welcome to DORMEDS</h2>
        <p class="login-sub">${labels[role]} Login</p>
        <div id="step1">
          <div class="phone-row"><span class="phone-pre">🇮🇳 +91</span><input class="inp" type="tel" id="phoneInp" placeholder="Enter 10-digit number" maxlength="10" style="flex:1" /></div>
          <button class="btn btn-p btn-block btn-lg" onclick="A.sendOtp('${role}')">Send OTP</button>
        </div>
        <div id="step2" style="display:none">
          <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--s-4)">Enter the 4-digit OTP</p>
          <div class="otp-row">
            <input class="otp-box" type="text" maxlength="1" id="o1" oninput="A.otpNav(this,'o2')"/>
            <input class="otp-box" type="text" maxlength="1" id="o2" oninput="A.otpNav(this,'o3')"/>
            <input class="otp-box" type="text" maxlength="1" id="o3" oninput="A.otpNav(this,'o4')"/>
            <input class="otp-box" type="text" maxlength="1" id="o4" oninput="A.verifyOtp('${role}')"/>
          </div>
          <button class="btn btn-p btn-block btn-lg" onclick="A.verifyOtp('${role}')">Verify & Login</button>
          <p style="margin-top:var(--s-4);font-size:var(--text-sm);color:var(--text-muted)">Didn't receive? <span style="color:var(--primary);cursor:pointer;font-weight:600" onclick="A.sendOtp('${role}')">Resend</span></p>
        </div>
        <p style="margin-top:var(--s-6);font-size:11px;color:var(--text-muted)">Demo: Any 10-digit number · OTP: <strong>1234</strong></p>
        <button class="btn btn-g" style="margin-top:var(--s-4)" onclick="location.hash='#/'">← Back</button>
      </div>
    </div>`;
  }

  sendOtp(role) {
    const ph = document.getElementById('phoneInp').value;
    if (!/^\d{10}$/.test(ph)) { this.toast('Enter valid 10-digit number', 'error'); return; }
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    this.toast('OTP sent to +91 ' + ph);
    setTimeout(() => document.getElementById('o1')?.focus(), 200);
  }

  otpNav(el, next) { if (el.value.length === 1) document.getElementById(next)?.focus(); }

  verifyOtp(role) {
    const otp = ['o1','o2','o3','o4'].map(id => document.getElementById(id)?.value || '').join('');
    if (otp !== '1234') { this.toast('Wrong OTP. Use 1234', 'error'); return; }
    const users = { customer:{id:'U1',name:'Rahul Sharma',role:'customer',avatar:'RS',phone:'9876543210'},
      pharmacy:{id:'P1',name:'MedPlus',role:'pharmacy',avatar:'MP',phone:'9876500001'},
      delivery:{id:'D1',name:'Ravi Kumar',role:'delivery',avatar:'RK',phone:'9876600001'},
      admin:{id:'ADM',name:'Admin',role:'admin',avatar:'AD',phone:'0000000000'}};
    this.user = users[role]; this.role = role;
    localStorage.setItem('dmed_user', JSON.stringify(this.user));
    localStorage.setItem('dmed_role', role);
    this.toast(`Welcome, ${this.user.name}!`);
    location.hash = `#/${role}/home`;
  }

  logout() {
    this.user = null; this.role = null;
    localStorage.removeItem('dmed_user'); localStorage.removeItem('dmed_role');
    location.hash = '#/';
  }

  // ===== CUSTOMER VIEWS =====
  viewCustomer(app, v, p) {
    const views = {home:()=>this.cHome(),search:()=>this.cSearch(p),product:()=>this.cProduct(p),
      cart:()=>this.cCart(),checkout:()=>this.cCheckout(),prescription:()=>this.cPrescription(),
      tracking:()=>this.cTracking(p),orders:()=>this.cOrders(),profile:()=>this.cProfile()};
    const content = (views[v] || views.home)();
    const cc = this.cart.length;
    const isInner = ['product','checkout','tracking'].includes(v);
    const innerTitles = {product:'Product Detail',checkout:'Checkout',tracking:'Order Tracking'};
    app.innerHTML = `
      ${isInner ? `<div class="m-head"><button class="hdr-btn" onclick="history.back()">←</button><div class="h-title">${innerTitles[v]||''}</div><div style="width:40px"></div></div>`
       : `<div class="m-head">
          <div style="display:flex;align-items:center;gap:10px">
            <img src="assets/icon.png" class="hdr-logo-img" alt="DORMEDS" />
            <span style="font-weight:900;font-size:var(--text-base)">DORMEDS</span>
          </div>
          <div style="display:flex;gap:var(--s-2)">
            <button class="hdr-btn" onclick="A.toast('Notifications coming soon','info')">🔔<span class="dot-badge">3</span></button>
          </div>
        </div>`}
      <div class="mob-content page">${content}</div>
      ${cc > 0 && !['cart','checkout'].includes(v) ? `<div class="f-cart" onclick="location.hash='#/customer/cart'"><span style="font-size:var(--text-sm);font-weight:600">🛒 ${cc} item${cc>1?'s':''}</span><span style="font-weight:800">₹${this.cartTotal()} →</span></div>` : ''}
      <nav class="b-nav">
        <div class="n-item ${v==='home'?'on':''}" onclick="location.hash='#/customer/home'"><span class="n-icon">🏠</span>Home</div>
        <div class="n-item ${v==='prescription'?'on':''}" onclick="location.hash='#/customer/prescription'"><span class="n-icon">📋</span>Rx Upload</div>
        <div class="n-item ${v==='search'?'on':''}" onclick="location.hash='#/customer/search'"><span class="n-icon">🔍</span>Search</div>
        <div class="n-item ${v==='orders'?'on':''}" onclick="location.hash='#/customer/orders'"><span class="n-icon">📦</span>Orders</div>
        <div class="n-item ${v==='profile'?'on':''}" onclick="location.hash='#/customer/profile'"><span class="n-icon">👤</span>Profile</div>
      </nav>`;
  }

  // ---- Customer Home ----
  cHome() {
    const cats = this.db.get('categories');
    const meds = this.db.get('medicines');
    const pop = meds.filter(m => m.rat >= 4.4 && m.stock > 0).slice(0, 6);
    const lastOrd = this.db.get('orders').find(o => o.uid === 'U1' && o.status === 'delivered');
    const hr = new Date().getHours();
    const greet = hr < 12 ? 'Morning' : hr < 17 ? 'Afternoon' : 'Evening';
    return `<div class="c-home">
      <div class="greet" style="margin-bottom:var(--s-5)"><p class="g-sub">Good ${greet} 👋</p><h2>Hi, <span>${this.user?.name||'User'}</span></h2></div>
      <div class="search" style="margin-bottom:var(--s-6)"><span class="s-icon">🔍</span>
        <input type="text" placeholder="Search medicines, symptoms..." id="homeSearch" oninput="A.autoComplete(this)" onkeydown="if(event.key==='Enter')location.hash='#/customer/search/'+encodeURIComponent(this.value)" onfocus="A.showRecent()" />
        <div id="searchDrop" class="search-dropdown" style="display:none"></div>
      </div>
      <div class="offers"><div class="offers-track">
        <div class="offer"><div class="o-tag">Limited Offer</div><h3>50% OFF</h3><p>On your first medicine order</p><span class="o-code">FIRST50</span></div>
        <div class="offer"><div class="o-tag">Health Week</div><h3>20% OFF</h3><p>On all vitamins & supplements</p><span class="o-code">HEALTH20</span></div>
        <div class="offer"><div class="o-tag">Free Delivery</div><h3>₹0 Delivery</h3><p>On orders above ₹300</p><span class="o-code">FREEDEL</span></div>
      </div></div>
      <div class="sec-h"><h3>Categories</h3><span class="see-all" onclick="location.hash='#/customer/search'">See All</span></div>
      <div class="cats">${cats.map(c=>`<div class="cat-c" onclick="location.hash='#/customer/search/${encodeURIComponent(c.name)}'"><span class="cc-icon">${c.icon}</span><span class="cc-name">${c.name}</span></div>`).join('')}</div>
      ${lastOrd?`<div class="sec-h"><h3>🔄 Smart Refill</h3></div>
      <div class="card card-i" style="padding:var(--s-4);margin-bottom:var(--s-6);display:flex;align-items:center;gap:var(--s-4)" onclick="A.reorder()">
        <div style="width:44px;height:44px;background:var(--primary);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🔄</div>
        <div style="flex:1"><div style="font-weight:600;font-size:var(--text-sm)">Reorder: ${lastOrd.items.map(i=>i.name).join(', ')}</div><div style="font-size:11px;color:var(--text-muted)">Last ordered ${new Date(lastOrd.createdAt).toLocaleDateString('en-IN')}</div></div>
        <span style="color:var(--primary);font-weight:600;font-size:var(--text-sm)">→</span>
      </div>`:''} 
      <div class="sec-h"><h3>🔥 Popular</h3><span class="see-all" onclick="location.hash='#/customer/search'">See All</span></div>
      <div class="med-grid">${pop.map(m=>this.medCard(m)).join('')}</div>
    </div>`;
  }

  medCard(m) {
    return `<div class="med-c" onclick="location.hash='#/customer/product/${m.id}'">
      <div class="med-img">${m.icon}${m.off?`<span class="med-off">${m.off}%</span>`:''}${m.rx?`<span class="med-rx">Rx</span>`:''}</div>
      <div class="med-info"><div class="med-name">${m.name}</div><div class="med-gen">${m.gen}</div>
        <div class="med-row"><div><span class="med-price">₹${m.price}</span>${m.mrp>m.price?`<span class="med-mrp">₹${m.mrp}</span>`:''}</div>
          <button class="med-add" onclick="event.stopPropagation();A.addCart('${m.id}')">+</button></div>
        <div class="med-rat">⭐ ${m.rat} <span style="color:var(--text-muted);font-weight:400">(${m.rev.toLocaleString()})</span></div>
      </div></div>`;
  }

  // ---- Autocomplete ----
  autoComplete(inp) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const q = inp.value;
      const drop = document.getElementById('searchDrop');
      if (!q || q.length < 1) { drop.style.display = 'none'; return; }
      const sugg = this.db.autocomplete(q);
      if (sugg.length === 0) { drop.style.display = 'none'; return; }
      drop.style.display = 'block';
      drop.innerHTML = sugg.map(s => `<div class="search-item" onclick="location.hash='#/customer/${s.type==='medicine'?'product/'+s.id:'search/'+encodeURIComponent(s.text)}'">${s.icon} <div style="flex:1"><div style="font-weight:500">${s.text}</div><div class="si-cat">${s.sub}</div></div></div>`).join('');
    }, 150);
  }

  showRecent() {
    const hist = this.db.get('searchHistory');
    const drop = document.getElementById('searchDrop');
    if (!drop || hist.length === 0) return;
    const inp = document.getElementById('homeSearch');
    if (inp && inp.value.length > 0) return;
    drop.style.display = 'block';
    drop.innerHTML = `<div style="padding:8px 16px;font-size:11px;color:var(--text-muted);font-weight:600">RECENT SEARCHES</div>`
      + hist.map(h => `<div class="search-item" onclick="location.hash='#/customer/search/${encodeURIComponent(h)}'">🕐 <span style="flex:1">${h}</span></div>`).join('');
  }

  // ---- Search ----
  cSearch(q) {
    const meds = q ? this.db.search(decodeURIComponent(q)) : this.db.get('medicines');
    const cats = this.db.get('categories');
    const title = q ? `Results for "${decodeURIComponent(q)}"` : 'All Medicines';
    // Save to history
    if (q) {
      const hist = this.db.get('searchHistory');
      const dq = decodeURIComponent(q);
      if (!hist.includes(dq)) { hist.unshift(dq); this.db.set('searchHistory', hist.slice(0, 10)); }
    }
    return `<div class="c-home">
      <div class="search" style="margin-bottom:var(--s-4)"><span class="s-icon">🔍</span>
        <input type="text" placeholder="Search medicines, symptoms..." value="${q?decodeURIComponent(q):''}" id="searchInp"
          oninput="A.autoComplete(this)" onkeydown="if(event.key==='Enter')location.hash='#/customer/search/'+encodeURIComponent(this.value)"/>
        <div id="searchDrop" class="search-dropdown" style="display:none"></div>
      </div>
      <div style="display:flex;gap:var(--s-2);overflow-x:auto;padding:2px;margin-bottom:var(--s-4)">
        <span class="tab ${!q?'on':''}" onclick="location.hash='#/customer/search'">All</span>
        ${cats.map(c=>`<span class="tab ${q&&decodeURIComponent(q)===c.name?'on':''}" onclick="location.hash='#/customer/search/${encodeURIComponent(c.name)}'">${c.icon} ${c.name}</span>`).join('')}
      </div>
      <div class="sec-h"><h3>${title}</h3><span style="font-size:var(--text-sm);color:var(--text-muted)">${meds.length} items</span></div>
      ${meds.length?`<div class="med-grid">${meds.map(m=>this.medCard(m)).join('')}</div>`
        :`<div style="text-align:center;padding:var(--s-16) var(--s-6)"><div style="font-size:48px;margin-bottom:var(--s-4)">🔍</div><h3>No medicines found</h3><p style="color:var(--text-secondary);margin-top:var(--s-2)">Try a different search term or check spelling</p></div>`}
    </div>`;
  }

  // ---- Product Detail ----
  cProduct(id) {
    const m = this.db.getOne('medicines', id);
    if (!m) return `<div style="text-align:center;padding:var(--s-16)"><h3>Product not found</h3><button class="btn btn-p" onclick="history.back()">Go Back</button></div>`;
    const phs = this.db.get('pharmacies').filter(p => p.status === 'approved').slice(0, 3);
    const related = this.db.get('medicines').filter(r => r.cat === m.cat && r.id !== m.id).slice(0, 4);
    return `<div class="pd">
      <div class="pd-img">${m.icon}<div class="pd-badges">${m.off?`<span class="badge badge-e">${m.off}% OFF</span>`:''}${m.rx?`<span class="badge badge-i">Rx Required</span>`:''}</div></div>
      <h2 class="pd-name">${m.name}</h2><p class="pd-gen">${m.gen} · ${m.mfr}</p>
      <div style="display:flex;align-items:center;gap:var(--s-2);margin-bottom:var(--s-4)"><span class="badge badge-w">⭐ ${m.rat}</span><span style="font-size:var(--text-sm);color:var(--text-secondary)">${m.rev.toLocaleString()} reviews</span></div>
      <div class="pd-price"><span class="pd-sell">₹${m.price}</span>${m.mrp>m.price?`<span class="pd-mrp">₹${m.mrp}</span><span class="pd-save">Save ₹${m.mrp-m.price}</span>`:''}</div>
      <div style="display:flex;gap:var(--s-3);margin-bottom:var(--s-6)">
        <button class="btn btn-p btn-lg" style="flex:1" onclick="A.addCart('${m.id}');location.hash='#/customer/cart'">🛒 Add to Cart</button>
        <button class="btn btn-s btn-lg btn-icon" onclick="A.toast('Saved to wishlist!')">❤️</button>
      </div>
      <div class="card" style="margin-bottom:var(--s-4)"><div class="card-body">
        <h4 style="margin-bottom:var(--s-3)">📋 Product Info</h4>
        <div class="info-tbl">
          <div class="info-r"><span class="info-l">Description</span><span class="info-v">${m.desc}</span></div>
          <div class="info-r"><span class="info-l">Dosage</span><span class="info-v">${m.dose}</span></div>
          <div class="info-r"><span class="info-l">Side Effects</span><span class="info-v">${m.side}</span></div>
          <div class="info-r"><span class="info-l">Category</span><span class="info-v">${m.cat}</span></div>
          <div class="info-r"><span class="info-l">Stock</span><span class="info-v">${m.stock>0?`<span style="color:var(--success)">In Stock (${m.stock})</span>`:'<span style="color:var(--error)">Out of Stock</span>'}</span></div>
        </div>
      </div></div>
      <div class="sec-h"><h3>🏪 Nearby Pharmacies</h3></div>
      ${phs.map((ph,i)=>`<div class="ph-opt ${i===0?'sel':''}" onclick="this.parentElement.querySelectorAll('.ph-opt').forEach(e=>e.classList.remove('sel'));this.classList.add('sel')"><div class="ph-logo">${ph.name[0]}</div><div class="ph-info"><div class="ph-name">${ph.name}</div><div class="ph-dist">📍 ${(1.2+i*.8).toFixed(1)} km · ⭐ ${ph.rating}</div></div><div class="ph-eta">${15+i*10} min</div></div>`).join('')}
      ${related.length?`<div class="sec-h" style="margin-top:var(--s-6)"><h3>Similar Products</h3></div><div class="med-grid">${related.map(r=>this.medCard(r)).join('')}</div>`:''}
    </div>`;
  }

  // ---- Cart ----
  addCart(id) {
    const m = this.db.getOne('medicines', id);
    if (!m) { this.toast('Medicine not found', 'error'); return; }
    if (m.stock <= 0) { this.toast(`${m.name} is out of stock`, 'error'); return; }
    const ex = this.cart.find(c => c.mid === id);
    if (ex) { if (ex.qty >= m.stock) { this.toast('Maximum stock reached', 'warning'); return; } ex.qty++; }
    else this.cart.push({mid:id,name:m.name,price:m.price,mrp:m.mrp,icon:m.icon,qty:1,rx:m.rx});
    this.db.set('cart', this.cart);
    this.toast(`${m.name} added to cart`);
    this.route();
  }

  rmCart(id) { this.cart = this.cart.filter(c => c.mid !== id); this.db.set('cart', this.cart); this.route(); }
  updQty(id, d) {
    const c = this.cart.find(c => c.mid === id);
    if (!c) return;
    const m = this.db.getOne('medicines', id);
    c.qty += d;
    if (c.qty <= 0) { this.rmCart(id); return; }
    if (m && c.qty > m.stock) { this.toast('Maximum stock reached', 'warning'); c.qty = m.stock; }
    this.db.set('cart', this.cart); this.route();
  }
  cartTotal() { return this.cart.reduce((s, c) => s + c.price * c.qty, 0); }

  cCart() {
    if (!this.cart.length) return `<div style="text-align:center;padding:var(--s-16) var(--s-6)"><div style="font-size:48px;margin-bottom:var(--s-4)">🛒</div><h3>Cart is empty</h3><p style="color:var(--text-secondary);margin-top:var(--s-2);margin-bottom:var(--s-6)">Browse medicines to get started</p><button class="btn btn-p" onclick="location.hash='#/customer/home'">Browse Medicines</button></div>`;
    const sub = this.cartTotal();
    const del = sub >= 300 ? 0 : 25;
    const saved = this.cart.reduce((s,c)=>(c.mrp-c.price)*c.qty+s,0);
    const needsRx = this.cart.some(c=>c.rx);
    return `<div style="padding:var(--s-4)">
      <h3 style="margin-bottom:var(--s-4)">🛒 Cart (${this.cart.length} items)</h3>
      ${needsRx?`<div class="card card-i" style="padding:var(--s-4);margin-bottom:var(--s-4);display:flex;align-items:center;gap:var(--s-3);border-color:var(--primary)" onclick="location.hash='#/customer/prescription'">
        <div style="width:40px;height:40px;background:var(--primary);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;font-size:20px">📋</div>
        <div style="flex:1"><div style="font-weight:600;font-size:var(--text-sm);color:var(--primary)">Prescription Required</div><div style="font-size:11px;color:var(--text-muted)">Upload for Rx items</div></div>
        <span style="color:var(--primary);font-weight:600">Upload →</span>
      </div>`:''} 
      ${this.cart.map(c=>`<div class="cart-item"><div class="ci-img">${c.icon}</div><div class="ci-info"><div class="ci-name">${c.name}</div><div class="ci-sub">${c.rx?'📋 Rx Required':'💊 OTC'}</div><div class="ci-bot"><span class="ci-price">₹${c.price*c.qty}</span><div class="qty"><button onclick="A.updQty('${c.mid}',-1)">−</button><span class="qty-v">${c.qty}</span><button onclick="A.updQty('${c.mid}',1)">+</button></div></div></div></div>`).join('')}
      <div style="display:flex;gap:var(--s-2);margin:var(--s-4) 0"><input class="inp" placeholder="Promo code" id="promoInp" style="flex:1;min-height:44px"/><button class="btn btn-s btn-sm" onclick="A.applyPromo()">Apply</button></div>
      <div class="cart-sum">
        <div class="sum-r"><span>Subtotal</span><span>₹${sub}</span></div>
        <div class="sum-r"><span>Delivery</span><span>${del===0?'<span style="color:var(--success)">FREE</span>':'₹'+del}</span></div>
        ${saved>0?`<div class="sum-r"><span>You Save</span><span style="color:var(--success);font-weight:600">−₹${saved}</span></div>`:''}
        <div class="sum-r total"><span>Total</span><span>₹${sub+del}</span></div>
      </div>
      <button class="btn btn-p btn-block btn-lg" onclick="A.validateAndCheckout()">Proceed to Checkout →</button>
    </div>`;
  }

  applyPromo() {
    const code = document.getElementById('promoInp')?.value?.toUpperCase();
    const cpn = this.db.get('coupons').find(c => c.code === code && c.active);
    if (cpn) this.toast(`"${code}" applied! ${cpn.desc}`);
    else this.toast('Invalid or expired code', 'error');
  }

  validateAndCheckout() {
    const errors = this.db.validateStock(this.cart);
    if (errors.length) {
      errors.forEach(e => this.toast(`${e.name}: ${e.issue==='not_found'?'Not available':'Only '+e.available+' left'}`, 'error'));
      return;
    }
    location.hash = '#/customer/checkout';
  }

  // ---- Checkout ----
  cCheckout() {
    const sub = this.cartTotal(); const del = sub >= 300 ? 0 : 25; const total = sub + del;
    const user = this.db.getOne('users', 'U1');
    const phs = this.db.get('pharmacies').filter(p => p.status === 'approved').slice(0, 3);
    return `<div style="padding:var(--s-4)">
      <div style="margin-bottom:var(--s-6)"><h3 style="margin-bottom:var(--s-3)">📍 Delivery Address</h3>
        ${(user?.addresses||[]).map((a,i)=>`<div class="addr-c ${i===0?'sel':''}" onclick="this.parentElement.querySelectorAll('.addr-c').forEach(e=>e.classList.remove('sel'));this.classList.add('sel')"><div style="font-size:24px">${a.icon}</div><div><div class="addr-type">${a.type}</div><div class="addr-txt">${a.address}</div></div></div>`).join('')}
        <button class="btn btn-g btn-sm" onclick="A.toast('Add address coming soon','info')">+ Add New Address</button>
      </div>
      <div style="margin-bottom:var(--s-6)"><h3 style="margin-bottom:var(--s-3)">🏪 Pharmacy</h3>
        ${phs.map((ph,i)=>`<div class="ph-opt ${i===0?'sel':''}" onclick="this.parentElement.querySelectorAll('.ph-opt').forEach(e=>e.classList.remove('sel'));this.classList.add('sel')"><div class="ph-logo">${ph.name[0]}</div><div class="ph-info"><div class="ph-name">${ph.name}</div><div class="ph-dist">📍 ${(1.2+i*.8).toFixed(1)} km · ⭐ ${ph.rating}</div></div><div class="ph-eta">${15+i*10} min</div></div>`).join('')}
      </div>
      <div style="margin-bottom:var(--s-6)"><h3 style="margin-bottom:var(--s-3)">💳 Payment</h3>
        <div class="pay-opt sel" onclick="document.querySelectorAll('.pay-opt').forEach(e=>e.classList.remove('sel'));this.classList.add('sel')"><span class="pay-icon">📱</span><div><div class="pay-name">UPI</div><div class="pay-desc">Google Pay, PhonePe, Paytm</div></div><div class="radio"></div></div>
        <div class="pay-opt" onclick="document.querySelectorAll('.pay-opt').forEach(e=>e.classList.remove('sel'));this.classList.add('sel')"><span class="pay-icon">💵</span><div><div class="pay-name">Cash on Delivery</div><div class="pay-desc">Pay when you receive</div></div><div class="radio"></div></div>
        <div class="pay-opt" onclick="document.querySelectorAll('.pay-opt').forEach(e=>e.classList.remove('sel'));this.classList.add('sel')"><span class="pay-icon">💳</span><div><div class="pay-name">Card</div><div class="pay-desc">Visa, Mastercard, Rupay</div></div><div class="radio"></div></div>
      </div>
      <div class="cart-sum"><div class="sum-r"><span>Subtotal (${this.cart.length} items)</span><span>₹${sub}</span></div><div class="sum-r"><span>Delivery</span><span>${del===0?'<span style="color:var(--success)">FREE</span>':'₹'+del}</span></div><div class="sum-r total"><span>Total</span><span>₹${total}</span></div></div>
      <button class="btn btn-p btn-block btn-lg" onclick="A.placeOrder()">💊 Place Order · ₹${total}</button>
    </div>`;
  }

  placeOrder() {
    // Validate stock one more time
    const errors = this.db.validateStock(this.cart);
    if (errors.length) { errors.forEach(e => this.toast(`${e.name} stock issue`, 'error')); return; }
    // Lock stock
    this.db.lockStock(this.cart);
    // Find pharmacy
    const ph = this.db.findPharmacy(this.cart);
    if (!ph) { this.toast('No pharmacy available nearby. Please try later.', 'error'); return; }
    const oid = this.db.genId('O');
    const sub = this.cartTotal(); const del = sub >= 300 ? 0 : 25;
    const order = {id:oid,uid:'U1',uName:this.user.name,phId:ph.id,phName:ph.name,dId:null,dName:null,
      status:'pending',items:this.cart.map(c=>({mid:c.mid,name:c.name,qty:c.qty,price:c.price})),
      subtotal:sub,delFee:del,discount:0,total:sub+del,payMethod:'UPI',payStatus:'paid',
      address:'42, Sector 15, Noida, UP 201301',hasRx:this.cart.some(c=>c.rx),rxStatus:null,emergency:false,
      rating:null,review:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    this.db.add('orders', order);
    this.cart = []; this.db.set('cart', this.cart);
    // Show success overlay then redirect
    this.showSuccess(oid);
  }

  showSuccess(oid) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="success-ov" onclick="this.remove();location.hash='#/customer/tracking/${oid}'">
      <div class="success-check">✓</div>
      <h2 style="color:white">Order Placed! 🎉</h2>
      <p style="color:var(--text-secondary)">Order #${oid} confirmed<br>Tap anywhere to track</p>
    </div>`;
  }

  // ---- Prescription Upload with OCR ----
  cPrescription() {
    return `<div style="padding:var(--s-4)">
      <h3 style="margin-bottom:var(--s-2)">📋 Upload Prescription</h3>
      <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--s-6)">Our AI-powered OCR extracts medicines automatically</p>
      <div class="upload-zone" onclick="document.getElementById('rxFile').click()">
        <div class="uz-icon">📸</div><h4>Tap to Upload Prescription</h4><p style="color:var(--text-secondary);font-size:var(--text-sm);margin-top:var(--s-2)">Camera / Gallery · JPG, PNG, PDF</p>
        <input type="file" id="rxFile" accept="image/*,.pdf" style="display:none" onchange="A.processRx(event)"/>
      </div>
      <div id="ocrResults"></div>
      <div style="margin-top:var(--s-4);text-align:center;font-size:var(--text-sm);color:var(--text-muted)"><strong>Or type medicine names manually:</strong></div>
      <div style="display:flex;gap:var(--s-2);margin-top:var(--s-3)">
        <input class="inp" placeholder="e.g. Dolo, Crocin, Cetirizine" id="manualRx" style="flex:1"/>
        <button class="btn btn-p btn-sm" onclick="A.manualOcr()">Extract</button>
      </div>
      <div class="card" style="margin-top:var(--s-6)"><div class="card-body">
        <h4 style="margin-bottom:var(--s-3)">📝 How It Works</h4>
        <div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:2">
          1. Upload or type prescription text<br>
          2. AI extracts medicine names<br>
          3. We match to our database<br>
          4. Review, edit, and add to cart<br>
          5. If OCR fails → sent to pharmacy for manual review
        </div>
      </div></div>
    </div>`;
  }

  processRx(event) {
    if (!event.target.files.length) return;
    const container = document.getElementById('ocrResults');
    // Simulate OCR processing
    container.innerHTML = `<div class="card" style="padding:var(--s-5);text-align:center;margin-bottom:var(--s-4)">
      <div style="width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto var(--s-4)"></div>
      <p style="font-weight:600">Processing Prescription...</p><p style="font-size:var(--text-sm);color:var(--text-secondary)">Extracting medicine names with OCR</p>
    </div>`;
    // Simulate delay then show results
    setTimeout(() => {
      const simText = 'Dolo 650 Cetirizine Becosules Betadine';
      this.showOcrResults(simText);
    }, 2000);
    this.toast('Prescription uploaded! Processing...');
  }

  manualOcr() {
    const text = document.getElementById('manualRx')?.value;
    if (!text) { this.toast('Enter medicine names', 'warning'); return; }
    this.showOcrResults(text);
  }

  showOcrResults(text) {
    const results = this.db.ocrProcess(text);
    const container = document.getElementById('ocrResults');
    if (results.length === 0) {
      container.innerHTML = `<div class="card" style="padding:var(--s-5);margin-bottom:var(--s-4)">
        <div style="text-align:center"><div style="font-size:40px;margin-bottom:var(--s-3)">🔍</div>
        <h4>No matches found</h4><p style="color:var(--text-secondary);font-size:var(--text-sm);margin-top:var(--s-2)">Prescription sent to pharmacy for manual review</p>
        <span class="badge badge-w" style="margin-top:var(--s-3)">📋 Pending Review</span></div>
      </div>`;
      return;
    }
    container.innerHTML = `<div class="ocr-result">
      <h4 style="margin-bottom:var(--s-3)">🧠 Extracted Medicines (${results.length} found)</h4>
      ${results.map(r => `
        <div class="ocr-item">
          <span style="font-size:20px">${r.match.icon}</span>
          <div style="flex:1">
            <div style="font-weight:600;font-size:var(--text-sm)">${r.match.name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${r.match.gen} · ₹${r.match.price}</div>
            <span class="ocr-match ocr-exact">✓ Exact Match</span>
          </div>
          <button class="btn btn-p btn-sm" onclick="A.addCart('${r.match.id}')">+ Add</button>
        </div>
        ${r.fuzzy.length?r.fuzzy.map(f=>`<div class="ocr-item" style="padding-left:var(--s-8)">
          <span style="font-size:16px">${f.icon}</span>
          <div style="flex:1"><div style="font-size:var(--text-sm)">${f.name}</div><div style="font-size:11px;color:var(--text-muted)">₹${f.price}</div>
          <span class="ocr-match ocr-fuzzy">~ Similar</span></div>
          <button class="btn btn-s btn-sm" onclick="A.addCart('${f.id}')">+ Add</button>
        </div>`).join(''):''}
        ${r.alternatives.length?r.alternatives.map(a=>`<div class="ocr-item" style="padding-left:var(--s-8)">
          <span style="font-size:16px">${a.icon}</span>
          <div style="flex:1"><div style="font-size:var(--text-sm)">${a.name}</div><div style="font-size:11px;color:var(--text-muted)">₹${a.price} · Same category</div>
          <span class="ocr-match ocr-alt">⚡ Alternative</span></div>
          <button class="btn btn-s btn-sm" onclick="A.addCart('${a.id}')">+ Add</button>
        </div>`).join(''):''}
      `).join('')}
      <div style="margin-top:var(--s-4);display:flex;gap:var(--s-3)">
        <button class="btn btn-p btn-block" onclick="A.addAllOcr()">Add All Exact Matches</button>
      </div>
    </div>`;
    this._lastOcr = results;
  }

  addAllOcr() {
    if (!this._lastOcr) return;
    this._lastOcr.forEach(r => this.addCart(r.match.id));
    this.toast(`${this._lastOcr.length} medicines added to cart!`);
  }

  // ---- Order Tracking ----
  cTracking(oid) {
    const o = this.db.getOne('orders', oid || 'O2');
    if (!o) return `<div style="text-align:center;padding:var(--s-16)"><h3>Order not found</h3><button class="btn btn-p" onclick="history.back()">Go Back</button></div>`;
    const states = ['pending','accepted','preparing','packed','out_for_delivery','delivered'];
    const labels = ['Placed','Accepted','Preparing','Packed','On the Way','Delivered'];
    const icons = ['📋','✅','⚙️','📦','🏍️','🎉'];
    const ci = states.indexOf(o.status); const pct = ci >= 0 ? (ci / (states.length - 1)) * 100 : 0;
    return `<div class="trk">
      <div class="trk-head"><div class="trk-oid">Order #${o.id}</div><div class="trk-eta"><span>⏱️</span><span>${o.status==='delivered'?'Delivered':'~25 min'}</span></div><div class="trk-status">${labels[ci]||'Processing'}</div></div>
      <div class="trk-steps"><div class="trk-line" style="width:${pct}%"></div>
        ${states.map((s,i)=>`<div class="trk-step ${i<ci?'done':''} ${i===ci?'now':''}"><div class="ts-dot">${i<=ci?icons[i]:''}</div><span class="ts-lbl">${labels[i]}</span></div>`).join('')}
      </div>
      <div class="trk-map">🗺️<div class="trk-map-bar">📍 Live tracking · ${o.phName} → Your location</div></div>
      <div class="card" style="margin-bottom:var(--s-4)"><div class="card-body">
        <h4 style="margin-bottom:var(--s-4)">📍 Timeline</h4>
        <div class="timeline">${states.slice(0,ci+1).reverse().map((s,i)=>`<div class="tl-item ${i===0?'':'done'}"><div class="tl-dot ${i===0?'now':'done'}">${icons[ci-i]}</div><div class="tl-body"><h4>${labels[ci-i]}</h4><p>${new Date(o.updatedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p></div></div>`).join('')}</div>
      </div></div>
      <div class="card" style="margin-bottom:var(--s-4)"><div class="card-body">
        <h4 style="margin-bottom:var(--s-3)">📦 Items</h4>
        ${o.items.map(it=>`<div style="display:flex;justify-content:space-between;padding:var(--s-2) 0;font-size:var(--text-sm)"><span>${it.name} × ${it.qty}</span><span style="font-weight:600">₹${it.price*it.qty}</span></div>`).join('')}
        <div style="border-top:1px solid var(--border);margin-top:var(--s-3);padding-top:var(--s-3);display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span style="color:var(--primary)">₹${o.total}</span></div>
      </div></div>
      ${o.dName?`<div class="card"><div class="card-body" style="display:flex;align-items:center;gap:var(--s-4)"><div class="avatar av-lg">🏍️</div><div style="flex:1"><h4>${o.dName}</h4><p style="font-size:var(--text-sm);color:var(--text-secondary)">Delivery Partner</p></div><button class="btn btn-p btn-sm" onclick="A.toast('Calling...','info')">📞 Call</button></div></div>`:''}
    </div>`;
  }

  // ---- Orders ----
  cOrders() {
    const ords = this.db.get('orders').filter(o => o.uid === 'U1').reverse();
    const sc = {pending:'badge-w',accepted:'badge-i',preparing:'badge-i',packed:'badge-p',out_for_delivery:'badge-p',delivered:'badge-s',cancelled:'badge-e'};
    const sl = {pending:'Pending',accepted:'Accepted',preparing:'Preparing',packed:'Packed',out_for_delivery:'On the Way',delivered:'Delivered',cancelled:'Cancelled'};
    return `<div style="padding:var(--s-4)"><h3 style="margin-bottom:var(--s-4)">📦 My Orders</h3>
      ${!ords.length?`<div style="text-align:center;padding:var(--s-16)"><div style="font-size:48px;margin-bottom:var(--s-4)">📦</div><h3>No orders yet</h3><button class="btn btn-p" style="margin-top:var(--s-6)" onclick="location.hash='#/customer/home'">Start Shopping</button></div>`
       :ords.map(o=>`<div class="ord-c" onclick="location.hash='#/customer/tracking/${o.id}'"><div class="ord-top"><span class="ord-ph">${o.phName}</span><span class="badge ${sc[o.status]}">${sl[o.status]}</span></div><div class="ord-items">${o.items.map(i=>i.name).join(', ')}</div><div class="ord-bot"><span class="ord-total">₹${o.total}</span><span class="ord-date">${new Date(o.createdAt).toLocaleDateString('en-IN')}</span></div>${o.emergency?'<span class="emg" style="margin-top:var(--s-2)">🚨 Emergency</span>':''}</div>`).join('')}
    </div>`;
  }

  // ---- Profile ----
  cProfile() {
    const u = this.db.getOne('users','U1') || this.user;
    const ords = this.db.get('orders').filter(o=>o.uid==='U1');
    const spent = ords.reduce((s,o)=>s+o.total,0);
    return `<div class="prof">
      <div class="prof-head"><div class="avatar av-xl">${u?.avatar||'RS'}</div><h2>${u?.name||this.user?.name}</h2><p>+91 ${u?.phone||this.user?.phone}</p></div>
      <div class="prof-stats"><div class="ps-item"><div class="ps-num">${ords.length}</div><div class="ps-lbl">Orders</div></div><div class="ps-item"><div class="ps-num">₹${spent}</div><div class="ps-lbl">Spent</div></div><div class="ps-item"><div class="ps-num">${u?.saved?.length||0}</div><div class="ps-lbl">Saved</div></div></div>
      <div class="menu-list">
        <div class="menu-item" onclick="location.hash='#/customer/orders'"><div class="mi-icon" style="background:var(--primary-subtle);color:var(--primary)">📋</div><div class="mi-text"><h4>My Orders</h4><p>View order history</p></div><span class="mi-arrow">→</span></div>
        <div class="menu-item" onclick="A.toast('Coming soon','info')"><div class="mi-icon" style="background:var(--error-bg);color:var(--error)">❤️</div><div class="mi-text"><h4>Saved Items</h4><p>${u?.saved?.length||0} items</p></div><span class="mi-arrow">→</span></div>
        <div class="menu-item" onclick="A.toast('Coming soon','info')"><div class="mi-icon" style="background:var(--info-bg);color:var(--info)">📍</div><div class="mi-text"><h4>Addresses</h4><p>${u?.addresses?.length||0} saved</p></div><span class="mi-arrow">→</span></div>
        <div class="menu-item" onclick="location.hash='#/customer/prescription'"><div class="mi-icon" style="background:var(--warning-bg);color:var(--warning)">📋</div><div class="mi-text"><h4>Prescriptions</h4><p>Upload & manage</p></div><span class="mi-arrow">→</span></div>
      </div>
      <div class="menu-list">
        <div class="menu-item" onclick="A.toast('Coming soon','info')"><div class="mi-icon" style="background:var(--success-bg);color:var(--success)">🔔</div><div class="mi-text"><h4>Notifications</h4><p>Manage preferences</p></div><span class="mi-arrow">→</span></div>
        <div class="menu-item" onclick="A.toast('Coming soon','info')"><div class="mi-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">❓</div><div class="mi-text"><h4>Help & Support</h4><p>FAQs, contact</p></div><span class="mi-arrow">→</span></div>
      </div>
      <button class="btn btn-d btn-block" style="margin-top:var(--s-4)" onclick="A.logout()">🚪 Logout</button>
      <p style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:var(--s-6)">DORMEDS v2.0 · Made with ❤️ in India</p>
    </div>`;
  }

  reorder() {
    const last = this.db.get('orders').find(o=>o.uid==='U1'&&o.status==='delivered');
    if (last) { last.items.forEach(i=>this.addCart(i.mid)); location.hash='#/customer/cart'; }
  }

  // ===== DASHBOARD SHELL (Pharmacy / Delivery / Admin) =====
  viewDash(app, role, v, p) {
    const navs = {
      pharmacy: [{id:'home',icon:'📊',l:'Dashboard'},{id:'orders',icon:'📋',l:'Orders'},{id:'inventory',icon:'💊',l:'Inventory'},{id:'pricing',icon:'💰',l:'Pricing'}],
      delivery: [{id:'home',icon:'📊',l:'Dashboard'},{id:'orders',icon:'📦',l:'Deliveries'},{id:'map',icon:'🗺️',l:'Navigation'},{id:'earnings',icon:'💰',l:'Earnings'}],
      admin: [{id:'home',icon:'📊',l:'Dashboard'},{id:'users',icon:'👥',l:'Users'},{id:'pharmacies',icon:'🏪',l:'Pharmacies'},{id:'orders',icon:'📋',l:'Orders'},{id:'coupons',icon:'🎟️',l:'Coupons'},{id:'analytics',icon:'📈',l:'Analytics'}],
    };
    const rLabels = {pharmacy:'Pharmacy Panel',delivery:'Delivery App',admin:'Admin Panel'};
    const viewFns = {
      pharmacy:{home:()=>this.phDash(),orders:()=>this.phOrders(),inventory:()=>this.phInventory(),pricing:()=>this.phPricing()},
      delivery:{home:()=>this.delDash(),orders:()=>this.delOrders(),map:()=>this.delMap(),earnings:()=>this.delEarnings()},
      admin:{home:()=>this.admDash(),users:()=>this.admUsers(),pharmacies:()=>this.admPharma(),orders:()=>this.admOrders(),coupons:()=>this.admCoupons(),analytics:()=>this.admAnalytics()},
    };
    const content = (viewFns[role]?.[v] || viewFns[role]?.home || (() => ''))();
    const items = navs[role] || [];
    app.innerHTML = `<div class="dash">
      <aside class="side" id="sidebar"><div class="side-head"><img src="assets/icon.png" class="side-logo-img" alt="DORMEDS" /><span class="side-brand">DORMEDS</span></div>
        <nav class="side-nav"><div class="side-sec"><div class="side-sec-t">${rLabels[role]}</div>
          ${items.map(i=>`<div class="side-link ${v===i.id?'on':''}" onclick="location.hash='#/${role}/${i.id}'"><span class="sl-icon">${i.icon}</span>${i.l}</div>`).join('')}
        </div></nav>
        <div class="side-foot"><div class="side-link" onclick="A.logout()" style="color:var(--error)"><span class="sl-icon">🚪</span>Logout</div></div>
      </aside>
      <div class="side-ov" id="sideOv" onclick="document.getElementById('sidebar').classList.remove('open');this.classList.remove('vis')"></div>
      <main class="main"><header class="main-head"><div style="display:flex;align-items:center;gap:var(--s-3)"><button class="btn btn-g btn-icon" style="display:none" onclick="document.getElementById('sidebar').classList.add('open');document.getElementById('sideOv').classList.add('vis')" id="menuBtn">☰</button><h1>${rLabels[role]}</h1></div><div style="display:flex;align-items:center;gap:var(--s-3)"><button class="hdr-btn" onclick="A.toast('Notifications','info')">🔔</button><div class="avatar">${this.user?.avatar||'?'}</div></div></header>
        <div class="main-body page">${content}</div>
      </main>
    </div>`;
    // Show hamburger on mobile
    if (window.innerWidth <= 1024) document.getElementById('menuBtn').style.display = 'flex';
  }

  // ===== PHARMACY =====
  phDash() {
    const ords = this.db.get('orders').filter(o=>o.phId==='P1');
    const pend = ords.filter(o=>o.status==='pending').length;
    const prep = ords.filter(o=>['accepted','preparing'].includes(o.status)).length;
    const done = ords.filter(o=>o.status==='delivered').length;
    const rev = ords.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total,0);
    const recent = ords.slice(-5).reverse();
    return `<div class="stats-g">
      <div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">📦</div><div class="st-val">${pend}</div><div class="st-label">Pending</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--info-bg);color:var(--info)">⚙️</div><div class="st-val">${prep}</div><div class="st-label">Preparing</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">✅</div><div class="st-val">${done}</div><div class="st-label">Delivered</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">💰</div><div class="st-val">₹${rev.toLocaleString()}</div><div class="st-label">Revenue</div></div>
    </div>
    <div class="chart"><div class="chart-head"><h3>📈 Weekly Revenue</h3></div><div class="chart-bars" style="height:200px">
      ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>{const h=[45,65,55,80,70,90,60][i];return`<div class="chart-bar" style="height:${h}%"><span class="cb-val">₹${h*50}</span><span class="cb-lbl">${d}</span></div>`}).join('')}
    </div></div>
    <div class="card" style="margin-top:var(--s-6)"><div class="card-head" style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-size:var(--text-base)">📋 Recent Orders</h3><button class="btn btn-g btn-sm" onclick="location.hash='#/pharmacy/orders'">View All →</button></div>
      ${recent.map(o=>`<div class="dl-item"><div class="dl-av">${o.items[0]?.name?.[0]||'📦'}</div><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:var(--text-sm)">#${o.id}</div><div style="font-size:11px;color:var(--text-secondary)">${o.uName}</div></div><div style="text-align:right"><div style="font-weight:700;font-size:var(--text-sm)">₹${o.total}</div><span class="badge ${o.status==='delivered'?'badge-s':o.status==='pending'?'badge-w':'badge-i'}" style="font-size:10px">${o.status}</span></div></div>`).join('')}
    </div>`;
  }

  phOrders() {
    const ords = this.db.get('orders').filter(o=>o.phId==='P1').reverse();
    const sc = {pending:'badge-w',accepted:'badge-i',preparing:'badge-i',packed:'badge-s',out_for_delivery:'badge-p',delivered:'badge-s',cancelled:'badge-e'};
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-4)"><h2 style="font-size:var(--text-xl)">Order Management</h2></div>
      ${ords.map(o=>`<div class="card" style="margin-bottom:var(--s-4)"><div class="card-head" style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:600">#${o.id}</div><div style="font-size:var(--text-sm);color:var(--text-secondary)">${o.uName} · ${new Date(o.createdAt).toLocaleString('en-IN')}</div></div><span class="badge ${sc[o.status]||'badge-n'}">${o.status.replace(/_/g,' ').toUpperCase()}</span></div>
      <div class="card-body">${o.items.map(it=>`<div style="display:flex;justify-content:space-between;padding:var(--s-2) 0;font-size:var(--text-sm)"><span>${it.name} ×${it.qty}</span><span style="font-weight:600">₹${it.price*it.qty}</span></div>`).join('')}
      <div style="border-top:1px solid var(--border);margin-top:var(--s-3);padding-top:var(--s-3);display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700">Total: ₹${o.total}</span>
      <div style="display:flex;gap:var(--s-2)">${o.status==='pending'?`<button class="btn btn-p btn-sm" onclick="A.updOrd('${o.id}','accepted')">✅ Accept</button><button class="btn btn-d btn-sm" onclick="A.updOrd('${o.id}','cancelled')">❌ Reject</button>`:o.status==='accepted'?`<button class="btn btn-p btn-sm" onclick="A.updOrd('${o.id}','preparing')">⚙️ Start Preparing</button>`:o.status==='preparing'?`<button class="btn btn-p btn-sm" onclick="A.updOrd('${o.id}','packed')">📦 Mark Packed</button>`:o.status==='packed'?`<span class="badge badge-s">Waiting for pickup</span>`:''}
      ${o.hasRx?`<button class="btn btn-g btn-sm" onclick="A.toast('Prescription viewer','info')">📋 View Rx</button>`:''}</div></div></div></div>`).join('')}`;
  }

  updOrd(oid, status) {
    const o = this.db.getOne('orders', oid);
    if (!o) { this.toast('Order not found', 'error'); return; }
    // Validate transition
    if (!this.db.canTransition(o.status, status)) { this.toast('Invalid status transition', 'error'); return; }
    this.db.update('orders', oid, { status, updatedAt: new Date().toISOString() });
    // Auto-assign delivery for packed orders
    if (status === 'packed') {
      const dp = this.db.findDeliveryPartner();
      if (dp) this.db.update('orders', oid, { dId: dp.id, dName: dp.name });
    }
    // If pharmacy rejects ➝ unblock stock  
    if (status === 'cancelled' && o.items) {
      const meds = this.db.get('medicines');
      o.items.forEach(it => { const i = meds.findIndex(m=>m.id===it.mid); if(i!==-1){meds[i].stock+=it.qty;} });
      this.db.set('medicines', meds);
    }
    this.toast(`Order #${oid} → ${status.replace(/_/g,' ')}`);
    this.route();
  }

  phInventory() {
    const meds = this.db.get('medicines').filter(m=>m.phId==='P1');
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-4)"><h2 style="font-size:var(--text-xl)">Inventory</h2><button class="btn btn-p btn-sm" onclick="A.toast('Add medicine form coming soon','info')">+ Add Medicine</button></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Medicine</th><th>Category</th><th>Stock</th><th>MRP</th><th>Price</th><th>Actions</th></tr></thead><tbody>
      ${meds.map(m=>`<tr><td><div style="display:flex;align-items:center;gap:var(--s-3)"><span style="font-size:20px">${m.icon}</span><div><div style="font-weight:600">${m.name}</div><div style="font-size:11px;color:var(--text-muted)">${m.gen}</div></div></div></td>
      <td><span class="badge badge-n">${m.cat}</span></td>
      <td><div style="display:flex;align-items:center;gap:var(--s-2)"><span style="width:8px;height:8px;border-radius:50%;background:${m.stock>50?'var(--success)':m.stock>10?'var(--warning)':'var(--error)'}"></span>${m.stock}</div></td>
      <td>₹${m.mrp}</td><td style="color:var(--primary);font-weight:600">₹${m.price}</td>
      <td><div style="display:flex;gap:var(--s-2)"><button class="btn btn-g btn-sm" onclick="A.toast('Edit coming soon','info')">✏️</button></div></td></tr>`).join('')}
    </tbody></table></div>`;
  }

  phPricing() {
    const meds = this.db.get('medicines').filter(m=>m.phId==='P1');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">💰 Pricing</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Medicine</th><th>MRP</th><th>Selling</th><th>Discount</th><th>Margin</th></tr></thead><tbody>
      ${meds.map(m=>`<tr><td style="font-weight:600">${m.name}</td><td>₹${m.mrp}</td><td style="color:var(--primary);font-weight:700">₹${m.price}</td><td><span class="badge badge-s">${m.off}%</span></td><td>₹${m.mrp-m.price}</td></tr>`).join('')}
    </tbody></table></div>`;
  }

  // ===== DELIVERY =====
  delDash() {
    const dp = this.db.getOne('deliveryPartners','D1');
    const ords = this.db.get('orders').filter(o=>o.dId==='D1');
    const active = ords.filter(o=>['packed','out_for_delivery'].includes(o.status));
    const done = ords.filter(o=>o.status==='delivered').length;
    return `<div class="earn-card"><div class="earn-period">Today's Earnings</div><div class="earn-amt">₹${Math.round((dp?.earnings||0)/30)}</div><div class="earn-sub">${done} deliveries completed</div></div>
    <div class="stats-g" style="grid-template-columns:repeat(3,1fr)"><div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">📦</div><div class="st-val">${active.length}</div><div class="st-label">Active</div></div><div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">✅</div><div class="st-val">${done}</div><div class="st-label">Done</div></div><div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">⭐</div><div class="st-val">${dp?.rating||0}</div><div class="st-label">Rating</div></div></div>
    ${active.length?`<h3 style="margin-bottom:var(--s-4)">🏍️ Active Deliveries</h3>${active.map(o=>this.delCard(o)).join('')}`:`<div style="text-align:center;padding:var(--s-10)"><div style="font-size:48px;margin-bottom:var(--s-4)">🏍️</div><h3>No active deliveries</h3><p style="color:var(--text-secondary);margin-top:var(--s-2)">Waiting for assignments</p></div>`}`;
  }

  delCard(o) {
    const actions = {packed:{l:'📦 Pick Up',next:'out_for_delivery'},out_for_delivery:{l:'✅ Delivered',next:'delivered'}};
    const act = actions[o.status];
    return `<div class="del-card"><div class="del-head"><div><div style="font-weight:600">#${o.id}</div><div style="font-size:11px;color:var(--text-secondary)">${o.uName}</div></div>${o.emergency?'<span class="emg">🚨 Emergency</span>':''}<span class="badge badge-p">${o.status.replace(/_/g,' ')}</span></div>
    <div class="del-body"><div class="del-loc"><div class="del-dots"><div class="del-dot"></div><div class="del-line"></div><div class="del-dot fill"></div></div><div style="flex:1"><div style="margin-bottom:var(--s-3)"><div class="del-lbl">Pickup</div><div class="del-addr">${o.phName}</div></div><div><div class="del-lbl">Delivery</div><div class="del-addr">${o.address}</div></div></div></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--s-3)"><span style="font-weight:700">₹${o.total} · ${o.payMethod}</span><span style="font-size:var(--text-sm);color:var(--text-secondary)">${o.items.length} items</span></div></div>
    ${act?`<div class="del-acts"><button class="btn btn-p btn-sm" style="flex:1" onclick="A.updOrd('${o.id}','${act.next}')">${act.l}</button><button class="btn btn-g btn-sm" onclick="A.toast('Calling...','info')">📞</button></div>`:''}</div>`;
  }

  delOrders() {
    const ords = this.db.get('orders').filter(o=>o.dId==='D1').reverse();
    const ready = this.db.get('orders').filter(o=>o.status==='packed'&&!o.dId);
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">📦 Deliveries</h2>
    ${ready.length?`<div class="sec-h"><h3>🆕 Available Pickups</h3></div>${ready.map(o=>`<div class="del-card"><div class="del-head"><div><strong>#${o.id}</strong></div><span class="badge badge-w">New</span></div><div class="del-body"><p style="font-size:var(--text-sm)">From: <strong>${o.phName}</strong></p><p style="font-size:var(--text-sm);color:var(--text-secondary)">To: ${o.address}</p><p style="margin-top:var(--s-2);font-weight:700">₹${o.total} · ${o.items.length} items</p></div><div class="del-acts"><button class="btn btn-p btn-sm" style="flex:1" onclick="A.acceptDel('${o.id}')">Accept 🏍️</button></div></div>`).join('')}`:''} 
    <div class="sec-h" style="margin-top:var(--s-4)"><h3>All Deliveries</h3></div>
    ${ords.length?ords.map(o=>this.delCard(o)).join(''):'<div style="text-align:center;padding:var(--s-10);color:var(--text-secondary)">No deliveries yet</div>'}`;
  }

  acceptDel(oid) {
    this.db.update('orders', oid, { dId:'D1', dName:'Ravi Kumar', status:'out_for_delivery', updatedAt:new Date().toISOString() });
    this.toast('Delivery accepted!');
    this.route();
  }

  delMap() {
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">🗺️ Navigation</h2>
    <div style="height:400px;background:var(--bg-surface);border-radius:var(--r-xl);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:var(--s-4);margin-bottom:var(--s-4)"><div style="font-size:48px">🗺️</div><h3>Live Map</h3><p style="color:var(--text-secondary);font-size:var(--text-sm)">Google Maps / Leaflet.js integration ready</p></div>
    <div class="card"><div class="card-body"><h4 style="margin-bottom:var(--s-3)">📍 Features</h4><div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:2">• Real-time GPS<br>• Optimal routes<br>• Turn-by-turn<br>• Traffic-aware ETA<br>• Pharmacy & customer pins</div></div></div>`;
  }

  delEarnings() {
    const dp = this.db.getOne('deliveryPartners','D1');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">💰 Earnings</h2>
    <div class="earn-card"><div class="earn-period">Total Earnings</div><div class="earn-amt">₹${dp?.earnings?.toLocaleString()||0}</div><div class="earn-sub">${dp?.deliveries||0} total deliveries</div></div>
    <div class="earn-grid"><div class="eg-item"><div class="eg-val">₹${Math.round((dp?.earnings||0)/30)}</div><div class="eg-lbl">Today</div></div><div class="eg-item"><div class="eg-val">₹${Math.round((dp?.earnings||0)/4)}</div><div class="eg-lbl">This Week</div></div><div class="eg-item"><div class="eg-val">₹${dp?.earnings?.toLocaleString()||0}</div><div class="eg-lbl">Month</div></div></div>
    <div class="chart"><div class="chart-head"><h3>📈 Trend</h3></div><div class="chart-bars" style="height:180px">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>{const h=[35,55,45,70,60,85,50][i];return`<div class="chart-bar" style="height:${h}%"><span class="cb-val">₹${h*20}</span><span class="cb-lbl">${d}</span></div>`}).join('')}</div></div>
    <div class="card" style="margin-top:var(--s-6)"><div class="card-body"><h4 style="margin-bottom:var(--s-3)">💡 Incentives</h4>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:var(--text-sm)"><span>Peak hour (12-2 PM)</span><span class="badge badge-s">+₹15/del</span></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:var(--text-sm)"><span>Rain bonus</span><span class="badge badge-i">+₹20/del</span></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:var(--text-sm)"><span>10+ deliveries/day</span><span class="badge badge-w">+₹100</span></div>
    </div></div>`;
  }

  // ===== ADMIN =====
  admDash() {
    const an = this.db.getObj('analytics');
    const ords = this.db.get('orders');
    const recent = ords.slice(-5).reverse();
    return `<div class="stats-g">
      <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">📦</div><div class="st-val">${an.totalOrders?.toLocaleString()}</div><div class="st-label">Total Orders</div><span class="st-delta st-up">↑ 12.5%</span></div>
      <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">💰</div><div class="st-val">₹${(an.totalRevenue/1e5).toFixed(1)}L</div><div class="st-label">Revenue</div><span class="st-delta st-up">↑ 8.3%</span></div>
      <div class="stat"><div class="st-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">👥</div><div class="st-val">${an.totalUsers?.toLocaleString()}</div><div class="st-label">Users</div><span class="st-delta st-up">↑ 15.2%</span></div>
      <div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">🏪</div><div class="st-val">${an.totalPharmacies}</div><div class="st-label">Pharmacies</div></div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:var(--s-6)">
      <div class="chart"><div class="chart-head"><h3>📈 Monthly Orders</h3></div><div class="chart-bars">${['J','F','M','A','M','J','J','A','S','O','N','D'].map((m,i)=>{const max=Math.max(...(an.monthly||[1]));const h=an.monthly?(an.monthly[i]/max)*100:50;return`<div class="chart-bar" style="height:${h}%"><span class="cb-val">${an.monthly?.[i]||0}</span><span class="cb-lbl">${m}</span></div>`}).join('')}</div></div>
      <div class="card"><div class="card-head"><h3 style="font-size:var(--text-base)">📊 By Status</h3></div><div class="card-body">${Object.entries(an.byStatus||{}).map(([s,c])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:var(--text-sm)"><span style="text-transform:capitalize">${s.replace(/_/g,' ')}</span><span style="font-weight:600">${c}</span></div>`).join('')}</div></div>
    </div>
    <div class="card" style="margin-top:var(--s-6)"><div class="card-head" style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-size:var(--text-base)">📋 Recent</h3><button class="btn btn-g btn-sm" onclick="location.hash='#/admin/orders'">View All →</button></div>
      ${recent.map(o=>`<div class="dl-item"><div class="dl-av">${o.uName?.[0]||'?'}</div><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:var(--text-sm)">#${o.id} · ${o.uName}</div><div style="font-size:11px;color:var(--text-secondary)">${o.phName}</div></div><div style="text-align:right"><div style="font-weight:700">₹${o.total}</div><div style="font-size:11px;color:var(--text-muted)">${o.status}</div></div></div>`).join('')}
    </div>`;
  }

  admUsers() {
    const users = this.db.get('users');
    const dps = this.db.get('deliveryPartners');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">👥 Users</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>User</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
      ${users.map(u=>`<tr><td style="display:flex;align-items:center;gap:var(--s-3)"><div class="avatar av-sm">${u.avatar}</div><div><div style="font-weight:600">${u.name}</div><div style="font-size:11px;color:var(--text-muted)">${u.email}</div></div></td><td>+91 ${u.phone}</td><td><span class="badge badge-p">${u.role}</span></td><td style="font-size:var(--text-sm)">${new Date(u.createdAt).toLocaleDateString('en-IN')}</td><td><button class="btn btn-g btn-sm">👁️</button></td></tr>`).join('')}
      ${dps.map(d=>`<tr><td style="display:flex;align-items:center;gap:var(--s-3)"><div class="avatar av-sm">${d.avatar}</div><div><div style="font-weight:600">${d.name}</div><div style="font-size:11px;color:var(--text-muted)">${d.vehicle} · ${d.plate}</div></div></td><td>+91 ${d.phone}</td><td><span class="badge badge-i">delivery</span></td><td style="font-size:var(--text-sm)">${d.createdAt}</td><td><button class="btn btn-g btn-sm">👁️</button></td></tr>`).join('')}
    </tbody></table></div>`;
  }

  admPharma() {
    const phs = this.db.get('pharmacies');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">🏪 Pharmacies</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Pharmacy</th><th>Owner</th><th>Status</th><th>Commission</th><th>Rating</th><th>Actions</th></tr></thead><tbody>
      ${phs.map(p=>`<tr><td><div style="font-weight:600">${p.name}</div><div style="font-size:11px;color:var(--text-muted)">${p.loc.address}</div></td><td>${p.owner}</td><td><span class="badge ${p.status==='approved'?'badge-s':'badge-w'}">${p.status}</span></td><td>${p.commission}%</td><td>⭐ ${p.rating||'-'}</td>
      <td>${p.status==='pending'?`<button class="btn btn-p btn-sm" onclick="A.approvePh('${p.id}')">✅ Approve</button>`:`<button class="btn btn-g btn-sm" onclick="A.toast('Edit','info')">✏️</button>`}</td></tr>`).join('')}
    </tbody></table></div>`;
  }

  approvePh(id) { this.db.update('pharmacies',id,{status:'approved',active:true}); this.toast('Pharmacy approved!'); this.route(); }

  admOrders() {
    const ords = this.db.get('orders').reverse();
    const sc = {pending:'badge-w',accepted:'badge-i',preparing:'badge-i',packed:'badge-p',out_for_delivery:'badge-p',delivered:'badge-s',cancelled:'badge-e'};
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">📋 All Orders</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Customer</th><th>Pharmacy</th><th>Amount</th><th>Status</th><th>Payment</th><th>Date</th></tr></thead><tbody>
      ${ords.map(o=>`<tr><td style="font-weight:600">#${o.id}</td><td>${o.uName}</td><td>${o.phName}</td><td style="font-weight:700">₹${o.total}</td><td><span class="badge ${sc[o.status]||'badge-n'}">${o.status.replace(/_/g,' ')}</span></td><td>${o.payMethod} · <span style="color:${o.payStatus==='paid'?'var(--success)':'var(--warning)'}">${o.payStatus}</span></td><td style="font-size:var(--text-sm)">${new Date(o.createdAt).toLocaleDateString('en-IN')}</td></tr>`).join('')}
    </tbody></table></div>`;
  }

  admCoupons() {
    const cpns = this.db.get('coupons');
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-4)"><h2 style="font-size:var(--text-xl)">🎟️ Coupons</h2><button class="btn btn-p btn-sm" onclick="A.toast('Create coupon coming soon','info')">+ Create</button></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--s-4)">
      ${cpns.map(c=>`<div class="cpn"><div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--s-2)"><span class="cpn-code">${c.code}</span><span class="badge ${c.active?'badge-s':'badge-e'}">${c.active?'Active':'Off'}</span></div><div class="cpn-desc">${c.desc}</div><div class="cpn-meta"><span>👥 ${c.used}</span><span>🔄 ${c.limit}/user</span><span>📅 ${c.exp}</span></div>
      <div style="display:flex;gap:var(--s-2);margin-top:var(--s-3)"><button class="btn btn-g btn-sm" onclick="A.toast('Edit','info')">✏️</button><button class="btn btn-g btn-sm" style="color:var(--error)" onclick="A.toggleCpn('${c.id}')">${c.active?'⏸ Disable':'▶ Enable'}</button></div></div>`).join('')}
    </div>`;
  }

  toggleCpn(id) { const c = this.db.getOne('coupons',id); if(c){this.db.update('coupons',id,{active:!c.active});this.toast(`Coupon ${c.active?'disabled':'enabled'}`);this.route();} }

  admAnalytics() {
    const an = this.db.getObj('analytics');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">📈 Analytics</h2>
    <div class="stats-g"><div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">📦</div><div class="st-val">${an.totalOrders?.toLocaleString()}</div><div class="st-label">Orders</div></div><div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">💰</div><div class="st-val">₹${(an.totalRevenue/1e5).toFixed(1)}L</div><div class="st-label">Revenue</div></div><div class="stat"><div class="st-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">👥</div><div class="st-val">${an.totalUsers?.toLocaleString()}</div><div class="st-label">Users</div></div><div class="stat"><div class="st-icon" style="background:var(--info-bg);color:var(--info)">🏍️</div><div class="st-val">${an.totalDel}</div><div class="st-label">Partners</div></div></div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:var(--s-6)">
      <div class="chart"><div class="chart-head"><h3>📊 Monthly Revenue</h3></div><div class="chart-bars">${['J','F','M','A','M','J','J','A','S','O','N','D'].map((m,i)=>{const max=Math.max(...(an.monthRev||[1]));const h=an.monthRev?(an.monthRev[i]/max)*100:50;return`<div class="chart-bar" style="height:${h}%;background:linear-gradient(180deg,#8B5CF6,#5B21B6)"><span class="cb-val">₹${((an.monthRev?.[i]||0)/1e3).toFixed(0)}K</span><span class="cb-lbl">${m}</span></div>`}).join('')}</div></div>
      <div class="card"><div class="card-head"><h3 style="font-size:var(--text-base)">🔥 Top Medicines</h3></div><div class="card-body">${(an.topMedicines||an.topMeds||[]).map((m,i)=>`<div style="display:flex;align-items:center;gap:var(--s-3);padding:10px 0;border-bottom:1px solid var(--border)"><div class="avatar av-sm" style="background:${['var(--primary)','#8B5CF6','var(--warning)','var(--success)','#EC4899'][i]}">${i+1}</div><span style="font-size:var(--text-sm);font-weight:500">${m}</span></div>`).join('')}</div></div>
    </div>
    <div class="card" style="margin-top:var(--s-6)"><div class="card-head"><h3 style="font-size:var(--text-base)">🛡️ Fraud Monitoring</h3></div><div class="card-body"><div style="display:flex;gap:var(--s-4)">
      <div class="stat" style="flex:1;text-align:center"><div class="st-val" style="color:var(--success)">0</div><div class="st-label">Fraud Alerts</div></div>
      <div class="stat" style="flex:1;text-align:center"><div class="st-val" style="color:var(--warning)">2</div><div class="st-label">Suspicious</div></div>
      <div class="stat" style="flex:1;text-align:center"><div class="st-val" style="color:var(--error)">0</div><div class="st-label">Blocked</div></div>
    </div></div></div>`;
  }
}

// ---- Boot ----
let A;
document.addEventListener('DOMContentLoaded', () => { A = new DormedsApp(); A.init(); });
// Close search dropdown on outside click
document.addEventListener('click', e => {
  const d = document.getElementById('searchDrop');
  if (d && !e.target.closest('.search')) d.style.display = 'none';
});
function searchMedicine() {
  let input = document.getElementById("searchInput").value.toLowerCase();
if (!input) {
    document.getElementById("result").innerText = "Enter medicine name";
    return;
}
  if (input === "paracetamol") {
    document.getElementById("result").innerText = "Available - ₹20";
  } else if (input === "crocin") {
    document.getElementById("result").innerText = "Available - ₹25";
  } else {
    document.getElementById("result").innerText = "Medicine not found";
  }
}
function uploadPrescription() {
  let file = document.getElementById("prescriptionFile").files[0];

  if (!file) {
    alert("Please upload file");
    return;
  }

  // Show image preview
  let preview = document.getElementById("preview");
  if (preview.src) {
    URL.revokeObjectURL(preview.src);
}
preview.src = URL.createObjectURL(file);
  // Fake "AI converted text"
  "Paracetamol 500mg - 2 times daily <br> Ibuprofen - after food";
}

function acceptPrescription() {
  document.getElementById("status").innerText = "✅ Accepted by Pharmacy";
}

function rejectPrescription() {
  document.getElementById("status").innerText = "❌ Rejected by Pharmacy";
}
