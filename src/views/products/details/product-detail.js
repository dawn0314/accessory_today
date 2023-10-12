// 상품 주문 개수 up&down
const numberElement = document.querySelector(".number");
const arrowUp = document.querySelector(".arrow-up");
const arrowDown = document.querySelector(".arrow-down");

let number = 1;

function increaseNumber() {
  number++;
  numberElement.textContent = number;
}

function decreaseNumber() {
  if (number > 1) {
    number--;
    numberElement.textContent = number;
  }
}

arrowUp.addEventListener("click", increaseNumber);
arrowDown.addEventListener("click", decreaseNumber);

// 상품 데이터 불러오기
const pathSegments = window.location.pathname.split("/");
const productId = pathSegments[pathSegments.length - 1]; // 마지막 세그먼트를 가져옵니다.
let product = {};
console.log("productId:", productId);
fetch(`/api/products/${productId}`)
  .then((response) => {
    console.log(response);
    if (!response.ok) {
      throw new Error("Error");
    }
    return response.json();
  })
  .then((productData) => {
    console.log(productData);
    document.querySelector(".product-name").textContent =
      productData.productName;
    document.querySelector(".product-price").textContent = productData.price;
    document.querySelector(".products-img").src = productData.productImg;
    document.querySelector(".productsDet-img").src = productData.description;
    // 개수랑 사이즈 쿼리셀렉터 작성
    product = {
      productId: productData._id,
      productName: productData.productName,
      price: productData.price,
      productImg: productData.productImg,
    };
  })
  .catch((error) => {
    console.error("Error", error);
  });

const productSizeSelect = document.getElementById("product-size");

document
  .querySelector(".add-to-cart-button")
  .addEventListener("click", function () {
    product.quantity = parseInt(
      document.querySelector(".number").textContent,
      10
    );

    product.size = productSizeSelect.value;

    if (product.size === "" || product.size === null) {
      alert("상품 사이즈를 선택해주세요.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("myCart")) || [];

    // 장바구니에 같은 상품이 이미 있는지 확인합니다.
    const existingProduct = cart.find(
      (p) => p._id === product._id && p.size === product.size
    );

    if (existingProduct) {
      // 이미 있으면 수량을 업데이트합니다.
      existingProduct.quantity += product.quantity;
    } else {
      cart.push(product);
    }
    localStorage.setItem("myCart", JSON.stringify(cart));

    alert("장바구니에 추가되었습니다.");
  });

async function verifyToken(token) {
  return await fetch("/api/users/verify-user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .catch((error) => {
      console.log("Network error during token verification:", error);
      return false;
    });
}

function createCartUrl({ productImg, productName, price, quantity, size }) {
  return `/cart?productImg=${productImg}&productName=${productName}&price=${price}&quantity=${quantity}&size=${size}`;
}

// 이거 buynow인가용?
document.querySelector(".order-button").addEventListener("click", function () {
  const { productImg, productName, price, quantity, size } = product;

  product.size = productSizeSelect.value;
  if (product.size === "" || product.size === null) {
    alert("상품 사이즈를 선택해주세요.");
    return;
  }

  const token = localStorage.getItem("Authorization") || "";

  // 비회원일 때 경로를 다르게 수정해 주어야 합니당!
  if (!token) {
    window.location.href = createCartUrl({
      productImg,
      productName,
      price,
      quantity,
      size,
    });
    return;
  }

  // 토큰이 있을 경우(로그인 상태)
  // 경로 undefined인 거 빼고는 잘됨!
  verifyToken(token).then((isValid) => {
    if (isValid) {
      window.location.href = createCartUrl({
        productImg,
        productName,
        price,
        quantity,
        size,
      });
    } else {
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
    }
  });
});

// 후기,문의 버튼 클릭 시 로그인 토큰 검사
document.getElementById("reviews-btn").addEventListener("click", function () {
  verifyTokenAndRedirect(
    // 경로 수정!
    `/products/details/${productId}/review-upload`
  );
});

document.getElementById("questions-btn").addEventListener("click", function () {
  verifyTokenAndRedirect(
    // 경로 수정!
    `/products/details/${productId}/inquiry-upload`
  );
});

function verifyTokenAndRedirect(url) {
  const token = localStorage.getItem("Authorization") || "";
  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login";
    return;
  }

  verifyToken(token).then((data) => {
    if (!data.email) {
      alert("유효하지 않은 회원입니다. 다시 로그인해주세요.");
      window.location.href = "/login";
    } else {
      window.location.href = url;
    }
  });
}

//후기,문의작성 title,author,content
function fetchReviews(productId, getAll = false) {
  // URL을 동적으로 구성합니다.
  const url = `/products/${productId}/review?getAll=${getAll}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("error" + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      const tableBody = document.querySelector("#review-table tbody");
      data.forEach((review) => {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent = review.date;
        row.appendChild(dateCell);

        const idCell = document.createElement("td");
        idCell.textContent = review._id;
        row.appendChild(idCell);

        const titleCell = document.createElement("td");
        titleCell.textContent = review.title;
        row.appendChild(titleCell);

        const contentCell = document.createElement("td");
        contentCell.textContent = review.content;
        row.appendChild(contentCell);

        tableBody.appendChild(row);
      });
    })
    .catch((err) => console.error("Error", err));
}

function fetchQuestion(productId, getAll = false) {
  // URL을 동적으로 구성합니다.
  const url = `/products/${productId}/inquiry?getAll=${getAll}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("error " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      const tableBody = document.querySelector("#question-table tbody");
      data.forEach((question) => {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent = question.date;
        row.appendChild(dateCell);

        const idCell = document.createElement("td");
        idCell.textContent = question._id;
        row.appendChild(idCell);

        const titleCell = document.createElement("td");
        titleCell.textContent = question.title;
        row.appendChild(titleCell);

        const contentCell = document.createElement("td");
        contentCell.textContent = question.content;
        row.appendChild(contentCell);

        tableBody.appendChild(row);
      });
    })
    .catch((err) => console.error("Error", err));
}
