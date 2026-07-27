$(document).ready(function () {
    function getDataOrDefault($el, key, defaultValue) {
        const val = $el.attr(`data-${key}`);
        if (val === undefined) return defaultValue;
        if (val === 'true') return true;
        if (val === 'false') return false;
        return val;
    }

    // Dynamic resolution of responsive attributes (e.g., "BPD: true, BP-768: false") based on window width
    function resolveResponsiveVal(dataAttrStr, defaultVal) {
        if (dataAttrStr === undefined || dataAttrStr === null) return defaultVal;
        const str = String(dataAttrStr).trim();
        if (str === 'true') return true;
        if (str === 'false') return false;
        if (!isNaN(Number(str))) return Number(str);

        let bpdVal = defaultVal;
        const rules = [];

        if (str.includes(':')) {
            str.split(',').forEach(item => {
                const parts = item.trim().split(':');
                if (parts.length < 2) return;
                const bpKey = parts[0].trim().toUpperCase();
                const rawVal = parts[1].trim();
                let parsedVal = rawVal;
                if (rawVal === 'true') parsedVal = true;
                else if (rawVal === 'false') parsedVal = false;
                else if (!isNaN(Number(rawVal))) parsedVal = Number(rawVal);

                if (bpKey === 'BPD') {
                    bpdVal = parsedVal;
                } else {
                    const bpNum = parseInt(bpKey.replace('BP-', ''));
                    if (!isNaN(bpNum)) {
                        rules.push({ bp: bpNum, val: parsedVal });
                    }
                }
            });

            // Sort ascending by breakpoint number (e.g. 576, 768, 992)
            rules.sort((a, b) => a.bp - b.bp);

            const currentW = $(window).width();
            for (let i = 0; i < rules.length; i++) {
                if (currentW <= rules[i].bp) {
                    return rules[i].val;
                }
            }
        }
        return bpdVal;
    }

    function parseResponsiveAttr(valStr, defaultBpdVal, settingKey, responsiveMap) {
        if (valStr === undefined || valStr === null) return defaultBpdVal;
        const str = String(valStr).trim();
        if (str === 'true') return true;
        if (str === 'false') return false;
        if (!isNaN(Number(str))) return Number(str);

        let bpdVal = defaultBpdVal;

        if (str.includes(':')) {
            str.split(',').forEach(setting => {
                const parts = setting.trim().split(':');
                if (parts.length < 2) return;
                const bpKey = parts[0].trim().toUpperCase();
                const rawVal = parts[1].trim();
                let parsedVal = rawVal;
                if (rawVal === 'true') parsedVal = true;
                else if (rawVal === 'false') parsedVal = false;
                else if (!isNaN(Number(rawVal))) parsedVal = Number(rawVal);

                if (bpKey === 'BPD') {
                    bpdVal = parsedVal;
                } else {
                    const bpNum = parseInt(bpKey.replace('BP-', ''));
                    if (!isNaN(bpNum)) {
                        if (!responsiveMap[bpNum]) {
                            responsiveMap[bpNum] = {};
                        }
                        responsiveMap[bpNum][settingKey] = parsedVal;
                    }
                }
            });
        }
        return bpdVal;
    }

    // 1. Prepare unique classes for all sliders
    $('.slider').each(function () {
        const name = $(this).attr('slider-name');
        if (name) {
            $(this).find('.slider_wrap').addClass('wrap-id-' + name);
        }
    });

    $('.slider').each(function () {
        const $slider = $(this);
        const name = $slider.attr('slider-name');
        const $wrap = $slider.find('.slider_wrap');

        const slidesToShowAttr = getDataOrDefault($slider, 'slides-to-show', 'BPD: 1');
        const slidesToScrollAttr = getDataOrDefault($slider, 'slides-to-scroll', 'BPD: 1');
        const arrowsAttr = getDataOrDefault($slider, 'arrows', true);
        const dotsAttr = getDataOrDefault($slider, 'dots', true);
        const autoplayAttr = getDataOrDefault($slider, 'autoplay', false);
        const infinite = getDataOrDefault($slider, 'infinite', true);
        const transitionAttr = getDataOrDefault($slider, 'transition', 'slide');
        const fadeAttr = getDataOrDefault($slider, 'fade', false);
        const fade = (transitionAttr === 'fade' || fadeAttr === true || fadeAttr === 'true');
        const centerMode = getDataOrDefault($slider, 'center-mode', false);
        const innerGap = getDataOrDefault($slider, 'inner-gap', '0');

        const dataSliderFor = $slider.attr('data-slider-for');
        const dataSliderNav = $slider.attr('data-slider-nav');

        const responsiveMap = {};

        const SlidesToShow = parseResponsiveAttr(slidesToShowAttr, 1, 'slidesToShow', responsiveMap);
        const SlidesToScroll = parseResponsiveAttr(slidesToScrollAttr, 1, 'slidesToScroll', responsiveMap);
        const showArrows = parseResponsiveAttr(arrowsAttr, true, 'arrows', responsiveMap);
        const showDots = parseResponsiveAttr(dotsAttr, true, 'dots', responsiveMap);
        const showAutoplay = parseResponsiveAttr(autoplayAttr, false, 'autoplay', responsiveMap);

        const responsive = Object.keys(responsiveMap).map(bp => ({
            breakpoint: parseInt(bp),
            settings: responsiveMap[bp]
        }));

        const totalSlides = $wrap.children().length;
        let centerModeOpt = centerMode;
        let infiniteOpt = infinite;

        if (totalSlides <= SlidesToShow) {
            centerModeOpt = false;
            infiniteOpt = false;
            $slider.addClass('no-scroll');
        }

        const slickOptions = {
            arrows: showArrows,
            prevArrow: $slider.find('.left_btn'),
            nextArrow: $slider.find('.right_btn'),
            dots: showDots,
            infinite: infiniteOpt,
            speed: fade ? 600 : 300,
            slidesToShow: SlidesToShow,
            slidesToScroll: SlidesToScroll,
            adaptiveHeight: true,
            autoplay: showAutoplay,
            autoplaySpeed: 5000,
            cssEase: fade ? 'ease-in-out' : 'ease',
            fade: fade,
            centerMode: centerModeOpt,
            responsive: responsive,
            focusOnSelect: (dataSliderFor || dataSliderNav || centerModeOpt) ? true : false
        };

        if (dataSliderFor) slickOptions.asNavFor = '.wrap-id-' + dataSliderFor;
        if (dataSliderNav) slickOptions.asNavFor = '.wrap-id-' + dataSliderNav;

        function updateControlVisibility(slick) {
            const currentArrows = resolveResponsiveVal(arrowsAttr, true);
            const currentDots = resolveResponsiveVal(dotsAttr, true);

            if (currentArrows === false || totalSlides <= (slick ? slick.options.slidesToShow : 1)) {
                $slider.find('.left_btn, .right_btn').attr('style', 'display: none !important;');
            } else {
                $slider.find('.left_btn, .right_btn').attr('style', 'display: flex !important;');
            }

            if (currentDots === false) {
                $slider.find('.slick-dots').attr('style', 'display: none !important;');
            } else {
                $slider.find('.slick-dots').attr('style', 'display: flex !important;');
            }
        }

        function applySliderGaps() {
            if (innerGap && innerGap !== '0') {
                const gapValue = parseInt(innerGap);
                const halfGap = gapValue / 2;
                
                // Safe native styling to keep Slick's dynamically calculated widths and transforms
                $slider.find('.slick-list').each(function() {
                    this.style.setProperty('margin-left', `-${halfGap}px`, 'important');
                    this.style.setProperty('margin-right', `-${halfGap}px`, 'important');
                });

                $slider.find('.slick-slide').each(function() {
                    this.style.setProperty('padding-left', `${halfGap}px`, 'important');
                    this.style.setProperty('padding-right', `${halfGap}px`, 'important');
                    this.style.setProperty('box-sizing', 'border-box', 'important');
                });

                $slider.find('.slick-track').each(function() {
                    this.style.setProperty('display', 'flex', 'important');
                    const currentSlidesToShow = resolveResponsiveVal(slidesToShowAttr, 1);
                    if (totalSlides <= currentSlidesToShow) {
                        this.style.setProperty('justify-content', 'center', 'important');
                    } else {
                        this.style.removeProperty('justify-content');
                    }
                });
            }
        }

        $wrap.on('init breakpoint setPosition reInit', function (event, slick) {
            updateControlVisibility(slick);
            applySliderGaps();
        });

        // Safe helper to call slick methods without uncaught TypeError during initialization
        function safeSlickAction(action) {
            if ($wrap.hasClass('slick-initialized')) {
                try {
                    $wrap.slick(action);
                } catch (e) {
                    // Ignore transient init state
                }
            }
        }

        // Video Controller: Auto-advance on video end when autoplay is ON, or loop video continuously when autoplay is OFF
        function handleSlideVideoPlayback() {
            const isAutoplayEnabled = showAutoplay;

            // 1. Pause all videos on inactive slides
            $wrap.find('.slick-slide video').each(function () {
                this.muted = true;
                if (typeof this.pause === 'function') {
                    this.pause();
                }
            });

            const $activeSlide = $wrap.find('.slick-slide.slick-active, .slick-slide.slick-current');
            const $activeVideo = $activeSlide.find('video');

            if ($activeVideo.length) {
                const video = $activeVideo[0];
                video.muted = true;
                video.playsInline = true;

                if (isAutoplayEnabled) {
                    // Autoplay ON: Temporarily pause timer, play once, auto-advance on ended
                    video.loop = false;
                    safeSlickAction('slickPause');

                    if (video.currentTime >= video.duration - 0.5) {
                        video.currentTime = 0;
                    }

                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.then(function () {
                            $(video).off('ended.slideVideo').on('ended.slideVideo', function () {
                                $(video).off('ended.slideVideo');
                                safeSlickAction('slickPlay');
                                safeSlickAction('slickNext');
                            });
                        }).catch(function (error) {
                            console.log('Autoplay prevented:', error);
                            safeSlickAction('slickPlay');
                        });
                    }
                } else {
                    // Autoplay OFF: Loop video continuously on current slide
                    video.loop = true;
                    $(video).off('ended.slideVideo');
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(function (error) {
                            console.log('Video play prevented:', error);
                        });
                    }
                }
            } else {
                // Non-video slide: resume standard autoplay if enabled
                if (isAutoplayEnabled) {
                    safeSlickAction('slickPlay');
                }
            }
        }

        $wrap.on('afterChange', function () {
            handleSlideVideoPlayback();
        });

        // Apply slick
        $wrap.slick(slickOptions);


        // Run video check safely after initialization
        handleSlideVideoPlayback();

        // Immediate check right after slick initialization
        updateControlVisibility($wrap.slick('getSlick'));

        $(window).on('resize.slickCustom', function () {
            if ($wrap.hasClass('slick-initialized')) {
                updateControlVisibility($wrap.slick('getSlick'));
                applySliderGaps();
            }
        });

        if (!showArrows || totalSlides <= SlidesToShow) {
            $slider.find('.left_btn, .right_btn').hide();
        }

        // Init gaps
        applySliderGaps();
    });

    // Sync handler
    $(document).on('click', '[data-slider-for] .slider_item', function () {
        const $navSlider = $(this).closest('.slider');
        const targetMainName = $navSlider.attr('data-slider-for');
        const index = $(this).data('slick-index');

        if (targetMainName && index !== undefined) {
            $('.wrap-id-' + targetMainName).slick('slickGoTo', index);
        }
    });

    // Prevent action buttons (.action-btn) from shifting/sliding the carousel
    $(document).on('click', '.action-btn', function (e) {
        e.stopPropagation();
    });
});