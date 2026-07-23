
// ==================== CROSS BUTTON ON FILE START ====================

// Note-1: Add class on file type inpute which class name will be "file".
// Note-2: Add an Id with that file type input which have "file" class. Id name can be any
// Note-2: Add a div or any tag to PREVIEW this file. Add an Id name to this previewer and Id name must need to be related with file type input's Id name and add extra text with it like "-preview". For Example: File type inpout'ss Id name "file-input" & previewer Id name will be "file-input-preview". 
// Note-2: Add a "preview" class to previewer div. it mendetarory for video or audio type file only if those toggle with disable or "d-none" class.

$(function () {

    // START FILE PROCESSING BY CREATING WRAP DIV START 
    $('.file').wrap('<div class="file-wrapper"></div>');
    $('.file').closest(".file-wrapper").append('<button type="button" class="cross_btn">x</button>');
    // START FILE PROCESSING BY CREATING WRAP DIV END 

    // ===============================================================================

    // CLEAR INPUT FILE ON CROSS BUTTON CLICK START
    $(document).ready(function () {
        var storedFileJson = localStorage.getItem("fileStoredId");
        if (storedFileJson) {
            fileStoredId = JSON.parse(storedFileJson);
            fileStoredId.forEach(function (id) {
                $("input#" + id).val('').closest(".file-wrapper").addClass('hidden-cross');
            });
        } else {
            console.log("No stored file type input IDs found.");
        }
        // localStorage.removeItem("fileStoredId");
    });

    var fileStoredId = [];
    $(".file-wrapper .cross_btn").on('click', function () {
        // Reset the file input value to empty
        var fileWrapper = $(this).closest('.file-wrapper');
        var fileInput = fileWrapper.find('input.file');
        var filePreview = fileInput.attr('id') + '-preview';
        fileInput.val('');
        fileInput.trigger('change');

        $('.file').each(function() {
            fileStoredId.push(fileInput.attr('id'));
        });
        var storedFileJson = JSON.stringify(fileStoredId);
        localStorage.setItem("fileStoredId", storedFileJson);

        // Check if the file input value is empty
        if (fileInput.val() === '') {
            fileWrapper.addClass('hidden-cross');
            $("#" + filePreview).empty();
        }
    });
    // CLEAR INPUT FILE ON CROSS BUTTON CLICK END

    // ===============================================================================

    // INITIALLY ADD OR HIDE CROSS BUTTON BASED ON DISABLED INPUT OR D-NONE CLASS START
    $('.file').each(function() {

        if ($(this).hasClass('d-none') || $(this).is(':disabled')) {
            $(this).closest(".file-wrapper").addClass('hidden-cross');
        } else {
            if ($(this).val() === '') {
                $(this).closest(".file-wrapper").addClass('hidden-cross');
            }else{
                $(this).closest(".file-wrapper").removeClass('hidden-cross');
            }
        }

    });
    // INITIALLY ADD OR HIDE CROSS BUTTON BASED ON DISABLED INPUT OR D-NONE CLASS END

    // ===============================================================================

    // ON FILE LOAD ADD OR HIDE CROSS BUTTON BASED ON DISABLED INPUT OR D-NONE CLASS START
    function saveFileStoredId() {
        var storedFileJson = JSON.stringify(fileStoredId);
        localStorage.setItem("fileStoredId", storedFileJson);
    }
    function handleFileInputChange() {
        var fileInput = $(this);
        var idToRemove = fileInput.attr('id');

        if (fileInput.val() === '') {
            $(this).closest(".file-wrapper").addClass('hidden-cross');
        } else {
            $(this).closest(".file-wrapper").removeClass('hidden-cross');
        }
        
        while ((indexToRemove = fileStoredId.indexOf(idToRemove)) !== -1) {
            fileStoredId.splice(indexToRemove, 1);
            saveFileStoredId();
        }
    }
    $(".file").on('change', handleFileInputChange);
    // ON FILE LOAD ADD OR HIDE CROSS BUTTON BASED ON DISABLED INPUT OR D-NONE CLASS END

    // ===============================================================================

    // ON SELECT INPUT CHANGE, ADD/HIDE CROSS BUTTON BASED ON DISABLED INPUT/D-NONE CLASS, SHOW/HIDE PREVIEW, PAUSE VIDEO/AUDIO START
    $("select").on('change', function () { //specially for, if file preview dependent on any select option to show/hide.

        $('.file').each(function() {
            var id = $(this).attr('id');
            var input = $("#"+id);
            var previewId = input.attr('id')+'-preview';
            var filePreview = $("#"+previewId);

            if ($(this).hasClass('d-none') || $(this).is(':disabled')) {
                $(this).closest(".file-wrapper").addClass('hidden-cross');
                
                filePreview.addClass("d-none");
            } else {
                if ($(this).val() != '') {
                    $(this).closest(".file-wrapper").removeClass('hidden-cross');

                    filePreview.removeClass("d-none");
                }
            }

        });

        if ($(".preview").hasClass('d-none')){
            $(".preview video, .preview audio").each(function() {
                this.pause();
            });
        }
        
    });
    // ON SELECT INPUT CHANGE, ADD/HIDE CROSS BUTTON BASED ON DISABLED INPUT/D-NONE CLASS, SHOW/HIDE PREVIEW, PAUSE VIDEO/AUDIO START

});
// ==================== CROSS BUTTON ON FILE END ====================


