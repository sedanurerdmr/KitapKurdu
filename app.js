let bookList = [],
    basketList = [];

  

    toastr.options = {
      "closeButton": false,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-bottom-right",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }

const toggleModel = () => {
    const basketMOodalEl = document.querySelector(".basket-modal");
    basketMOodalEl.classList.toggle("active");
};

// `getBooks` fonksiyonunun Promise döndürdüğünden emin olun.
const getBooks = () => {
    return fetch("./products.json") // JSON dosyasının yolu doğru olmalı.
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            } else {
                return res.json();
            }
        })
        .then((books) => {
            allBooks = books; // Tüm kitaplar burada saklanır
            bookList = books;
            createBookItemsHtml();
            createBookTypesHtml() // `bookList` doldurulduktan sonra çağırın.
        })
        .catch((e) => {
            console.log(e);
        });
};

const createBookStars = (starRate) => {
    let starRateHtml = "";
    for (let i = 1; i <= 5; i++) {
        starRateHtml += `<i class="bi bi-star-fill ${Math.round(starRate) >= i ? "active" : ""}"></i>`;
    }
    return starRateHtml;
};

const createBookItemsHtml = () => {
    const bookListEl = document.querySelector(".book-list"); // Kitap listesini tutacak DOM elementi seçilir
    let bookListHtml = ""; // HTML içeriği biriktirmek için bir string başlatılır
  
    // `bookList` içindeki her kitap için HTML bloğu oluşturulur
    bookList.forEach((book, index) => {
      // `book` nesnesinden gelen bilgilerle HTML şablonu oluşturulur
      bookListHtml += `
        <div class="col-5 ${index % 2 === 0 ? "offset-2" : ""} my-5">
          <div class="row book-card">
            <div class="col-6">
              <img class="img-fluid shadow" 
              src="${book.imgSource}" 
              alt="${book.name}" 
              width="258px" 
              height="400px" />
            </div>
            <div class="col-6 d-flex flex-column justify-content-between">
              <div class="book-detail">
                <span class="fos gray fs-5">${book.author}</span><br>
                <span class="black fs-4 fw-bold">${book.name}</span><br>
                <span class="book-star-rate">
                  ${createBookStars(book.starRate)}
                  <span class="gray reviews-font-size">${book.reviewCount} reviews</span>
                </span>
              </div>
              <div>
                <p class="book-description fos gray">
                  ${book.description}
                </p>
              </div>
              <div>
                <span class="black fw-bold fs-4 me-2">${book.price}TL</span>
                ${book.oldPrice ? `<span class="gray fs-4 fw-bold old-price"> ${book.oldPrice}TL</span>` : ""}
              </div>
              <button class="btn-purple" onclick="addToBasket(${book.id})">SEPETE EKLE</button>
            </div>
          </div>
        </div>`;
    });
  
    // `bookListEl` elementinin içeriği olarak oluşturulan HTML bloğunu ayarlar
    bookListEl.innerHTML = bookListHtml;
  };

const BOOK_TYPES = {
  ALL: "Tümü",
  NOVEL: "Roman",
  CHILDREN: "Çocuk",
  SELFIMPROVEMENT: "Kişisel Gelişim",
  HISTORY: "Tarih",
  FINANCE: "Finans",
  SCIENCE: "Bilim"

}
  
const createBookTypesHtml = () => {
  const filterEl = document.querySelector(".filter");
  let filterHtml = "";
  let filterTypes = ["ALL"];
  bookList.forEach(book =>{
    if(filterTypes.findIndex((filter) => filter == book.type) ==-1) 
    filterTypes.push(book.type);
  });

    filterTypes.forEach((type, index )=>{
      filterHtml += `<li class="${index == 0 ? "active" : ""}" onclick="filterBooks(this)" data-type="${type}">${BOOK_TYPES[type] || type}</li>`;
    });

    filterEl.innerHTML = filterHtml;
  // BOOK_TYPES["ALL"]
}

