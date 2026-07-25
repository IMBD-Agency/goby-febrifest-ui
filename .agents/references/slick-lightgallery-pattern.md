# Slick Slider + LightGallery Integration Pattern Reference

This reference documents the clean pattern for combining **Slick Slider** (main product view + synced thumbnail carousel) with **LightGallery** (fullscreen lightbox modal) for Product Details pages.

---

## 1. Required External Assets & Scripts

### CSS Files:
```html
<!-- LightGallery Bundle CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lightgallery@2.7.1/css/lightgallery-bundle.min.css">
<link rel="stylesheet" href="{{ asset('Plugins-Framework/light-gallery/lightgallery-custom.css') }}">
```

### JS Scripts:
```html
<!-- LightGallery Core & Plugins -->
<script src="{{ asset('Plugins-Framework/light-gallery/lightgallery.min.js') }}"></script>
<script src="{{ asset('Plugins-Framework/light-gallery/plugins/zoom/lg-zoom.min.js') }}"></script>
<script src="{{ asset('Plugins-Framework/light-gallery/plugins/thumbnail/lg-thumbnail.min.js') }}"></script>
<script src="{{ asset('Plugins-Framework/light-gallery/lightgallery-custom.js') }}"></script>
```

---

## 2. HTML Markup Structure

### A. Main Product Slider (16:9 View):
```html
<div slider-name="Product-Slider-Details"
    data-slides-to-show="BPD: 1"
    data-arrows="true"
    data-dots="false"
    data-fade="true"
    data-slider-for="Product-Slider-Nav"
    class="slider position-relative overflow-visible">
    
    <!-- Custom Navigation Arrows -->
    <div>
        <span class="left_btn"><i class="fas fa-angle-left"></i></span>
        <span class="right_btn"><i class="fas fa-angle-right"></i></span>
    </div>

    <!-- Main Slider Wrap -->
    <div class="slider_wrap rounded_10">
        @foreach ($images as $index => $image)
            <div class="slider_item rounded_10 lightgallery-selector cursor-pointer"
                data-lightgallery-selector="#lightgallery-product"
                data-lightgallery-id="{{ $index }}">
                <div class="ratio ratio-16x9 position-relative">
                    <img data-src="{{ $image['src'] }}" alt="{{ $image['alt'] }}" class="object_cover lazyload">
                </div>
            </div>
        @endforeach
    </div>
</div>
```

### B. Thumbnail Nav Slider (Synced 1:1 Thumbnails):
```html
<div slider-name="Product-Slider-Nav"
    data-slides-to-show="BPD: 5, BP-1024: 4, BP-800: 3, BP-600: 3"
    data-slides-to-scroll="BPD: 1"
    data-arrows="true"
    data-dots="false"
    data-infinite="true"
    data-center-mode="true"
    data-inner-gap="10"
    data-slider-nav="Product-Slider-Details"
    class="slider nav-slider position-relative overflow-visible">
    
    <div>
        <span class="left_btn"><i class="fas fa-angle-left"></i></span>
        <span class="right_btn"><i class="fas fa-angle-right"></i></span>
    </div>

    <div class="slider_wrap rounded_10">
        @foreach ($images as $image)
            <div class="slider_item rounded_10 BoxShadow p-0 m-0">
                <div class="ratio ratio-1x1 position-relative w-100 h-100">
                    <img data-src="{{ $image['src'] }}" alt="{{ $image['alt'] }}" class="object_cover lazyload w-100 h-100" style="object-fit: cover;">
                </div>
            </div>
        @endforeach
    </div>
</div>
```

### C. Active Thumbnail CSS Highlight:
```css
.nav-slider .slider_item {
    border: 2px solid var(--ColorLightPrimary, #ffffff) !important;
    transition: border-color 0.2s ease;
}

.nav-slider .slider_item.slick-active.slick-current {
    border: 2px solid var(--ColorPrimary, #F7931E) !important;
}
```

### D. Hidden LightGallery Container:
```html
<div class="d-none">
    <div class="lightgallery" id="lightgallery-product">
        @foreach ($images as $image)
            <a href="{{ $image['src'] }}">
                <img src="{{ $image['src'] }}" alt="{{ $image['alt'] }}" />
            </a>
        @endforeach
    </div>
</div>
```

---

## 3. JavaScript Initialization

```javascript
document.addEventListener('DOMContentLoaded', function () {
    // Initialize LightGallery on hidden gallery container
    const galleryContainer = document.getElementById('lightgallery-product');
    if (galleryContainer) {
        lightGallery(galleryContainer, {
            plugins: [lgZoom, lgThumbnail],
            speed: 500,
            download: false,
            mobileSettings: {
                controls: true,
                showCloseIcon: true,
                download: false
            }
        });
    }

    // Trigger LightGallery modal on clicking main slider item
    $(document).on('click', '.lightgallery-selector', function () {
        const selectorId = $(this).data('lightgallery-selector');
        const slideIndex = $(this).data('lightgallery-id');
        const $gallery = $(selectorId);
        
        if ($gallery.length) {
            $gallery.find('a').eq(slideIndex).trigger('click');
        }
    });
});
```

---

## Key Benefits:
1. **Seamless Sync**: Main slider and thumbnail slider sync smoothly using Slick's `data-slider-for` and `data-slider-nav` attributes.
2. **Lightbox Triggering**: Main image click triggers LightGallery lightbox dynamically at the exact slide index without interrupting page layout.
3. **Responsive Thumbnail Bar**: Thumbnails scale dynamically using `BPD: 5, BP-1024: 4, BP-800: 3, BP-600: 3` breakpoint attributes.
