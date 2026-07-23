function initSummernote(selector = '.summernote') {
    $(selector).summernote({
        placeholder: 'Start Writing ...',
        tabsize: 2,
        height: 268,
        fontNames: ['Baloo Da 2', 'serif', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Helvetica', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana', 'Roboto'],
        fontNamesIgnoreCheck: ['Baloo Da 2', 'serif'],
        fontSizes: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24', '28', '32', '36', '40', '48'],
        dialogsInBody: true,
        followingToolbar: false,
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['height', ['height']],
            ['color', ['color']],       
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']],
        ],
        styleTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        callbacks: {
            onPaste: function(e) {
                var bufferHTML = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('text/html');
                
                if (bufferHTML) {
                    e.preventDefault();
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = bufferHTML;
                    
                    var allElements = tempDiv.querySelectorAll('*');
                    allElements.forEach(function(el) {
                        if (el.style && el.style.fontFamily) {
                            el.style.fontFamily = '';
                        }
                    });
                    
                    var spans = tempDiv.querySelectorAll('span[style=""]');
                    spans.forEach(function(span) {
                        while (span.firstChild) {
                            span.parentNode.insertBefore(span.firstChild, span);
                        }
                        span.parentNode.removeChild(span);
                    });
                    document.execCommand('insertHTML', false, tempDiv.innerHTML);
                }
            },
            onInit: function() {
                $('.note-editable').css('padding', '15px');
                
                // Improve font handling
                $('.note-editable').on('mouseup keyup', function() {
                    setTimeout(function() {
                        $('.note-editing-area p').each(function() {
                            if ($(this).html() === '<br>') {
                                $(this).html('&nbsp;');
                            }
                        });
                    }, 0);
                });
            }
        }
    });
}

$(document).ready(function() {
    initSummernote();
});