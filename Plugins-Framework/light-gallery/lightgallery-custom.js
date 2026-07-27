let galleryInstance;
let settings = {
    infiniteLoop: false // default
};

$(document).ready(function () {
    // ✅ Initialize every .lightgallery instance on page
    document.querySelectorAll('.lightgallery').forEach(lightGalleryElement => {
        // Read per-gallery loop setting
        const infiniteLoop = $(lightGalleryElement).data('infinite-loop') === true ||
                             $(lightGalleryElement).data('infinite-loop') === 'true';

        const gallerySettings = {
            infiniteLoop: infiniteLoop || false
        };

        // ✅ Initialize LightGallery
        const galleryInstance = lightGallery(lightGalleryElement, {
            plugins: [lgZoom, lgThumbnail],
            thumbnail: true,
            speed: 400,
            dynamic: false,
            selector: 'a',
            loop: gallerySettings.infiniteLoop,
            thumbWidth: 80,
            thumbHeight: "80px",
            animateThumb: false,
            showThumbByDefault: true,
            // Force show all toolbar buttons on mobile (LightGallery hides them by default)
            mobileSettings: {
                controls: true,
                showCloseIcon: true,
                download: true,
            }
        });

        // Attach instance to the element
        lightGalleryElement.galleryInstance = galleryInstance;

        // Event bindings for each instance
        lightGalleryElement.addEventListener('lgAfterOpen', function () {
            stopThumbTransform();
            waitForThumbOuterThenInit();
        });

        lightGalleryElement.addEventListener('lgAfterSlide', function () {
            const $inner = $('.lg-thumb');
            stopThumbTransform();
            scrollActiveIntoView($inner, false);
        });

        $(window).on('resize', function () {
            const $outer = $('.lg-thumb-outer');
            const $inner = $('.lg-thumb');
            if ($outer.length && $inner.length) {
                stopThumbTransform();
                updateArrowVisibility($outer, $inner);
                scrollActiveIntoView($inner, false);
            }
        });
    });
});

// ✅ Handle click: open correct gallery by data-lightgallery-selector
$(document).on('click', '.slider_item.lightgallery-selector', function () {
    const gallerySelector = $(this).data('lightgallery-selector');
    const index = $(this).data('lightgallery-id') ?? 0;
    const galleryElement = document.querySelector(gallerySelector);

    if (galleryElement && galleryElement.galleryInstance) {
        galleryElement.galleryInstance.openGallery(index);
    }
});

function waitForThumbOuterThenInit() {
    const observer = new MutationObserver(() => {
        const $outer = $('.lg-thumb-outer');
        const $inner = $('.lg-thumb');

        if ($outer.length && $inner.length) {
            observer.disconnect();
            stopThumbTransform();

            // Remove old buttons inside .lg-thumb-outer
            $outer.find('.custom-prev-btn, .custom-next-btn').remove();

            // Add buttons inside .lg-thumb-outer
            $outer.append(`
                <div class="custom-prev-btn"><i class="fas fa-angle-left"></i></div>
                <div class="custom-next-btn"><i class="fas fa-angle-right"></i></div>
            `);

            // Handlers
            $outer.find('.custom-prev-btn').on('click', () => moveToPrevThumb($inner));
            $outer.find('.custom-next-btn').on('click', () => moveToNextThumb($inner));

            updateArrowVisibility($outer, $inner);
            scrollActiveIntoView($inner, false);

            // Scroll & click handlers
            $inner.on('scroll', () => updateArrowVisibility($outer, $inner));
            $(document).on('click', '.lg-thumb-item', () =>
                setTimeout(() => scrollActiveIntoView($inner, false), 60)
            );

            enableThumbDragScroll($inner);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// ✅ disable LightGallery’s translate3d effect
function stopThumbTransform() {
    const $inner = $('.lg-thumb');
    $inner.css({
        transform: 'none',
        width: 'auto'
    });
}

function updateArrowVisibility($outer, $inner) {
    const scrollLeft = $inner.scrollLeft();
    const scrollWidth = $inner[0].scrollWidth;
    const clientWidth = $outer[0].clientWidth;

    if (scrollWidth > clientWidth + 5) {
        if (settings.infiniteLoop) {
            $outer.find('.custom-prev-btn, .custom-next-btn').show();
        } else {
            $outer.find('.custom-prev-btn').toggle(scrollLeft > 5);
            $outer.find('.custom-next-btn').toggle(scrollLeft + clientWidth < scrollWidth - 5);
        }
    } else {
        $outer.find('.custom-prev-btn, .custom-next-btn').hide();
    }
}

function moveToPrevThumb($inner) {
    const $items = $inner.find('.lg-thumb-item');
    const $active = $items.filter('.active');
    let $prev = $active.prev('.lg-thumb-item');

    if (!$prev.length && settings.infiniteLoop) {
        $prev = $items.last();
    }

    if ($prev.length) {
        $prev.trigger('click');
        setTimeout(() => scrollActiveIntoView($inner, true), 50); // ✅ smooth true
    }
}

function moveToNextThumb($inner) {
    const $items = $inner.find('.lg-thumb-item');
    const $active = $items.filter('.active');
    let $next = $active.next('.lg-thumb-item');

    if (!$next.length && settings.infiniteLoop) {
        $next = $items.first();
    }

    if ($next.length) {
        $next.trigger('click');
        setTimeout(() => scrollActiveIntoView($inner, true), 50); // ✅ smooth true
    }
}

function scrollActiveIntoView($inner, smooth = true) {
    const $active = $inner.find('.lg-thumb-item.active');
    if (!$active.length) return;

    const container = $inner[0];
    const item = $active[0];

    const containerLeft = container.scrollLeft;
    const containerRight = containerLeft + container.clientWidth;
    const itemLeft = item.offsetLeft;
    const itemRight = itemLeft + item.offsetWidth;

    if (itemLeft < containerLeft) {
        container.scrollTo({ left: itemLeft - 10, behavior: smooth ? 'smooth' : 'auto' });
    } else if (itemRight > containerRight) {
        container.scrollTo({ left: itemRight - container.clientWidth + 10, behavior: smooth ? 'smooth' : 'auto' });
    }
}

function enableThumbDragScroll($thumb) {
    let isDown = false, startX, scrollLeft;

    $thumb.on('mousedown', function (e) {
        isDown = true;
        $thumb.addClass('dragging');
        startX = e.pageX - $thumb.offset().left;
        scrollLeft = $thumb.scrollLeft();

        // Prevent text selection while dragging
        e.preventDefault();
    });

    $(document).on('mouseup', function () {
        if (isDown) {
            isDown = false;
            $thumb.removeClass('dragging');
        }
    });

    $(document).on('mousemove', function (e) {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - $thumb.offset().left;
        const walk = (x - startX) * 1.5;
        $thumb.scrollLeft(scrollLeft - walk);
    });
}

// ---------------------------------
// Hide scrollbar behind gallery
// ---------------------------------
function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

$(document).on('lgAfterOpen', '#lightgallery', function () {
    document.documentElement.style.setProperty('--scrollbar-width', getScrollbarWidth() + 'px');
});

$(document).on('lgAfterClose', '#lightgallery', function () {
    document.documentElement.style.removeProperty('--scrollbar-width');
});
