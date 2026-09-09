const SUPABASE_URL = "https://kykdfhmumkttibcdcigg.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_aQGIGobtka8ZK_SZWx6z9A_C6XTHegW";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

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

function normalizeProduct(product) {
  return {
    id: Number(product.id),
    name: product.name || "Unnamed Product",
    category: product.category || "Other",
    price: Number(product.price) || 0,
    oldPrice:
      Number(product.old_price) ||
      Number(product.oldPrice) ||
      Number(product.price) ||
      0,
    image:
      product.image ||
      "https://via.placeholder.com/800x1000?text=DADY+CLOTHES",
    description:
      product.description ||
      "Premium quality product from DADY CLOTHES."
  };
}

function discountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}


/* =========================
LOAD SUPABASE PRODUCTS
========================= */

async function loadProducts() {

  const grid = document.getElementById("grid");

  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:50px">
      Loading collection...
    </div>
  `;

  try {

    const { data, error } = await db
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);

      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:50px">
          <h3>Products load nahi ho rahe</h3>
          <p style="color:#777">Please refresh the page.</p>
        </div>
      `;

      return;
    }

    products = (data || []).map(normalizeProduct);

    createCategories();
    renderProducts(products);

  } catch (error) {

    console.error("Loading error:", error);

    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:50px">
        <h3>Something went wrong</h3>
      </div>
    `;
  }
}


/* =========================
PRODUCT CARDS
========================= */

function renderProducts(list) {

  const grid = document.getElementById("grid");

  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:50px">
        <h3>No products found</h3>
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

        <div style="position:relative;overflow:hidden">

          ${
            discount > 0
              ? `
                <span style="
                  position:absolute;
                  top:12px;
                  left:12px;
                  z-index:2;
                  background:#ff1493;
                  color:#fff;
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
            style="cursor:pointer"
            onerror="this.src='https://via.placeholder.com/800x1000?text=DADY+CLOTHES'"
          >

        </div>

        <div class="product-info">

          <small>${escapeHTML(product.category)}</small>

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

  const categorySet = new Set();

  products.forEach(product => {

    if (product.category) {
      categorySet.add(product.category);
    }

  });

  const categories = [
    "All",
    ...categorySet
  ];

  cat.innerHTML = categories.map(category => `
    <button
      type="button"
      onclick="filterCategory('${escapeHTML(category)}')"
    >
      ${escapeHTML(category)}
    </button>
  `).join("");
}


function filterCategory(category) {

  const search = document.getElementById("searchInput");

  if (search) search.value = "";

  if (category === "All") {
    renderProducts(products);
  } else {
    renderProducts(
      products.filter(
        product => product.category === category
      )
    );
  }

  document.getElementById("shop")?.scrollIntoView({
    behavior: "smooth"
  });
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

  const filtered = products.filter(product => {

    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );

  });

  renderProducts(filtered);
}


/* =========================
PRODUCT DETAILS
========================= */

function openProduct(id) {

  const product = products.find(
    p => Number(p.id) === Number(id)
  );

  if (!product) return;

  const modal =
    document.getElementById("productModal");

  document.getElementById("detailImage").src =
    product.image;

  document.getElementById("detailImage").alt =
    product.name;

  document.getElementById("detailName").textContent =
    product.name;

  document.getElementById("detailCategory").textContent =
    product.category;

  document.getElementById("detailPrice").textContent =
    "₹" + product.price;

  document.getElementById("detailOldPrice").textContent =
    product.oldPrice > product.price
      ? "₹" + product.oldPrice
      : "";

  document.getElementById("detailDescription").textContent =
    product.description;

  document.getElementById("detailAddButton").onclick =
    function () {

      const size =
        document.getElementById("detailSize")?.value || "M";

      addToCart(product.id, size);
      closeProduct();

    };

  modal.classList.add("show");
}


function closeProduct() {

  document
    .getElementById("productModal")
    ?.classList.remove("show");

}


/* =========================
CART
========================= */

function addToCart(id, size = "M") {

  const product = products.find(
    p => Number(p.id) === Number(id)
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
      size,
      qty: 1
    });
  }

  saveCart();
  openCart();
}


function saveCart() {

  localStorage.setItem(
    "dady_cart",
    JSON.stringify(cart)
  );

  updateCartCount();
  renderCart();
}


function updateCartCount() {

  const count =
    document.getElementById("count");

  if (!count) return;

  count.textContent = cart.reduce(
    (sum, item) =>
      sum + Number(item.qty || 0),
    0
  );
}


function renderCart() {

  const items =
    document.getElementById("items");

  const total =
    document.getElementById("total");

  if (!items || !total) return;

  if (!cart.length) {

    items.innerHTML = `
      <div style="text-align:center;padding:50px 15px;color:#777">
        <div style="font-size:42px">🛍️</div>
        <h3 style="color:#111">Your cart is empty</h3>
        <p>Add something from our collection.</p>
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
      >

      <div style="flex:1">

        <b>${escapeHTML(item.name)}</b>

        <p>₹${item.price}</p>

        <small>Size: ${escapeHTML(item.size)}</small>

        <div style="
          margin-top:10px;
          display:flex;
          gap:8px;
          align-items:center;
        ">

          <button
            onclick="changeQty(${item.id},'${escapeHTML(item.size)}',-1)"
          >
            −
          </button>

          <strong>${item.qty}</strong>

          <button
            onclick="changeQty(${item.id},'${escapeHTML(item.size)}',1)"
          >
            +
          </button>

          <button
            onclick="removeFromCart(${item.id},'${escapeHTML(item.size)}')"
          >
            Remove
          </button>

        </div>

      </div>

    </div>

  `).join("");

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
      Number(item.qty),
    0
  );

  total.textContent = cartTotal;
}


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


