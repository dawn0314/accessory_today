const prdListEl = document.getElementById('prdList');
const categorySelect = document.getElementById('categorySelect');

// 상품 하나씩 카드로 만듦
const generateCards = (productData) => {
  let cards = '';

  for (let i = 0; i < productData.length; i++) {
    const product = productData[i];

    cards += `
        <div class="card">
          <img src="${product.productImg}" alt="productImg">
          <div class="text">
            <p class="prd-name">${product.productName}</p>
            <p class="price">${product.price}</p>
          </div>
        </div>
      `;
  }

  return cards;
};

// 만든 카드로 list 만듦
const initProductsList = () => {
  if (prdListEl) {
    prdListEl.innerHTML = `
      <section class="prd-list">
        <div class="container">
          <div class="item-list">            
            ${generateCards([])}
          </div>
        </div>
      </section>
    `;
  } else {
    console.error('targetEl not found');
  }
};

// 카테고리 클릭 시 해당 상품 목록 불러옴
categorySelect.addEventListener('click', (e) => {
  e.preventDefault();

  const selected = e.target.getAttribute('data-category');

  fetch(`api/products?category=${selected}`)
    .then((response) => response.json())
    .then((data) => {
      const productData = data;
      prdListEl.innerHTML = generateCards(productData);
    })
    .catch((error) => {
      console.error('Error', error);
    });
});

initProductsList();