// ==================== PREVIEW FILE PROCESSING START ====================

function previewFile(input){ // Single Image Preview Start (as demo, no needed here)
    var file = $("#image").get(0).files[0];

    if(file){
        var reader = new FileReader();
        reader.onload = function(){
            $("#PreviewImage").attr("src", reader.result);
            $("#PreviewImage").removeClass("d-none");
        }

        reader.readAsDataURL(file);
    }
} // Single Image Preview End (as demo, no needed here)

$(function () { // Multiple Files Preview Start

    function previewFiles(input, filePreview) {
        // var fileInputId = input.attr('id');
        // alert(fileInputId);

        var responsiveClasses = filePreview.attr('responsive');
        var ratio = filePreview.attr('ratio');
        var margin = filePreview.attr('margin');

        var files = $(input).get(0).files;
        filePreview.empty();

        var row = $("<div>").addClass("row");

        for (var i = 0; i < files.length; i++) {

            var file = files[i];
            var reader = new FileReader();
            reader.onload = function(e) {
                var fileType = file.type;
                var previewElement;

                var col = $("<div>").addClass(responsiveClasses).addClass(margin);

                if (fileType.indexOf("image") !== -1) {
                    // Image file
                    previewElement = $("<img>")
                    .attr("src", e.target.result)
                    .addClass("preview-image");
                } else if (fileType.indexOf("video") !== -1) {
                    // Video file
                    previewElement = $("<video controls>")
                    // .attr("src", e.target.result)
                    .addClass("preview-video");

                    // Create a source element for each video format
                    var videoFormats = {
                        mp4: 'video/mp4',
                        webm: 'video/webm',
                        ogg: 'video/ogg',
                        mov: 'video/quicktime'
                    };

                    for (var format in videoFormats) {
                        if (fileType.indexOf(format) !== -1) {
                            var sourceElement = $("<source>").attr("src", e.target.result).attr("type", videoFormats[format]);
                            previewElement.append(sourceElement);
                        }
                    }

                } else if (fileType.indexOf("audio") !== -1) {
                    // Audio file
                    previewElement = $("<audio controls>")
                        .attr("src", e.target.result)
                        .addClass("preview-audio")
                        .css({
                            'z-index': '9',
                        });
                    
                    var imgElement = $("<img>")
                    .addClass("")
                    .css({
                        "object-fit": "cover",
                        "width": "100%"
                    })
                    .attr("src", 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSdh0A7nYrg5YkFIU6EGrINX1889Pbu_p4AieTufdfGJ2bYrJ4gFA6Ad3odoy7nOBMYs8&usqp=CAU');

                    // Wait for the audio element to be added to the DOM, then append the <img> element
                    previewElement.on("loadedmetadata", function() {
                        $(this).parent().append(imgElement);
                    });

                } else if (fileType.indexOf("pdf") !== -1) {
                    // PDF file
                    previewElement = $("<iframe>")
                    .attr("src", e.target.result)
                    .addClass("preview-pdf");
                }

                if (ratio) {
                    var frameRatio = $("<div>").addClass("ratio ratio-" + ratio).addClass("rounded bg-dark overflow-hidden");
                    frameRatio.append(previewElement).find("*")
                    .css({
                        "object-fit": "scale-down",
                        "width": "100%",
                    });
                    
                    col.append(frameRatio);
                }else{
                    col.append(previewElement).find('*').addClass('rounded w-100');;
                }
                
                row.append(col);

            };
            reader.readAsDataURL(file);
        }
        
        filePreview.append(row); // Append the row to the filePreview container
    }


    // INITILIZE FILE PREVIEW START 
    function initializeFilePreview(input) {

        var id = input.attr('id');
        var filePreview = $(".preview[preview-for-id='"+id+"']");
        previewFiles(input, filePreview);
        
        filePreview.toggleClass("d-none", input.hasClass('d-none') || input.is(':disabled'));

        var fileView = $(".view[view-for-id='"+id+"']");
        if (input.prop('files').length > 0) {
            $(fileView).addClass("d-none");
        }else{
            $(fileView).removeClass("d-none");
        }
        
    }

    $(document).ready(function() {
        $('.file').each(function() {
            initializeFilePreview($(this));
        });

        $(".file").on("change", function() {
            initializeFilePreview($(this));
        });
    });
    // INITILIZE FILE PREVIEW END

}); // Multiple Files Preview End

// ==================== PREVIEW FILE PROCESSING END ====================
