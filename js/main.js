(function () {
    let alertMessage = document.getElementById("alert-message");
    let storefrontHeader = document.getElementById("storefront-header");

    setTimeout(() => {
        if (alertMessage) {
            alertMessage.classList.add("d-none");
        }

        if (storefrontHeader.classList.contains("overflow-hidden")) {
            storefrontHeader.classList.toggle("overflow-hidden");
        }
    }, 6000);

    if (window.location.pathname.includes("product-details") || window.location.pathname.includes("cart")) {
        
        let productQuantityFields = document.getElementsByClassName("product-quantity");

        for (let i = 0; i < productQuantityFields.length; i++) {
            const productId = productQuantityFields[i].getAttribute("data-product");
            const variantId = productQuantityFields[i].getAttribute("data-variant");

            console.log(" Cart: ",cart[user],productId,variantId)

            const cartItem = cart[user].find((item) => (item.productId === productId && item.variantId === variantId))

            if (cartItem) {
                productQuantityFields[i].setAttribute("value", (cartItem.quantity || 1))
            }
        }
    }

    if (window.location.pathname.includes("product-details")) {
        // Start - (Adding Add to cart button dynamically.)

        let cartBtnBlock = document.getElementById("cart-btn-block");

        if (variantId) {
            console.log(" VariantId: ",isAlreadyInCart)

            if (isAlreadyInCart) {
                cartBtnBlock.innerHTML += `
                    <a href="/sites/${secret}/cart" class="btn btn--e-brand-b-2 add-to-cart"  style="background-color:#FF9F00;border-color:#FF9F00;"  >
                        <i class="fa fa-shopping-cart"></i> <span>Added To Cart</span>
                    </a>
                `
            } else {
                cartBtnBlock.innerHTML += `
                    <span class="btn btn--e-brand-b-2 add-to-cart"  data-product=${productId} data-variant=${variantId} data-action="add" style="background-color:#FF9F00;border-color:#FF9F00;" >
                        <i class="fa fa-shopping-cart"></i> Add To Cart
                    </span>
                `
            }
        }


        // End - (Adding Add to cart button dynamically.)

        const urlSearchParams = new URLSearchParams(window.location.search.replace("?", ""));

        const params = Object.fromEntries(urlSearchParams);

        for (let value of Object.values(params)) {
            const element = document.querySelector(`label[for='${value}']`);

            element.classList.add("variant-active");
        }


    }

    if (window.location.pathname.includes("checkout")) {
        const placeOrderBtn = document.getElementById("place-order");

        placeOrderBtn.addEventListener("click", async function () {
            const data = {
                buyer_id: buyerId,
                address: addressId,
                items: cart[user]
            }

            await fetch(`/sites/${handle}/place-order/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(" Response Data: ", data)

                    cart = {};

                    cart[user] = [];

                    document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/"

                    alert("Your order is created successfully!")

                    location.replace(`/sites/${handle}/`);
                })
                .catch((error) => console.log(" Error: ", error))
        })
    }
})();

let filters = []


const addToCartButtons = document.getElementsByClassName("add-to-cart");
const removeCartItemBtns = document.getElementsByClassName("remove-cart-item-btn");
const changeQuantityBtns = document.getElementsByClassName("change-quantity-btn");

for (let i = 0; i < addToCartButtons.length; i++) {
    addToCartButtons[i].addEventListener('click', function () {
        var productId = this.dataset.product;
        var variantId = this.dataset.variant;
        var action = this.dataset.action;

        addItemToCookie({ productId, variantId, action });
    })
}

for (let i = 0; i < removeCartItemBtns.length; i++) {
    removeCartItemBtns[i].addEventListener('click', function () {
        const productId = this.dataset.product;
        const variantId = this.dataset.variant;

        if (cart[user].find((item) => item.variantId === variantId && item.productId === productId)) {
            cart[user] = cart[user].filter((item) => !(item.variantId === variantId && item.productId === productId))
        }

        document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/"

        location.reload()
    })
}

for (let i = 0; i < changeQuantityBtns.length; i++) {
    changeQuantityBtns[i].addEventListener("click", function () {
        var productId = this.dataset.product;
        var variantId = this.dataset.variant;
        var action = this.dataset.action;

        addItemToCookie({ productId, variantId, action });
    })
}

function addItemToCookie({ productId, variantId, action }) {
    if (cart[user] == undefined) {
        cart[user] = []
    }

    if (action == 'add') {
        const isProductExist = cart[user].find((item) => item.productId === productId && item.variantId === variantId)
        if (!isProductExist) {
            cart[user].push({ productId, variantId, 'quantity': 1 })
        } else {
            const items = cart[user].map((item) => {
                if(item.productId === productId && item.variantId === variantId){
                    return {...item,quantity:item.quantity + 1}
                }
                return item
            })
            cart[user] = items
        }
    }

    if (action == 'remove') {
        const items = cart[user].map((item) => {
            if(item.productId === productId && item.variantId === variantId){
                return {...item,quantity:item.quantity - 1}
            }
            return item
        }).filter((item) => item.quantity !== 0)

        cart[user] = items; 
    }

    
    document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/"

    location.reload()
}

function clearCart() {
    cart = {};

    cart[user] = {};
    cart.test = [];

    document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/"

    location.reload()
}


