const SUPABASE_URL = "https://kykdfhmumkttibcdcigg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_aQGIGobtka8ZK_SZWx6z9A_C6XTHegW";

const db = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_PUBLISHABLE_KEY
);

/* =========================
DEFAULT PRODUCTS
========================= */

const defaultProducts = [
{
id: 1,
name: "Oversized Black T-Shirt",
category: "T-Shirts",
price: 599,
oldPrice: 899,
image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
description: "Premium cotton oversized T-shirt with a comfortable streetwear fit."
},
{
id: 2,
name: "Premium White T-Shirt",
category: "T-Shirts",
price: 549,
oldPrice: 799,
image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800",
description: "Clean premium white T-shirt made for everyday style."
},
{
id: 3,
name: "Black Streetwear Hoodie",
category: "Hoodies",
price: 999,
oldPrice: 1499,
image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
description: "Warm and stylish streetwear hoodie."
},
{
id: 4,
name: "Classic Blue Jeans",
category: "Jeans",
price: 1199,
oldPrice: 1699,
image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
description: "Classic blue jeans for everyday wear."
},
{
id: 5,
name: "Oversized Grey T-Shirt",
category: "T-Shirts",
price: 649,
oldPrice: 899,
image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800",
description: "Soft grey oversized T-shirt."
},
{
id: 6,
name: "Premium Black Cargo",
category: "Pants",
price: 1099,
oldPrice: 1599,
image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
description: "Premium black cargo pants."
}
];

let products = [];
let cart = JSON.parse(localStorage.getItem("dady_cart") || "[]");

/* =========================
HELPERS
========================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function discountPercent(price, oldPrice) {
if (!oldPrice || oldPrice <= price) return 0;

return Math.round(
((oldPrice - price) / oldPrice) * 100
);
}

/* =========================
LOAD PRODUCTS
========================= */

async function loadProducts() {

const grid = document.getElementById("grid");

if (!grid) return;

grid.innerHTML = "<p style="grid-column:1/-1;text-align:center;padding:30px"> Loading collection... </p>";

try {

const { data, error } = await db
  .from("products")
  .select("*")
  .order("id", { ascending: true });

if (error) {
  console.error("Supabase error:", error);

  products = defaultProducts;

  createCategories();
  renderProducts(products);

  return;
}

products = (data || []).map(product => ({
  id: Number(product.id),
  name: product.name || "Unnamed Product",
  category: product.category || "Other",
  price: Number(product.price) || 0,
  oldPrice:
    Number(product.old_price) ||
    Number(product.price) ||
    0,
  image:
    product.image ||
    "https://via.placeholder.com/800x1000?text=DADY+CLOTHES",
  description:
    product.description ||
    "Premium quality product from DADY CLOTHES."
}));

if (products.length === 0) {
  products = defaultProducts;
}

createCategories();
renderProducts(products);

} catch (error) {

console.error(error);

products = defaultProducts;

createCategories();
renderProducts(products);

}
}

/* =========================
PRODUCT CARDS
========================= */

function renderProducts(list) {

const grid = document.getElementById("grid");

if (!grid) return;

if (!list || list.length === 0) {

grid.innerHTML = `
  <div style="
    grid-column:1/-1;
    text-align:center;
    padding:60px 20px;
  ">
    <h3>No products found</h3>
    <p style="color:#777;margin-top:8px">
      Try another search or category.
    </p>
  </div>
`;

return;

}

grid.innerHTML = list.map(product => {

const discount = discountPercent(
  product.price,
  product.oldPrice
);

return `
  <article class="product">

    <div style="
      position:relative;
      overflow:hidden;
    ">

      ${
        discount > 0
          ? `
            <span style="
              position:absolute;
              top:12px;
              left:12px;
              z-index:2;
              background:#ff1493;
              color:white;
              padding:6px 9px;
              border-radius:5px;
              font-size:10px;
              font-weight:800;
            ">
              ${discount}% OFF
            </span>
          `
          : ""
      }

      <img
        src="${escapeHTML(product.image)}"
        alt="${escapeHTML(product.name)}"
        loading="lazy"
        onclick="openProduct(${product.id})"
        onerror="this.src='https://via.placeholder.com/800x1000?text=DADY+CLOTHES'"
        style="cursor:pointer"
      >

    </div>

    <div class="product-info">

      <small>
        ${escapeHTML(product.category)}
      </small>

      <h3
        onclick="openProduct(${product.id})"
        style="cursor:pointer"
      >
        ${escapeHTML(product.name)}
      </h3>

      <p>
        <b>₹${product.price}</b>

        ${
          product.oldPrice > product.price
            ? `<del>₹${product.oldPrice}</del>`
            : ""
        }
      </p>

      <button
        class="btn"
        onclick="openProduct(${product.id})"
      >
        VIEW PRODUCT →
      </button>

    </div>

  </article>
`;

}).join("");
}