const filterBooks = (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active")

  let bookType = filterEl.dataset.type;
  if (bookType !== "ALL"){
    bookList = allBooks.filter((book) => book.type === bookType);
  } else {
    bookList = allBooks;
  }

createBookItemsHtml();
}

const listBasketItem = () =>{
      localStorage.setItem("basketList", JSON.stringify(basketList))
    const basketListEl = document.querySelector(".basket-list")
    const basketCountEl = document.querySelector(".basket-count");
    basketCountEl.innerHTML =basketList.length > 0 ? basketList.length : null
    const totalPriceEl = document.querySelector(".total-price")
    
    let totalPrice = 0;
    let basketListHtml = "";
    basketList.forEach(item =>{
      let itemTotalPrice = item.product.price * item.quantity; // Toplam fiyat, ürün fiyatı ile miktarının çarpımı olarak hesaplanır
      totalPrice += itemTotalPrice; // Her öğenin toplam fiyatı genel toplama eklenir
        basketListHtml += `<li class="basket-item">
        <img 
        src="${item.product.imgSource}" 
        width="100" 
        height="100" 
        />
        <div class="basket-item-info">
          <h5 class="book-name">${item.product.name}</h5>
          <span class="book-price">${item.product.price}₺</span> <br>
          <span class="book-remove" onclick="removeItemToBasket(${item.product.id})">remove</span>
        </div>
        <div class="book-count">
          <span class="dec" onclick="decItemToBasket(${item.product.id})">-</span>
          <span class="my-3">${item.quantity}</span>
          <span class="inc" onclick="incItemToBasket(${item.product.id})">+</span>
        </div>
      </li>`;
    });
    basketListEl.innerHTML = basketListHtml ? basketListHtml : `<li class="basket-item">Sepetinizde Ürün Bulunamadı</li>`;
    totalPriceEl.innerHTML = totalPrice > 0 ? "Total : " +totalPrice.toFixed(2)+ "₺" : null;
    
};


const addToBasket = (bookId) =>{
  let findedBook = bookList.find(book => book.id == bookId);
  if(findedBook){
    const basketAlreadyIndex = basketList.findIndex(
      (basket) => basket.product.id == bookId
    );
    if(basketAlreadyIndex == -1){
      let addedItem = {quantity:1 , product: findedBook};
      basketList.push(addedItem)

    }else{
      if (
        basketList[basketAlreadyIndex].quantity < basketList[basketAlreadyIndex].product.stock
      ) 
        basketList[basketAlreadyIndex].quantity += 1
        else {
          toastr.error("Stok bulunmamakta");
          return;
        }
    }
    listBasketItem();
    toastr.success("başarıyla ekleme işlemi gerçekleşti")
    }
      
};

const removeItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex
  (basket => basket.product.id == bookId
   );
  if(findedIndex != -1){
    basketList.splice(findedIndex, 1); // ------(baslanacak index), -----(silinecek eleman sayisi)
  }
  listBasketItem();
 };
 
 const decItemToBasket = (bookId) =>{
   const findedIndex = basketList.findIndex
   (basket => basket.product.id == bookId
    );
    if(findedIndex != -1){
     if(basketList[findedIndex].quantity != 1)
       basketList[findedIndex].quantity -= 1;
     else removeItemToBasket(bookId);
     listBasketItem();
    }
    
 }


const incItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
  (basket) => basket.product.id == bookId
  );

  if (findedIndex != -1) {
    if (basketList[findedIndex].quantity < basketList[findedIndex].product.stock) 
      basketList[findedIndex].quantity += 1;
     else {
      toastr.error("Stok bulunmamakta");
    }
    listBasketItem();
  }
  
};


// `getBooks` fonksiyonunu asenkron bir işlem olarak çağırın ve `then` içinde DOM'u güncelleyin.
getBooks();

if(localStorage.getItem("basketList")){
  basketList = JSON.parse(localStorage.getItem("basketList"));
  listBasketItem();
}