function openCart() {

  const drawer =
    document.getElementById("drawer");

  if (!drawer) return;

  drawer.classList.add("open");
  renderCart();
}


function closeCart() {

  document
    .getElementById("drawer")
    ?.classList.remove("open");

}


/* =========================
CHECKOUT
========================= */

function checkout() {

  if (!cart.length) {
    alert("Your cart is empty!");
    return;
  }

  document
    .getElementById("checkout")
    ?.classList.add("show");
}


function hideCheckout() {

  document
    .getElementById("checkout")
    ?.classList.remove("show");

}


/* =========================
PLACE COD ORDER
========================= */

async function placeOrder() {

  const name =
    document.getElementById("name")?.value.trim();

  const phone =
    document.getElementById("phone")?.value.trim();

  const address =
    document.getElementById("address")?.value.trim();

  const pin =
    document.getElementById("pin")?.value.trim();

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

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
      Number(item.qty),
    0
  );

  const orderId =
    "DC" +
    Date.now().toString().slice(-8);

  msg.textContent =
    "Placing your order...";

  try {

    const { error } = await db
      .from("orders")
      .insert({
        order_id: orderId,
        name,
        phone,
        address,
        pin,
        total,
        status: "Pending"
      });

    if (error) {
      console.error(error);
      msg.textContent =
        "Order save nahi hua. Please try again.";
      return;
    }

    msg.innerHTML = `
      <strong>Order placed successfully! 🎉</strong>
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

      ["name","phone","address","pin"].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "";
      });

    }, 3000);

  } catch (error) {

    console.error(error);

    msg.textContent =
      "Something went wrong. Please try again.";
  }
}


/* =========================
MODALS
========================= */

document.addEventListener("click", function(event) {

  if (
    event.target ===
    document.getElementById("productModal")
  ) {
    closeProduct();
  }

  if (
    event.target ===
    document.getElementById("checkout")
  ) {
    hideCheckout();
  }

});


document.addEventListener("keydown", function(event) {

  if (event.key === "Escape") {
    closeProduct();
    hideCheckout();
    closeCart();
  }

});


/* =========================
START
========================= */

document.addEventListener("DOMContentLoaded", function() {

  updateCartCount();
  renderCart();
  loadProducts();

});
/* =========================
CUSTOMER AUTH / PROFILE
========================= */

function openProfile() {

  const modal = document.getElementById("profileModal");

  if (!modal) return;

  modal.classList.add("show");

  checkCustomerSession();
}


function closeProfile() {

  document
    .getElementById("profileModal")
    ?.classList.remove("show");

}


async function checkCustomerSession() {

  const loginView =
    document.getElementById("loginView");

  const profileView =
    document.getElementById("profileView");

  const profileEmail =
    document.getElementById("profileEmail");

  if (!loginView || !profileView) return;

  const {
    data: { session }
  } = await db.auth.getSession();

  if (session && session.user) {

    loginView.style.display = "none";
    profileView.style.display = "block";

    if (profileEmail) {
      profileEmail.textContent =
        session.user.email;
    }

  } else {

    loginView.style.display = "block";
    profileView.style.display = "none";

  }
}


/* CUSTOMER LOGIN */

async function customerLogin() {

  const email =
    document.getElementById("customerEmail")
      ?.value.trim();

  const password =
    document.getElementById("customerPassword")
      ?.value;

  const msg =
    document.getElementById("authMsg");

  if (!msg) return;

  msg.textContent = "";

  if (!email || !password) {

    msg.textContent =
      "Email aur password bharo.";

    return;
  }

  msg.textContent = "Logging in...";

  try {

    const { data, error } =
      await db.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {

      msg.textContent =
        "Login failed: " + error.message;

      return;
    }

    if (!data.user) {

      msg.textContent =
        "Login nahi hua.";

      return;
    }

    msg.textContent =
      "Login successful! ✅";

    await checkCustomerSession();

  } catch (error) {

    console.error(error);

    msg.textContent =
      "Something went wrong.";

  }
}


/* CUSTOMER SIGNUP */

async function customerSignup() {

  const email =
    document.getElementById("customerEmail")
      ?.value.trim();

  const password =
    document.getElementById("customerPassword")
      ?.value;

  const msg =
    document.getElementById("authMsg");

  if (!msg) return;

  msg.textContent = "";

  if (!email || !password) {

    msg.textContent =
      "Email aur password bharo.";

    return;
  }

  if (password.length < 6) {

    msg.textContent =
      "Password kam se kam 6 characters ka hona chahiye.";

    return;
  }

  msg.textContent =
    "Account create ho raha hai...";

  try {

    const { data, error } =
      await db.auth.signUp({
        email: email,
        password: password
      });

    if (error) {

      msg.textContent =
        "Signup failed: " + error.message;

      return;
    }

    if (data.session) {

      msg.textContent =
        "Account created! ✅";

      await checkCustomerSession();

    } else {

      msg.textContent =
        "Account created! Email verify karke login karo.";

    }

  } catch (error) {

    console.error(error);

    msg.textContent =
      "Something went wrong.";

  }
}


/* CUSTOMER LOGOUT */

async function customerLogout() {

  const { error } =
    await db.auth.signOut();

  if (error) {

    console.error(error);

    return;
  }

  await checkCustomerSession();

}


/* MY ORDERS - TEMPORARY */

function showMyOrders() {

  alert(
    "My Orders system next step me connect karenge."
  );

      }
