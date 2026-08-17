(() => {
  const STORAGE_KEY = 'orbi9-catalog-v1';
  const seed = [
    { id: 'orb-001', name: 'Chrome Starburst Camera', slug: 'chrome-starburst-camera', category: 'Cameras', price: 185, image_url: '/orbi9newlogo.png', description: 'A collectible mid-century camera with sculptural chrome detailing and a beautifully tactile mechanical feel.' },
    { id: 'orb-002', name: 'Apollo Desk Radio', slug: 'apollo-desk-radio', category: 'Radios', price: 240, image_url: '/orbilogo.png', description: 'A space-age tabletop radio selected for its warm analogue character and iconic silhouette.' },
    { id: 'orb-003', name: 'Retro Computer Terminal', slug: 'retro-computer-terminal', category: 'Computing', price: 395, image_url: '/orbi9newlogo.png', description: 'A distinctive vintage computing object for collectors, studios and curious desks.' }
  ];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const slugify = value => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const getProducts = () => { try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(data) ? data : seed; } catch { return seed; } };
  const saveProducts = products => localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  if (!localStorage.getItem(STORAGE_KEY)) saveProducts(seed);
  window.Orbi9Catalog = { getProducts, saveProducts, slugify };

  const style = document.createElement('style');
  style.textContent = `.orbi9-product-card{display:flex;flex-direction:column;overflow:hidden}.orbi9-product-card img{width:100%;aspect-ratio:1.15;object-fit:contain;background:#111}.orbi9-product-card .product-copy{padding:18px}.orbi9-product-card a{color:inherit;text-decoration:none}.orbi9-product-card .product-link{margin-top:14px;text-decoration:underline}.orbi9-detail{max-width:1100px;margin:60px auto;padding:0 24px;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px, .8fr);gap:48px}.orbi9-detail img{width:100%;max-height:620px;object-fit:contain;background:#111}.orbi9-detail-copy{align-self:center}.orbi9-detail-copy h1{font-size:clamp(32px,5vw,70px);margin:10px 0}.orbi9-detail-copy .detail-price{font-size:26px;margin:24px 0}.orbi9-detail-copy .detail-category{letter-spacing:.16em;text-transform:uppercase}.orbi9-back{display:inline-block;margin-top:30px;text-decoration:underline}@media(max-width:700px){.orbi9-detail{display:block;margin-top:30px}.orbi9-detail-copy{padding:25px 0}}`;
  document.head.append(style);

  const card = p => `<article class="card orbi9-product-card"><a href="?product=${encodeURIComponent(p.slug || slugify(p.name))}"><img src="${esc(p.image_url || '/orbi9newlogo.png')}" alt="${esc(p.name)}"><div class="product-copy"><div class="eyebrow">${esc(p.category)}</div><h3>${esc(p.name)}</h3><div class="price">$${Number(p.price || 0).toFixed(2)}</div><span class="product-link">View product</span></div></a></article>`;
  const renderDetail = product => {
    const main = document.querySelector('main') || document.body;
    [...main.children].forEach(node => node.style.display = 'none');
    const detail = document.createElement('section'); detail.className = 'orbi9-detail';
    detail.innerHTML = `<div><img src="${esc(product.image_url || '/orbi9newlogo.png')}" alt="${esc(product.name)}"></div><div class="orbi9-detail-copy"><div class="detail-category">${esc(product.category)}</div><h1>${esc(product.name)}</h1><div class="detail-price">$${Number(product.price || 0).toFixed(2)}</div><p>${esc(product.description || 'A considered object from the Orbi9 catalogue.')}</p><a class="orbi9-back" href="/">Back to catalogue</a></div>`;
    main.append(detail); document.title = `${product.name} — ORBI9`;
  };
  const products = getProducts();
  const requested = new URLSearchParams(location.search).get('product');
  const detailProduct = products.find(p => (p.slug || slugify(p.name)) === requested);
  if (detailProduct) return renderDetail(detailProduct);

  const shopGrid = document.querySelector('#shop .grid');
  if (shopGrid) shopGrid.innerHTML = products.map(card).join('');
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const categoryGrid = document.querySelector('#categories .grid');
  if (categoryGrid) categoryGrid.innerHTML = categories.map(category => `<article class="card"><div class="eyebrow">Collection</div><h3>${esc(category)}</h3><p>${products.filter(p => p.category === category).length} pieces in the catalogue.</p><a class="product-link" href="#shop">Explore ${esc(category)}</a></article>`).join('');
})();
