const products = [
  {
    id: 1,
    name: "Oversized Black T-Shirt",
    category: "T-Shirts",
    price: 599,
    oldPrice: 899,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"
  },
  {
    id: 2,
    name: "Premium White T-Shirt",
    category: "T-Shirts",
    price: 549,
    oldPrice: 799,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800"
  },
  {
    id: 3,
    name: "Black Streetwear Hoodie",
    category: "Hoodies",
    price: 999,
    oldPrice: 1499,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"
  },
  {
    id: 4,
    name: "Classic Blue Jeans",
    category: "Jeans",
    price: 1199,
    oldPrice: 1699,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"
  }
];

document.addEventListener("DOMContentLoaded", function () {

  const grid = document.getElementById("grid");
  const cat = document.getElementById("cat");

  if (!grid) {
    alert("GRID NOT FOUND");
    return;
  }

  if (cat) {
    cat.innerHTML = `
      <button>All</button>
      <button>T-Shirts</button>
      <button>Hoodies</button>
      <button>Jeans</button>
    `;
  }

  grid.innerHTML = products.map(p => `
    <article class="product">
      <img src="${p.image}" alt="${p.name}">
      <div class="product-info">
        <small>${p.category}</small>
        <h3>${p.name}</h3>
        <p>
          <b>₹${p.price}</b>
          <del>₹${p.oldPrice}</del>
        </p>
        <button class="btn">VIEW PRODUCT →</button>
      </div>
    </article>
  `).join("");

});
