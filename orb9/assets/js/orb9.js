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
  panel.onclick = e => { if (e.target.classList.contains('cart-close')) panel.classList.remove('open'); if (e.target.dataset.remove !== undefined) { cart.splice(Number(e.target.dataset.remove), 1); save(); render(); } if (e.target.classList.contains('cart-checkout')) document.querySelector('.cart-message').textContent = 'Checkout is ready for your payment provider connection.'; };
  const text = html => { const el = document.createElement('div'); el.innerHTML = html || ''; return el.textContent.trim(); };
  const productPrice = product => Number(product.prices?.price || product.price || 0) / 10 ** Number(product.prices?.currency_minor_unit || 2);
  const renderProducts = products => {
    const grid = document.querySelector('#shop .grid');
    grid.textContent = '';
    if (!products.length) { grid.innerHTML = '<p class="meta">No products are currently available.</p>'; return; }
    products.forEach(product => {
      const price = productPrice(product);
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.productId = product.id;
      const descriptionHtml = product.short_description || product.description || '';
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
      description.textContent = text(product.short_description || product.description) || `PRODUCT ID ${product.id}`;
      const priceEl = document.createElement('p');
      priceEl.className = 'price';
      priceEl.textContent = money(price);
      const stock = document.createElement('span');
      stock.className = 'meta';
      stock.textContent = product.stock_status === 'outofstock' ? 'SOLD OUT' : 'IN STOCK';
      const button = document.createElement('button');
      button.className = 'btn add-cart';
      button.textContent = product.stock_status === 'outofstock' ? 'SOLD OUT' : 'ADD TO BAG';
      button.disabled = product.stock_status === 'outofstock';
      button.onclick = () => { const item = cart.find(x => x.id === product.id); item ? item.qty++ : cart.push({ id: product.id, name: product.name, price, img: image.src, qty: 1 }); save(); count(); button.textContent = 'ADDED ✓'; setTimeout(() => { button.textContent = 'ADD TO BAG'; }, 1200); };
      card.append(image, link, description, priceEl, stock, button);
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

