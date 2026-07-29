import os

filepath = "checkout.html"
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# We want to keep everything up to line 1097 (which is 0-indexed index 1097)
keep_lines = lines[:1097]

new_script = """    <script>
        // Initialize Lucide Icons & Mobile Menu Toggle
        if (window.lucide) {
            lucide.createIcons();
        }

        (function () {
            'use strict';

            const areaMap = {
                "Dhaka": ["Dhanmondi", "Gulshan", "Banani", "Mirpur", "Uttara", "Mohakhali", "Badda", "Mohammadpur", "Paltan", "Wari"],
                "Chittagong": ["GEC Circle", "Halishahar", "Nasirabad", "Agrabad", "Chawkbazar", "Panchlaish", "Lalkhan Bazar"],
                "Sylhet": ["Zindabazar", "Amberkhana", "Shibgonj", "Uposhahar", "Chouhatta", "Pathantula"],
                "Rajshahi": ["Boalia", "Motihar", "Rajpara", "Shah Mokhdum", "Sopura"],
                "Khulna": ["Khalishpur", "Daulatpur", "Sonadanga", "Khan Jahan Ali"],
                "Barisal": ["Sadar Road", "Natullabad", "Rupatoli", "Choumatha"],
                "Rangpur": ["Dhap", "Jahazcompany", "Modern Mor", "Sadar Town"],
                "Mymensingh": ["Ganginarpar", "Charpara", "Sadar Town"]
            };

            const FREE_SHIPPING_THRESHOLD = 1999;

            const emptyState = document.getElementById('checkout-empty-state');
            const checkoutForm = document.getElementById('checkout-page-form');
            const successPanel = document.getElementById('order-success-panel');

            const billingDistrict = document.getElementById('billing-district');
            const billingArea = document.getElementById('billing-area');

            const mobilePaymentFields = document.getElementById('mobile-payment-fields');

            // Helper to load cart
            function getCart() {
                try {
                    let items = JSON.parse(localStorage.getItem('goby_cart') || '[]');
                    items.forEach(item => {
                        if (item.name && !item.name.includes(' - [')) {
                            item.name = `${item.name} - [${item.size || 'M'}]`;
                        }
                    });
                    return items;
                } catch (e) {
                    return [];
                }
            }

            // Populate Area dropdowns
            function populateAreas(districtSelect, areaSelect) {
                const val = districtSelect.value;
                areaSelect.innerHTML = '<option value="" disabled selected>Select Area</option>';
                if (areaMap[val]) {
                    areaSelect.disabled = false;
                    areaMap[val].forEach(area => {
                        const opt = document.createElement('option');
                        opt.value = area;
                        opt.textContent = area;
                        areaSelect.appendChild(opt);
                    });
                } else {
                    areaSelect.disabled = true;
                }
            }

            if (billingDistrict) {
                billingDistrict.addEventListener('change', () => {
                    populateAreas(billingDistrict, billingArea);
                    updateCheckoutSummary();
                });
            }

            // Payment Option Toggle Style
            const paymentCards = document.querySelectorAll('.payment-card-btn');
            const paymentValueInput = document.getElementById('payment-method-value');

            paymentCards.forEach(card => {
                card.addEventListener('click', () => {
                    // Reset all cards
                    paymentCards.forEach(c => {
                        c.className = 'payment-card-btn relative p-3 border-2 border-line bg-white hover:border-brand/40 rounded-2xl cursor-pointer text-left transition-all flex flex-col justify-between h-[76px] select-none outline-none';
                        c.querySelector('.absolute').classList.add('hidden');
                    });

                    // Set active card
                    const method = card.getAttribute('data-method');
                    paymentValueInput.value = method;
                    card.className = 'payment-card-btn relative p-3 border-2 border-brand bg-brand/5 hover:border-brand rounded-2xl cursor-pointer text-left transition-all flex flex-col justify-between h-[76px] select-none outline-none';
                    card.querySelector('.absolute').classList.remove('hidden');

                    const senderNum = document.getElementById('sender-number');
                    const transId = document.getElementById('transaction-id');
                    const payAmount = document.getElementById('payment-amount');
                    const labelEl = document.getElementById('mobile-payment-label');

                    if (method !== 'cod') {
                        mobilePaymentFields.classList.remove('hidden');
                        senderNum.required = true;
                        transId.required = true;
                        payAmount.required = true;

                        if (method === 'bkash') {
                            labelEl.querySelector('span').textContent = 'bKash (01700000000)';
                        } else if (method === 'nagad') {
                            labelEl.querySelector('span').textContent = 'Nagad (01800000000)';
                        } else if (method === 'rocket') {
                            labelEl.querySelector('span').textContent = 'Rocket (01900000000)';
                        }
                    } else {
                        mobilePaymentFields.classList.add('hidden');
                        senderNum.required = false;
                        transId.required = false;
                        payAmount.required = false;
                        senderNum.value = '';
                        transId.value = '';
                        payAmount.value = '';
                    }
                });
            });

            // Update Summary
            function updateCheckoutSummary() {
                const cart = getCart();
                const itemsList = document.getElementById('checkout-page-items');
                const subtotalSpan = document.getElementById('checkout-subtotal');
                const shippingSpan = document.getElementById('checkout-shipping');
                const discountSpan = document.getElementById('checkout-discount');
                const discountRow = document.getElementById('checkout-discount-row');
                const totalSpan = document.getElementById('checkout-total');

                if (!itemsList) return;

                itemsList.innerHTML = '';
                let subtotal = 0;

                cart.forEach(item => {
                    subtotal += item.price * item.qty;
                    const div = document.createElement('div');
                    div.className = 'flex items-start justify-between py-3 text-xs border-b border-gray-100 last:border-0';
                    div.innerHTML = `
                        <div class="flex items-center gap-3 max-w-[70%]">
                          <img src="${item.image}" alt="" class="w-10 h-10 rounded-xl object-cover border border-line shrink-0 bg-gray-50">
                          <div class="flex flex-col min-w-0">
                            <span class="font-extrabold text-ink truncate">${item.name}</span>
                            <span class="text-[10px] text-charcoal/60 mt-0.5 font-bold">৳${item.price.toLocaleString()} x ${item.qty}</span>
                          </div>
                        </div>
                        <span class="font-black text-ink pt-1.5">৳${(item.price * item.qty).toLocaleString()}</span>
                    `;
                    itemsList.appendChild(div);
                });

                // Get shipping charge
                let shipping = 0;
                const district = billingDistrict.value;
                if (subtotal < FREE_SHIPPING_THRESHOLD && district) {
                    shipping = (district === 'Dhaka') ? 80 : 150;
                }

                // Apply discount if applied from cart page
                const discount = parseInt(localStorage.getItem('goby_discount') || '0') || 0;

                const total = subtotal + shipping - discount;

                subtotalSpan.textContent = subtotal.toLocaleString();
                shippingSpan.textContent = shipping > 0 ? `৳${shipping}` : 'Free';
                if (discount > 0) {
                    discountRow.classList.remove('hidden');
                    discountSpan.textContent = discount.toLocaleString();
                } else {
                    discountRow.classList.add('hidden');
                }
                totalSpan.textContent = total.toLocaleString();
            }

            // Init page render
            function initCheckoutPage() {
                const cart = getCart();
                if (cart.length === 0) {
                    emptyState.classList.remove('hidden');
                    checkoutForm.classList.add('hidden');
                } else {
                    emptyState.classList.add('hidden');
                    checkoutForm.classList.remove('hidden');
                    updateCheckoutSummary();
                }
            }

            // Sync cart badge on header
            function syncCartBadge() {
                const cart = getCart();
                const total = cart.reduce((s, i) => s + i.qty, 0);
                const badge = document.getElementById('cart-badge');
                if (badge) {
                    badge.textContent = total;
                    total > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
                }
            }

            // Handle checkout form submission
            if (checkoutForm) {
                checkoutForm.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const cart = getCart();
                    const orderId = '#GB-' + Math.floor(10000 + Math.random() * 90000);
                    const name = document.getElementById('billing-name').value;
                    const phone = document.getElementById('billing-phone').value;

                    const bStreet = document.getElementById('billing-address').value;
                    const bArea = document.getElementById('billing-area').value;
                    const bDistrict = document.getElementById('billing-district').value;
                    const address = `${bStreet}, ${bArea}, ${bDistrict}`;

                    const totalSpan = document.getElementById('checkout-total');
                    const totalPaid = totalSpan ? totalSpan.textContent : '0';

                    // Populate success panel
                    successPanel.querySelector('#success-order-id').textContent = orderId;
                    successPanel.querySelector('#success-name').textContent = name;
                    successPanel.querySelector('#success-phone').textContent = phone;
                    successPanel.querySelector('#success-address').textContent = address;
                    successPanel.querySelector('#success-total').textContent = `৳${totalPaid}`;

                    // Clear cart
                    localStorage.removeItem('goby_cart');
                    localStorage.removeItem('goby_discount');

                    // Show success panel, hide form
                    checkoutForm.classList.add('hidden');
                    successPanel.classList.remove('hidden');

                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                    // Sync badges
                    syncCartBadge();
                    if (window.syncOffcanvas) window.syncOffcanvas();
                });
            }

            // Run on load
            initCheckoutPage();
            syncCartBadge();
        })();
    </script>
</body>

</html>
"""

output_content = "".join(keep_lines) + new_script

with open(filepath, "w", encoding="utf-8") as f:
    f.write(output_content)

print("Successfully cleaned and wrote checkout.html")
