(() => {
  const key = 'orbi9-cart';
  const productsBaseUrl = window.orbi9Settings?.productsUrl || '/wp-json/wc/store/v1/products';
  const productsUrl = `${productsBaseUrl}?featured=1`;
  let cart = JSON.parse(localStorage.getItem(key) || '[]');
  const money = n => `$${Number(n).toFixed(2)}`;
  const save = () => localStorage.setItem(key, JSON.stringify(cart));
  const count = () => document.getElementById('cart-count').textContent = cart.reduce((a, x) => a + x.qty, 0);
  const panel = document.createElement('aside');
  panel.id = 'cart-panel'; panel.innerHTML = '<button class="cart-close" aria-label="Close shopping bag">×</button><h2>YOUR SHOPPING BAG</h2><div id="cart-items"></div><div class="cart-total"></div><button class="btn cart-checkout">CHECKOUT</button><p class="cart-message"></p>';
  document.body.append(panel);
  const render = () => { const el = document.getElementById('cart-items'); el.innerHTML = cart.length ? cart.map((x, i) => `<div class="cart-item"><span>${x.name}<small>${money(x.price)} × ${x.qty}</small></span><button data-remove="${i}">Remove</button></div>`).join('') : '<p class="meta">Your bag is empty.</p>'; document.querySelector('.cart-total').textContent = cart.length ? `TOTAL ${money(cart.reduce((a,x) => a + x.price*x.qty, 0))}` : ''; count(); };
  const open = () => { panel.classList.add('open'); render(); };
  document.getElementById('cart-button').onclick = open;
  document.getElementById('cart-button').onkeydown = e => { if (e.key === 'Enter') open(); };
  panel.onclick = e => { if (e.target.classList.contains('cart-close')) panel.classList.remove('open'); if (e.target.dataset.remove !== undefined) { cart.splice(Number(e.target.dataset.remove), 1); save(); render(); } if (e.target.classList.contains('cart-checkout')) checkout(); };
  const checkout = async () => {
    const message = document.querySelector('.cart-message');
    if (!cart.length) { message.textContent = 'Your bag is empty.'; return; }
    const checkoutUrl = window.orbi9Settings?.checkoutUrl;
    if (!checkoutUrl) { message.textContent = 'Checkout is temporarily unavailable. Please try again soon.'; return; }
    const button = panel.querySelector('.cart-checkout');
    button.disabled = true;
    message.textContent = 'Opening secure checkout…';
    try {
      const response = await fetch(checkoutUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.map(({ id, name, price, qty }) => ({ id, name, price, quantity: qty })) }) });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.message || 'Checkout could not be started');
      window.location.assign(result.url);
    } catch (error) {
      button.disabled = false;
      message.textContent = error.message || 'Checkout could not be started. Please try again.';
    }
  };
  const text = html => { const el = document.createElement('div'); el.innerHTML = html || ''; return el.textContent.trim(); };
  const productPrice = product => Number(product.prices?.price || product.price || 0) / 10 ** Number(product.prices?.currency_minor_unit || 2);
  const stockLimit = product => product.is_in_stock === false || product.stock_status === 'outofstock' ? 0 : (product.stock_quantity !== null && product.stock_quantity !== undefined && Number.isFinite(Number(product.stock_quantity)) ? Math.max(0, Number(product.stock_quantity)) : Infinity);
  const renderProducts = products => {
    const grid = document.querySelector('#shop .grid');
    grid.textContent = '';
    if (!products.length) { grid.innerHTML = '<p class="meta">No products are currently available.</p>'; return; }
    products.forEach(product => {
      const price = productPrice(product);
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.productId = product.id;
      const descriptionHtml = product.short_description || '';
      const descriptionImage = descriptionHtml.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
      const image = document.createElement('img');
      image.src = product.images?.[0]?.src || descriptionImage || '/public/orbi9newlogo.png';
      image.alt = product.images?.[0]?.alt || product.name;
      const link = document.createElement('a');
      link.href = product.permalink || '#';
      const name = document.createElement('h3');
      name.textContent = product.name;
      link.append(name);
      const description = document.createElement('span');
      description.className = 'meta';
      description.textContent = text(product.short_description) || `PRODUCT ID ${product.id}`;
      const priceEl = document.createElement('p');
      priceEl.className = 'price';
      priceEl.textContent = money(price);
      const available = stockLimit(product);
      const stock = document.createElement('span');
      stock.className = 'meta';
      stock.textContent = available === 0 ? 'SOLD OUT' : available === Infinity ? 'IN STOCK' : `${available} IN STOCK`;
      const quantity = document.createElement('input');
      quantity.className = 'card-quantity';
      quantity.type = 'number'; quantity.min = '1'; quantity.value = '1';
      if (available !== Infinity) quantity.max = String(available);
      quantity.setAttribute('aria-label', `Quantity for ${product.name}`);
      const button = document.createElement('button');
      button.className = 'btn add-cart';
      button.textContent = available === 0 ? 'SOLD OUT' : 'ADD TO BAG';
      button.disabled = available === 0;
      button.onclick = () => { const requested = Math.max(1, Number(quantity.value) || 1); const item = cart.find(x => x.id === product.id); const current = item?.qty || 0; const qty = Math.min(requested, available === Infinity ? requested : Math.max(0, available - current)); if (!qty) { stock.textContent = 'MAXIMUM IN CART'; return; } item ? item.qty += qty : cart.push({ id: product.id, name: product.name, price, img: image.src, qty }); save(); count(); button.textContent = 'ADDED ✓'; setTimeout(() => { button.textContent = 'ADD TO BAG'; }, 1200); };
      card.append(image, link, description, priceEl, stock, quantity, button);
      grid.append(card);
    });
  };
  const loadProducts = async () => {
    try {
      const response = await fetch(productsUrl);
      if (!response.ok) throw new Error(`WooCommerce responded with ${response.status}`);
      const featured = await response.json();
      if (featured.length) renderProducts(featured);
      else {
        const allResponse = await fetch(productsBaseUrl);
        if (!allResponse.ok) throw new Error(`WooCommerce responded with ${allResponse.status}`);
        renderProducts(await allResponse.json());
      }
    } catch (error) {
      console.warn('Unable to load WooCommerce products:', error);
      document.querySelector('#shop .grid').innerHTML = '<p class="meta">Products are temporarily unavailable.</p>';
    }
  };
  render();
  loadProducts();
})();

(()=>{const v=document.lastModified;setInterval(async()=>{try{const r=await fetch(location.href,{method:'HEAD',cache:'no-store'});if(r.headers.get('last-modified')&&r.headers.get('last-modified')!==v)location.reload()}catch{}} ,2000)})();

