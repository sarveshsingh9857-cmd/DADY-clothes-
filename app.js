const SUPABASE_URL =  https://kykdfhmumkttibcdcigg.supabase.co
const SUPABASE_PUBLISHABLE_KEY = sb_publishable_aQGIGobtka8ZK_SZWx6z9A_C6XTHegW

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);const defaultProducts = [
  {id:1,name:"Oversized Black T-Shirt",category:"T-Shirts",price:599,oldPrice:899,image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",description:"Premium cotton oversized T-shirt with a comfortable streetwear fit."},
  {id:2,name:"Premium White T-Shirt",category:"T-Shirts",price:549,oldPrice:799,image:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600",description:"Clean premium white T-shirt made for everyday style."},
  {id:3,name:"Black Streetwear Hoodie",category:"Hoodies",price:999,oldPrice:1499,image:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",description:"Warm and stylish streetwear hoodie."},
  {id:4,name:"Classic Blue Jeans",category:"Jeans",price:1199,oldPrice:1699,image:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",description:"Classic blue jeans for everyday wear."},
  {id:5,name:"Oversized Grey T-Shirt",category:"T-Shirts",price:649,oldPrice:899,image:"https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600",description:"Soft grey oversized T-shirt."},
  {id:6,name:"Premium Black Cargo",category:"Pants",price:1099,oldPrice:1599,image:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",description:"Premium black cargo pants."}
];

let products = JSON.parse(localStorage.getItem("dady_products") || "null");

if (!products || products.length === 0) {
  products = defaultProducts;
  localStorage.setItem("dady_products", JSON.stringify(products));
}

let cart = JSON.parse(localStorage.getItem("dady_cart") || "[]");

function loadProducts(list = products) {
  const grid = document.getElementById("grid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = "<p>No products found.</p>";
    return;
  }

  grid.innerHTML = list.map(product => `
    <article class="product">
      <img src="${product.image}" alt="${product.name}" onclick="openProduct(${product.id})" style="cursor:pointer">
      <div class="product-info">
        <small>${product.category}</small>
        <h3 onclick="openProduct(${product.id})" style="cursor:pointer">${product.name}</h3>
        <p><b>₹${product.price}</b> <del>₹${product.oldPrice}</del></p>
        <button class="btn" onclick="openProduct(${product.id})">VIEW PRODUCT</button>
      </div>
    </article>
  `).join("");
}

function createCategories() {
  const cat = document.getElementById("cat");
  if (!cat) return;

  const categories = ["All", ...new Set(products.map(p => p.category))];

  cat.innerHTML = categories.map(category => `
    <button onclick="filterCategory('${category}')">${category}</button>
  `).join("");
}

function filterCategory(category) {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) searchInput.value = "";

  if (category === "All") {
    loadProducts(products);
  } else {
    loadProducts(products.filter(p => p.category === category));
  }

  document.getElementById("shop").scrollIntoView({behavior:"smooth"});
}

function searchProducts() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const query = input.value.toLowerCase().trim();

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );

  loadProducts(filtered);
}

function openProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById("detailImage").src = product.image;
  document.getElementById("detailName").textContent = product.name;
  document.getElementById("detailCategory").textContent = product.category;
  document.getElementById("detailPrice").textContent = "₹" + product.price;
  document.getElementById("detailOldPrice").textContent = "₹" + product.oldPrice;
  document.getElementById("detailDescription").textContent = product.description;

  const button = document.getElementById("detailAddButton");

  button.onclick = function() {
    const size = document.getElementById("detailSize").value;
    addToCart(id, size);
    closeProduct();
  };

  document.getElementById("productModal").classList.add("show");
}

function closeProduct() {
  const modal = document.getElementById("productModal");
  if (modal) modal.classList.remove("show");
}

function addToCart(id, size = "M") {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id && item.size === size);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({...product, size:size, qty:1});
  }

  saveCart();
  openCart();
}

function saveCart() {
  localStorage.setItem("dady_cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const count = document.getElementById("count");
  if (!count) return;

  count.textContent = cart.reduce(
    (total, item) => total + item.qty,
    0
  );
}

function renderCart() {
  const items = document.getElementById("items");
  const total = document.getElementById("total");

  if (!items || !total) return;

  if (cart.length === 0) {
    items.innerHTML = "<p>Your cart is empty 🛒</p>";
    total.textContent = "0";
    return;
  }

  items.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <b>${item.name}</b>
        <p>₹${item.price} × ${item.qty}</p>
        <small>Size: ${item.size || "M"}</small><br><br>

        <button onclick="changeQty(${item.id}, '${item.size}', -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${item.id}, '${item.size}', 1)">+</button>

        <button onclick="removeFromCart(${item.id}, '${item.size}')">
          Remove
        </button>
      </div>
    </div>
  `).join("");

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  total.textContent = cartTotal;
}

function changeQty(id, size, amount) {
  const item = cart.find(
    item => item.id === id && item.size === size
  );

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(
      item => !(item.id === id && item.size === size)
    );
  }

  saveCart();
}

function removeFromCart(id, size) {
  cart = cart.filter(
    item => !(item.id === id && item.size === size)
  );

  saveCart();
}

function openCart() {
  const drawer = document.getElementById("drawer");

  if (drawer) drawer.classList.add("open");

  renderCart();
}

function closeCart() {
  const drawer = document.getElementById("drawer");

  if (drawer) drawer.classList.remove("open");
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const modal = document.getElementById("checkout");

  if (modal) modal.classList.add("show");
}

function hideCheckout() {
  const modal = document.getElementById("checkout");

  if (modal) modal.classList.remove("show");
}

function placeOrder() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const pin = document.getElementById("pin").value.trim();
  const msg = document.getElementById("msg");

  if (!name || !phone || !address || !pin) {
    msg.textContent = "Please fill all details.";
    return;
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    msg.textContent = "Enter a valid 10-digit mobile number.";
    return;
  }

  if (!/^[0-9]{6}$/.test(pin)) {
    msg.textContent = "Enter a valid 6-digit pincode.";
    return;
  }

  const orderId = "DC" + Date.now().toString().slice(-6);

  msg.innerHTML =
    "<strong>Order placed successfully! 🎉</strong><br>" +
    "Order ID: " + orderId +
    "<br>Payment: Cash on Delivery";

  cart = [];
  saveCart();

  setTimeout(() => {
    hideCheckout();
    closeCart();
  }, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  createCategories();
  loadProducts();
  updateCartCount();
  renderCart();
});
