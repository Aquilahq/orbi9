(() => {
  const STORAGE_KEY = 'orbi9-catalog-v2';
  const seed = [];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const slugify = value => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Admin products store uploaded/URL images in `images` and mark the selected
  // image with `primaryImage`; older imports may still use `image_url`.
  const productImage = product => {
    const images = Array.isArray(product?.images) ? product.images : [];
    const value = images[Number.isInteger(Number(product?.primaryImage)) ? Number(product.primaryImage) : 0] || images[0];
    return product?.image_url || (typeof value === 'string' ? value : value?.src || value?.url) || product?.image || '/orbi9newlogo.png';
  };
  const getProducts = () => { try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(data) ? data : seed; } catch { return seed; } };
  const saveProducts = products => localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  if (!localStorage.getItem(STORAGE_KEY)) saveProducts(seed);
  window.Orbi9Catalog = { getProducts, saveProducts, slugify };

  const style = document.createElement('style');
  style.textContent = `.orbi9-product-card{display:flex;flex-direction:column;overflow:hidden}.orbi9-product-card img{width:100%;aspect-ratio:1.15;object-fit:contain;background:#111}.orbi9-product-card .product-copy{padding:18px}.orbi9-product-card a{color:inherit;text-decoration:none}.orbi9-product-card .product-link{margin-top:14px;text-decoration:underline}.orbi9-detail{max-width:1100px;margin:60px auto;padding:0 24px;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px, .8fr);gap:48px}.orbi9-detail img{width:100%;max-height:620px;object-fit:contain;background:#111}.orbi9-detail-copy{align-self:center}.orbi9-detail-copy h1{font-size:clamp(32px,5vw,70px);margin:10px 0}.orbi9-detail-copy .detail-price{font-size:26px;margin:24px 0}.orbi9-detail-copy .detail-category{letter-spacing:.16em;text-transform:uppercase}.orbi9-back{display:inline-block;margin-top:30px;text-decoration:underline}.quick-add{margin:0 18px 18px;cursor:pointer}.quantity-label{display:flex;align-items:center;gap:12px;margin:18px 0}.detail-quantity{width:72px;padding:8px;background:#102538;color:#e9fbff;border:1px solid #56d9ff}.stock-status{color:#8db7c9}@media(max-width:700px){.orbi9-detail{display:block;margin-top:30px}.orbi9-detail-copy{padding:25px 0}}`;
  document.head.append(style);

  const stockLimit = product => product.trackInventory === false ? Infinity : (Number.isFinite(Number(product.quantity)) ? Math.max(0, Number(product.quantity)) : Infinity);
  const addToCart = (product, requestedQty = 1) => {
    const key = 'orbi9-cart';
    let cart = []; try { cart = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
    const item = cart.find(x => String(x.id) === String(product.id));
    const available = stockLimit(product) - (item?.qty || 0);
    const qty = Math.min(Math.max(1, Number(requestedQty) || 1), available);
    if (qty < 1) return false;
    if (item) item.qty += qty;
    else cart.push({id: product.id, name: product.name, price: Number(product.price || 0), img: productImage(product), qty});
    localStorage.setItem(key, JSON.stringify(cart)); window.dispatchEvent(new Event('orbi9-cart-updated')); return true;
  };
  const card = p => { const stock = stockLimit(p); return `<article class="card orbi9-product-card"><a href="?product=${encodeURIComponent(p.slug || slugify(p.name))}"><img src="${esc(productImage(p))}" alt="${esc(p.name)}"><div class="product-copy"><div class="eyebrow">${p.featured ? `★ Featured${p.category ? ` · ${esc(p.category)}` : ''}` : esc(p.category)}</div><h3>${esc(p.name)}</h3>${p.subtitle ? `<p class="product-summary">${esc(p.subtitle)}</p>` : ''}<div class="price">$${Number(p.price || 0).toFixed(2)}</div><span class="product-link">View product</span></div></a><button class="btn quick-add" type="button" data-add-cart="${esc(p.id)}" ${stock === 0 ? 'disabled' : ''}>${stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}</button></article>`; };
  const bindCartButtons = container => container.querySelectorAll('[data-add-cart]').forEach(button => button.onclick = event => { event.preventDefault(); const product = products.find(p => String(p.id) === String(button.dataset.addCart)); if (product && addToCart(product)) { button.textContent = 'ADDED ✓'; setTimeout(() => { button.textContent = 'ADD TO CART'; }, 1200); } });
  const renderDetail = product => {
    const main = document.querySelector('main') || document.body;
    [...main.children].forEach(node => node.style.display = 'none');
    const detail = document.createElement('section'); detail.className = 'orbi9-detail';
    const stock = stockLimit(product); const canAdd = stock !== 0; const quantityControl = Number.isFinite(stock) && stock > 1 ? `<label class="quantity-label">Quantity <input class="detail-quantity" type="number" min="1" max="${stock}" value="1"></label>` : '';
    detail.innerHTML = `<div><img src="${esc(productImage(product))}" alt="${esc(product.name)}"></div><div class="orbi9-detail-copy"><div class="detail-category">${esc(product.category)}</div><h1>${esc(product.name)}</h1><div class="detail-price">$${Number(product.price || 0).toFixed(2)}</div><p>${esc(product.description || 'A considered object from the Orbi9 catalogue.')}</p><p class="stock-status">${canAdd ? (Number.isFinite(stock) ? `${stock} in stock` : 'In stock') : 'Out of stock'}</p>${quantityControl}<button class="btn detail-add-cart" type="button" ${canAdd ? '' : 'disabled'}>${canAdd ? 'ADD TO CART' : 'OUT OF STOCK'}</button><a class="orbi9-back" href="/">Back to catalogue</a></div>`;
    const addButton = detail.querySelector('.detail-add-cart');
    addButton.onclick = () => { const quantity = detail.querySelector('.detail-quantity')?.value || 1; if (addToCart(product, quantity)) { addButton.textContent = 'ADDED ✓'; setTimeout(() => { addButton.textContent = 'ADD TO CART'; }, 1200); } };
    main.append(detail); document.title = `${product.name} — ORBI9`;
  };
  const products = getProducts();
  const requested = new URLSearchParams(location.search).get('product');
  const detailProduct = products.find(p => (p.slug || slugify(p.name)) === requested);
  if (detailProduct) return renderDetail(detailProduct);

  const shopGrid = document.querySelector('#shop .grid');
  if (shopGrid) {
    const searchBox = document.querySelector('#catalog-search');
    const searchInput = document.querySelector('#catalog-search-input');
    const renderSearchResults = () => { const query = (searchInput?.value || '').toLowerCase().trim(); const matches = products.filter(p => `${p.name} ${p.category} ${p.description || ''}`.toLowerCase().includes(query)); shopGrid.innerHTML = matches.map(card).join(''); bindCartButtons(shopGrid); };
    shopGrid.innerHTML = products.map(card).join(''); bindCartButtons(shopGrid);
    searchInput?.addEventListener('input', renderSearchResults);
    document.querySelector('#search-toggle')?.addEventListener('click', event => { event.preventDefault(); if (searchBox) searchBox.hidden = false; searchInput?.focus(); });
  }
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const categoryGrid = document.querySelector('#categories .grid');
  if (categoryGrid) categoryGrid.innerHTML = categories.map(category => `<article class="card"><div class="eyebrow">Collection</div><h3>${esc(category)}</h3><p>${products.filter(p => p.category === category).length} pieces in the catalogue.</p><a class="product-link" href="#shop">Explore ${esc(category)}</a></article>`).join('');
})();
