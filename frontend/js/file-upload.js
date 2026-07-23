// File Upload Handler
class FileUploadHandler {
    constructor(options = {}) {
        this.options = {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'],
            ...options
        };
    }

    // Initialize file upload for a specific question
    init(questionId) {
        const input = document.querySelector(`input[name="answer_${questionId}_files[]"]`);
        const previewDiv = document.getElementById(`preview-div-${questionId}`);
        const showDiv = document.getElementById(`show-div-${questionId}`);

        if (!input || !previewDiv || !showDiv) return;

        // Clear any existing event listeners
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        // Add change event listener
        newInput.addEventListener('change', (e) => this.handleFileSelect(e, questionId));
        
        // Add click event listener for remove buttons in show area
        showDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-file-btn')) {
                this.handleFileRemove(e, questionId);
            }
        });
    }

    // Handle file selection
    async handleFileSelect(event, questionId) {
        const files = Array.from(event.target.files);
        const previewDiv = document.getElementById(`preview-div-${questionId}`);
        const showDiv = document.getElementById(`show-div-${questionId}`);
        const form = event.target.closest('.question-form');

        // Clear preview area
        previewDiv.innerHTML = '';

        // Validate files
        const validFiles = files.filter(file => {
            if (!this.options.allowedTypes.includes(file.type)) {
                this.showToast('Invalid file type: ' + file.name, 'error');
                return false;
            }
            if (file.size > this.options.maxFileSize) {
                this.showToast('File too large: ' + file.name, 'error');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            event.target.value = '';
            return;
        }

        // Show preview
        this.renderPreview(validFiles, previewDiv);

        // Upload files
        try {
            const formData = new FormData(form);
            formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);
            formData.append('question_id', questionId);
            validFiles.forEach(file => formData.append('files[]', file));

            const response = await fetch('/upload-files', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Clear preview and update show area
                previewDiv.innerHTML = '';
                this.renderUploadedFiles(result.files, showDiv);
                event.target.value = '';
                this.showToast('Files uploaded successfully', 'success');
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
            previewDiv.innerHTML = '';
        }
    }

    // Handle file removal
    async handleFileRemove(event, questionId) {
        const fileId = event.target.getAttribute('data-file-id');
        const form = event.target.closest('.question-form');
        const showDiv = document.getElementById(`show-div-${questionId}`);

        try {
            const response = await fetch('/remove-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    file_id: fileId,
                    question_id: questionId
                })
            });

            const result = await response.json();

            if (result.success) {
                // Remove file from show area
                const fileItem = event.target.closest('.file-item');
                fileItem.remove();
                this.showToast('File removed successfully', 'success');
            } else {
                throw new Error(result.message || 'Failed to remove file');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    // Render preview of selected files
    renderPreview(files, previewDiv) {
        files.forEach((file, idx) => {
            const item = document.createElement('div');
            item.className = 'file-item';
            
            let previewContent;
            if (file.type.startsWith('image/')) {
                previewContent = `<img class="file-thumb" src="${URL.createObjectURL(file)}" alt="preview">`;
            } else {
                previewContent = `<div class="file-icon"><i class="fas fa-file"></i></div>`;
            }

            item.innerHTML = `
                ${previewContent}
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${(file.size/1024).toFixed(2)} KB</div>
                </div>
                <span class="file-type">${file.type || 'Unknown'}</span>
                <button type="button" class="remove-file-btn" data-preview-idx="${idx}">&times;</button>
            `;

            previewDiv.appendChild(item);
        });

        // Add remove functionality for preview items
        previewDiv.querySelectorAll('.remove-file-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-preview-idx'));
                files.splice(idx, 1);
                this.renderPreview(files, previewDiv);
            });
        });
    }

    // Render uploaded files in show area
    renderUploadedFiles(files, showDiv) {
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';
            
            let previewContent;
            if (file.type.startsWith('image/')) {
                previewContent = `<img class="file-thumb" src="/${file.path}" alt="preview">`;
            } else {
                previewContent = `<div class="file-icon"><i class="fas fa-file"></i></div>`;
            }

            item.innerHTML = `
                ${previewContent}
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${(file.size/1024).toFixed(2)} KB</div>
                </div>
                <span class="file-type">${file.type || 'Unknown'}</span>
                <a href="/storage/${file.path}" target="_blank" class="btn btn-sm btn-outline-primary ms-2">Download</a>
                <button type="button" class="remove-file-btn" data-file-id="${file.id}">&times;</button>
            `;

            showDiv.appendChild(item);
        });
    }

    // Show toast notification
    showToast(message, type = 'info') {
        // You can implement your preferred toast notification system here
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Initialize file upload handlers for all questions
document.addEventListener('DOMContentLoaded', function() {
    const fileUploadHandler = new FileUploadHandler();
    document.querySelectorAll('.question-form').forEach(form => {
        const questionId = form.dataset.questionId;
        if (questionId) {
            fileUploadHandler.init(questionId);
        }
    });
}); 