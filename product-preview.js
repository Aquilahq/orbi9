const fields = {
  name: document.querySelector("#name"),
  subtitle: document.querySelector("#subtitle"),
  description: document.querySelector("#description"),
  price: document.querySelector("#price"),
  status: document.querySelector("#status"),
  sku: document.querySelector("#sku"),
  category: document.querySelector("#category"),
  quantity: document.querySelector("#quantity"),
  images: document.querySelector("#images"),
};

const preview = {
  image: document.querySelector("#previewImage"),
  title: document.querySelector("#previewTitle"),
  subtitle: document.querySelector("#previewSubtitle"),
  description: document.querySelector("#previewDescription"),
  price: document.querySelector("#previewPrice"),
  status: document.querySelector("#previewStatus"),
  sku: document.querySelector("#previewSku"),
  category: document.querySelector("#previewCategory"),
  quantity: document.querySelector("#previewQuantity"),
};

function value(name, fallback = "") {
  return fields[name]?.value?.trim() || fallback;
}

function refreshPreview() {
  const image = value("images").split("\n").map((url) => url.trim()).find(Boolean);
  preview.title.textContent = value("name", "New product");
  preview.subtitle.textContent = value("subtitle", "Your product summary appears here.");
  preview.description.textContent = value("description", "Add a description to preview the storefront presentation.");
  preview.status.textContent = value("status", "Draft");
  preview.price.textContent = `$${(Number(value("price", "0")) || 0).toFixed(2)}`;
  preview.sku.textContent = `SKU ${value("sku", "—")}`;
  preview.category.textContent = value("category", "Uncategorized");
  preview.quantity.textContent = `${Number(value("quantity", "0")) || 0} in stock`;
  if (image) {
    preview.image.src = image;
    preview.image.alt = `${value("name", "Product")} preview`;
  } else {
    preview.image.removeAttribute("src");
    preview.image.alt = "Product preview";
  }
}

Object.values(fields).forEach((field) => field?.addEventListener("input", refreshPreview));
Object.values(fields).forEach((field) => field?.addEventListener("change", refreshPreview));
refreshPreview();
// Product selection is populated programmatically by the editor, so keep the
// preview synchronized when fields change without emitting DOM events.
const previewSync = window.setInterval(refreshPreview, 500);
window.addEventListener("pagehide", () => window.clearInterval(previewSync), { once: true });