/* =========================
CATEGORIES
========================= */
function createCategories() {
  const cat = document.getElementById("cat");

  if (!cat) return;

  const categories = [
    "All",
    ...new Set(
      products
        .map(product => product.category)
        .filter(Boolean)
    )
  ];

  cat.innerHTML = categories
    .map(category => `
      <button onclick="filterCategory('${escapeHTML(category)}')">
        ${escapeHTML(category)}
      </button>
    `)
    .join("");
}



cat.innerHTML = categories.map(category => "<button onclick="filterCategory('${escapeHTML(category)}')" > ${escapeHTML(category)} </button>").join("");
}

/* =========================
CATEGORY FILTER
========================= */

function filterCategory(category) {

const searchInput =
document.getElementById("searchInput");

if (searchInput) {
searchInput.value = "";
}

if (category === "All") {

renderProducts(products);

} else {

const filtered = products.filter(
  product => product.category === category
);

renderProducts(filtered);

}

const shop = document.getElementById("shop");

if (shop) {
shop.scrollIntoView({
behavior: "smooth"
});
}
}

/* =========================
SEARCH
========================= */

function searchProducts() {

const input =
document.getElementById("searchInput");

if (!input) return;

const query =
input.value.toLowerCase().trim();

if (!query) {

renderProducts(products);

return;

}

const filtered = products.filter(product =>

product.name
  .toLowerCase()
  .includes(query) ||

product.category
  .toLowerCase()
  .includes(query) ||

product.description
  .toLowerCase()
  .includes(query)

);

renderProducts(filtered);
}

/* =========================
PRODUCT DETAILS
========================= */

function openProduct(id) {

const product = products.find(
product =>
Number(product.id) === Number(id)
);

if (!product) return;

const image =
document.getElementById("detailImage");

const name =
document.getElementById("detailName");

const category =
document.getElementById("detailCategory");

const price =
document.getElementById("detailPrice");

const oldPrice =
document.getElementById("detailOldPrice");

const description =
document.getElementById("detailDescription");

const button =
document.getElementById("detailAddButton");

const modal =
document.getElementById("productModal");

if (!modal) return;

image.src = product.image;
image.alt = product.name;

name.textContent = product.name;

category.textContent =
product.category;

price.textContent =
"₹" + product.price;

oldPrice.textContent =
product.oldPrice > product.price
? "₹" + product.oldPrice
: "";

description.textContent =
product.description;

button.onclick = function () {

const size =
  document.getElementById("detailSize").value;

addToCart(product.id, size);

closeProduct();

};

modal.classList.add("show");
}

/* =========================
CLOSE PRODUCT
========================= */

function closeProduct() {

const modal =
document.getElementById("productModal");

if (modal) {
modal.classList.remove("show");
}
}

/* =========================
CART
========================= */

function addToCart(id, size = "M") {

const product = products.find(
product =>
Number(product.id) === Number(id)
);

if (!product) return;

const existing = cart.find(
item =>
Number(item.id) === Number(id) &&
item.size === size
);

if (existing) {

existing.qty++;

} else {

cart.push({
  ...product,
  size: size,
  qty: 1
});

}

saveCart();

openCart();
}

/* =========================
SAVE CART
========================= */

function saveCart() {

localStorage.setItem(
"dady_cart",
JSON.stringify(cart)
);

updateCartCount();

renderCart();
}

/* =========================
CART COUNT
========================= */

function updateCartCount() {

const count =
document.getElementById("count");

if (!count) return;

const totalItems = cart.reduce(
(total, item) =>
total + Number(item.qty || 0),
0
);

count.textContent =
totalItems;
}

/* =========================
RENDER CART
========================= */

function renderCart() {

const items =
document.getElementById("items");

const total =
document.getElementById("total");

if (!items || !total) return;

if (cart.length === 0) {

items.innerHTML = `
  <div style="
    text-align:center;
    padding:55px 15px;
    color:#777;
  ">
    <div style="
      font-size:42px;
      margin-bottom:12px;
    ">
      🛍️
    </div>

    <h3 style="color:#111">
      Your cart is empty
    </h3>

    <p style="margin-top:7px">
      Add something from our collection.
    </p>
  </div>
`;

total.textContent = "0";

return;

}

items.innerHTML = cart.map(item => `

<div class="cart-item">

  <img
    src="${escapeHTML(item.image)}"
    alt="${escapeHTML(item.name)}"
    onerror="this.src='https://via.placeholder.com/200x250?text=DADY'"
  >

  <div style="flex:1">

    <b>
      ${escapeHTML(item.name)}
    </b>

    <p>
      ₹${item.price}
    </p>

    <small>
      Size: ${escapeHTML(item.size || "M")}
    </small>

    <div style="
      margin-top:10px;
      display:flex;
      align-items:center;
      gap:7px;
      flex-wrap:wrap;
    ">

      <button
        onclick="changeQty(${item.id}, '${item.size}', -1)"
      >
        −
      </button>

      <strong>
        ${item.qty}
      </strong>

      <button
        onclick="changeQty(${item.id}, '${item.size}', 1)"
      >
        +
      </button>

      <button
        onclick="removeFromCart(${item.id}, '${item.size}')"
      >
        Remove
      </button>

    </div>

  </div>

</div>

`).join("");

const cartTotal =
cart.reduce(
(sum, item) =>
sum +
Number(item.price) *
Number(item.qty),
0
);

total.textContent =
cartTotal;
}

