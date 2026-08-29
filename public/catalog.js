(() => {
  const STORAGE_KEY = 'orbi9-catalog-v2';
  const blockedDemoNames = new Set(['Retro Computer Terminal','Chrome Starburst Camera','Apollo Desk Radio','WESTERN ELECTRIC 91-A','MASUDAYA SPACE ROBOT','TEKTRONIX 515','ZENITH 6-S-126','VICTOR VV-XIV']);
  const isDisplayable = product => !blockedDemoNames.has(String(product?.name || ''));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const slugify = value => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const galleryStyle = document.createElement('style');
  galleryStyle.textContent = `.orbi9-detail-media{min-width:0}.orbi9-detail-hero{position:relative;background:#f3f1ec;border-radius:4px;display:flex;align-items:center;justify-content:center;min-height:420px}.detail-gallery-main{width:100%;height:420px;object-fit:contain}.gallery-arrow{position:absolute;z-index:1;width:42px;height:42px;border-radius:50%;background:#172033dd;color:#fff;font-size:30px;line-height:1}.gallery-prev{left:14px}.gallery-next{right:14px}.detail-gallery-thumbs{display:flex;gap:10px;overflow-x:auto;padding:12px 0 4px}.gallery-thumb{flex:0 0 76px;height:76px;padding:3px;border:1px solid #d8d5ce;background:#fff;border-radius:3px}.gallery-thumb.active{border:2px solid #a37b3d}.gallery-thumb img{width:100%;height:100%;object-fit:cover}.gallery-count{font-size:12px;color:#777;text-align:center;margin-top:6px}@media(max-width:700px){.orbi9-detail-hero,.detail-gallery-main{min-height:280px;height:280px}}`;
  document.head.append(galleryStyle);
  // Admin products store uploaded/URL images in `images` and mark the selected
  // image with `primaryImage`; older imports may still use `image_url`.
  const imageFallback = () => '/orbi9newlogo.png';
  const usableImage = value => {
    const src = typeof value === 'string' ? value : value?.src || value?.url;
    return src && !/orbi9newlogo/i.test(src) ? src : '';
  };
  const productImage = product => {
    const images = Array.isArray(product?.images) ? product.images : [];
    const index = Number.isInteger(Number(product?.primaryImage)) ? Number(product.primaryImage) : 0;
    return usableImage(images[index]) || usableImage(images[0]) || usableImage(product?.image_url) || usableImage(product?.image) || imageFallback(product);
  };
  const getProducts = () => { try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(data) ? data.filter(isDisplayable) : []; } catch { return []; } };
  const saveProducts = products => localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.Orbi9Catalog = { getProducts, saveProducts, slugify };

  const style = document.createElement('style');
  style.textContent = `.orbi9-product-card{display:flex;flex-direction:column;overflow:hidden;max-width:300px;position:relative}.orbi9-product-card.sold{cursor:not-allowed}.sold-banner{position:absolute;top:18px;left:-34px;z-index:2;width:170px;padding:8px 0;transform:rotate(-45deg);text-align:center;background:#d94a56;color:#fff;font:800 14px Oswald;letter-spacing:3px;box-shadow:0 3px 10px #0008}.orbi9-product-card img{width:100%;aspect-ratio:1;object-fit:contain;background:#111}.orbi9-product-card .product-copy{padding:18px}.orbi9-product-card a{color:inherit;text-decoration:none}.orbi9-product-card .product-link{margin-top:14px;text-decoration:underline}.catalog-search{position:relative}.search-preview{position:absolute;z-index:2147483646;top:calc(100% + 6px);left:0;right:0;background:#0b1622;border:1px solid #18cfff;box-shadow:0 12px 30px #000b}.search-preview a{display:flex;align-items:center;gap:12px;padding:10px 14px;color:#e9fbff;text-decoration:none}.search-preview a:hover,.search-preview a:focus{background:#123149}.search-preview img{width:42px;height:42px;object-fit:cover;background:#071326}.orbi9-detail{max-width:1100px;margin:60px auto;padding:0 24px;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px, .8fr);gap:48px}.orbi9-detail img{width:100%;max-height:620px;object-fit:contain;background:#111}.orbi9-detail-copy{align-self:center}.orbi9-detail-copy h1{font-size:clamp(32px,5vw,70px);margin:10px 0}.orbi9-detail-copy .detail-price{font-size:26px;margin:24px 0}.orbi9-detail-copy .detail-category{letter-spacing:.16em;text-transform:uppercase}.orbi9-back{display:inline-block;margin-top:30px;text-decoration:underline}.quick-add{margin:0 18px 18px;cursor:pointer}.quantity-label{display:flex;align-items:center;gap:12px;margin:18px 0}.detail-quantity{width:72px;padding:8px;background:#102538;color:#e9fbff;border:1px solid #56d9ff}.stock-status{color:#8db7c9}@media(max-width:700px){.orbi9-detail{display:block;margin-top:30px}.orbi9-detail-copy{padding:25px 0}}`;
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
  const card = p => { const stock = stockLimit(p); const quantity = stock === Infinity ? '' : `<label class="quantity-label">Qty <input class="card-quantity" type="number" min="1" max="${stock}" value="1" ${stock === 0 ? 'disabled' : ''}></label>`; return `<article class="card orbi9-product-card${stock === 0 ? ' sold' : ''}" title="${stock === 0 ? 'Sold — this item is no longer available' : ''}">${stock === 0 ? '<span class="sold-banner" aria-label="Sold">SOLD</span>' : ''}<a href="?product=${encodeURIComponent(p.slug || slugify(p.name))}"><img src="${esc(productImage(p))}" alt="${esc(p.name)}"><div class="product-copy"><div class="eyebrow">${p.featured ? `★ Featured${p.category ? ` · ${esc(p.category)}` : ''}` : esc(p.category)}</div><h3>${esc(p.name)}</h3>${p.subtitle ? `<p class="product-summary">${esc(p.subtitle)}</p>` : ''}<div class="price">$${Number(p.price || 0).toFixed(2)}</div><span class="product-link">View product</span></div></a>${quantity}<button class="btn quick-add" type="button" data-add-cart="${esc(p.id)}" ${stock === 0 ? 'disabled' : ''}>${stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}</button></article>`; };
  const bindCartButtons = container => container.querySelectorAll('[data-add-cart]').forEach(button => button.onclick = event => { event.preventDefault(); const product = products.find(p => String(p.id) === String(button.dataset.addCart)); const input = button.closest('.orbi9-product-card')?.querySelector('.card-quantity'); const requestedQty = input ? Math.max(1, Number(input.value) || 1) : 1; if (product && addToCart(product, requestedQty)) { button.textContent = 'ADDED ✓'; setTimeout(() => { button.textContent = 'ADD TO CART'; }, 1200); } });
  const renderDetail = product => {
    const main = document.querySelector('main') || document.body;
    [...main.children].forEach(node => node.style.display = 'none');
    const detail = document.createElement('section'); detail.className = 'orbi9-detail';
    const stock = stockLimit(product); const canAdd = stock !== 0; const quantityControl = Number.isFinite(stock) && stock > 1 ? `<label class="quantity-label">Quantity <input class="detail-quantity" type="number" min="1" max="${stock}" value="1"></label>` : '';
    const gallery = (Array.isArray(product.images) ? product.images : []).map(usableImage).filter(Boolean);
    if (!gallery.length) gallery.push(productImage(product));
    let galleryIndex = Math.min(Number(product.primaryImage) || 0, gallery.length - 1);
    detail.innerHTML = `<div class="orbi9-detail-media"><div class="orbi9-detail-hero"><button class="gallery-arrow gallery-prev" type="button" aria-label="Previous image">‹</button><img class="detail-gallery-main" src="${esc(gallery[galleryIndex])}" alt="${esc(product.name)}"><button class="gallery-arrow gallery-next" type="button" aria-label="Next image">›</button></div><div class="detail-gallery-thumbs" role="list">${gallery.map((src,i)=>`<button class="gallery-thumb ${i===galleryIndex?'active':''}" type="button" data-gallery-index="${i}" aria-label="View image ${i+1}"><img src="${esc(src)}" alt=""></button>`).join('')}</div><div class="gallery-count">Image <span class="gallery-current">${galleryIndex+1}</span> of ${gallery.length}</div></div><div class="orbi9-detail-copy"><div class="detail-category">${esc(product.category)}</div><h1>${esc(product.name)}</h1><div class="detail-price">$${Number(product.price || 0).toFixed(2)}</div><p>${esc(product.description || 'A considered object from the Orbi9 catalogue.')}</p><p class="stock-status">${canAdd ? (Number.isFinite(stock) ? `${stock} in stock` : 'In stock') : 'Out of stock'}</p>${quantityControl}<button class="btn detail-add-cart" type="button" ${canAdd ? '' : 'disabled'}>${canAdd ? 'ADD TO CART' : 'OUT OF STOCK'}</button><a class="orbi9-back" href="/">Back to catalogue</a></div>`;
    const setGalleryImage = index => { galleryIndex = (index + gallery.length) % gallery.length; detail.querySelector('.detail-gallery-main').src = gallery[galleryIndex]; detail.querySelector('.gallery-current').textContent = galleryIndex + 1; detail.querySelectorAll('.gallery-thumb').forEach((thumb,i) => thumb.classList.toggle('active', i === galleryIndex)); };
    detail.querySelector('.gallery-prev').onclick = () => setGalleryImage(galleryIndex - 1);
    detail.querySelector('.gallery-next').onclick = () => setGalleryImage(galleryIndex + 1);
    detail.querySelectorAll('.gallery-thumb').forEach(thumb => thumb.onclick = () => setGalleryImage(Number(thumb.dataset.galleryIndex)));
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
    const preview = document.createElement('div'); preview.className = 'search-preview'; preview.hidden = true; searchBox?.append(preview); const renderSearchResults = () => { const query = (searchInput?.value || '').toLowerCase().trim(); const matches = products.filter(p => `${p.name} ${p.category} ${p.subtitle || ''} ${p.description || ''} ${p.sku || ''}`.toLowerCase().includes(query)); shopGrid.innerHTML = matches.length ? matches.map(card).join('') : '<p class="meta">No products match that search.</p>'; preview.innerHTML = query ? matches.slice(0,5).map(p => `<a href="?product=${encodeURIComponent(p.slug || slugify(p.name))}">${p.images?.[0] ? `<img src="${esc(p.images[0])}" alt="">` : ''}<span>${esc(p.name)}<small>${esc(p.category || '')}</small></span></a>`).join('') : ''; preview.hidden = !query || !matches.length; bindCartButtons(shopGrid); };
    shopGrid.innerHTML = products.map(card).join(''); bindCartButtons(shopGrid);
    searchInput?.addEventListener('input', renderSearchResults);
    document.querySelector('#search-toggle')?.addEventListener('click', event => { event.preventDefault(); if (searchBox) searchBox.hidden = false; searchInput?.focus(); });
  }
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const categoryGrid = document.querySelector('#categories .grid');
  if (categoryGrid) categoryGrid.innerHTML = categories.map(category => `<article class="card"><div class="eyebrow">Collection</div><h3>${esc(category)}</h3><p>${products.filter(p => p.category === category).length} pieces in the catalogue.</p><a class="product-link" href="#shop">Explore ${esc(category)}</a></article>`).join('');
})();