/* =========================
QUANTITY
========================= */

function changeQty(id, size, amount) {

const item = cart.find(
item =>
Number(item.id) === Number(id) &&
item.size === size
);

if (!item) return;

item.qty += amount;

if (item.qty <= 0) {

cart = cart.filter(
  item =>
    !(
      Number(item.id) === Number(id) &&
      item.size === size
    )
);

}

saveCart();
}

/* =========================
REMOVE ITEM
========================= */

function removeFromCart(id, size) {

cart = cart.filter(
item =>
!(
Number(item.id) === Number(id) &&
item.size === size
)
);

saveCart();
}

/* =========================
OPEN CART
========================= */

function openCart() {

const drawer =
document.getElementById("drawer");

if (!drawer) return;

drawer.classList.add("open");

renderCart();
}

/* =========================
CLOSE CART
========================= */

function closeCart() {

const drawer =
document.getElementById("drawer");

if (drawer) {
drawer.classList.remove("open");
}
}

/* =========================
CHECKOUT
========================= */

function checkout() {

if (cart.length === 0) {

alert("Your cart is empty!");

return;

}

const modal =
document.getElementById("checkout");

const msg =
document.getElementById("msg");

if (msg) {
msg.textContent = "";
}

if (modal) {
modal.classList.add("show");
}
}

/* =========================
HIDE CHECKOUT
========================= */

function hideCheckout() {

const modal =
document.getElementById("checkout");

if (modal) {
modal.classList.remove("show");
}
}

/* =========================
PLACE ORDER
========================= */

async function placeOrder() {

const name =
document.getElementById("name").value.trim();

const phone =
document.getElementById("phone").value.trim();

const address =
document.getElementById("address").value.trim();

const pin =
document.getElementById("pin").value.trim();

const msg =
document.getElementById("msg");

if (!msg) return;

msg.textContent = "";

if (!name || !phone || !address || !pin) {

msg.textContent =
  "Please fill all details.";

return;

}

if (!/^[0-9]{10}$/.test(phone)) {

msg.textContent =
  "Enter a valid 10-digit mobile number.";

return;

}

if (!/^[0-9]{6}$/.test(pin)) {

msg.textContent =
  "Enter a valid 6-digit pincode.";

return;

}

const total =
cart.reduce(
(sum, item) =>
sum +
Number(item.price) *
Number(item.qty),
0
);

const orderId =
"DC" +
Date.now()
.toString()
.slice(-8);

msg.textContent =
"Placing your order...";

try {

const { error } =
  await db
    .from("orders")
    .insert({
      order_id: orderId,
      name: name,
      phone: phone,
      address: address,
      pin: pin,
      total: total,
      status: "Pending"
    });

if (error) {

  console.error(error);

  msg.textContent =
    "Order save nahi hua. Please try again.";

  return;
}

msg.innerHTML = `
  <strong>
    Order placed successfully! 🎉
  </strong>
  <br><br>
  Order ID: ${escapeHTML(orderId)}
  <br>
  Payment: Cash on Delivery
`;

cart = [];

saveCart();

setTimeout(() => {

  hideCheckout();
  closeCart();

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("address").value = "";
  document.getElementById("pin").value = "";

}, 3000);

} catch (error) {

console.error(error);

msg.textContent =
  "Something went wrong. Please try again.";

}
}

/* =========================
MODAL CLICK OUTSIDE
========================= */

document.addEventListener(
"click",
function(event) {

const productModal =
  document.getElementById("productModal");

const checkoutModal =
  document.getElementById("checkout");

if (
  productModal &&
  event.target === productModal
) {
  closeProduct();
}

if (
  checkoutModal &&
  event.target === checkoutModal
) {
  hideCheckout();
}

}
);

/* =========================
ESC KEY
========================= */

document.addEventListener(
"keydown",
function(event) {

if (event.key !== "Escape") return;

closeProduct();
hideCheckout();
closeCart();

}
);

/* =========================
START WEBSITE
========================= */

document.addEventListener(
"DOMContentLoaded",
function() {

loadProducts();

updateCartCount();

renderCart();

}
);
