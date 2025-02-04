let classes = [];

// Add Class
document.getElementById('addClassForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const className = document.getElementById('className').value;
    if (className) {
        classes.push(className);
        updateClassList();
        updateUploadInputs();
        document.getElementById('className').value = '';
    }
});

// Update Class List
function updateClassList() {
    const classList = document.getElementById('classList');
    classList.innerHTML = `<h5>Classes:</h5><ul>${classes.map(cls => `<li>${cls}</li>`).join('')}</ul>`;
}

// Update Upload Inputs
function updateUploadInputs() {
    const uploadInputs = document.getElementById('uploadInputs');
    uploadInputs.innerHTML = classes.map(cls => `
      <div class="mb-3">
        <label for="${cls}" class="form-label">Upload images for ${cls}</label>
        <input type="file" name="${cls}" multiple class="form-control">
      </div>
    `).join('');
}

// Handle File Upload
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.text(); // This will now contain the bucket name
            alert(`Files uploaded to: ${result}`); // Show success message with bucket name

            // Store the bucket name somewhere if you need it later (e.g., in a hidden input field, local storage, or a variable)
            const bucketName = result; // Assuming the server sends just the bucket name back
            console.log("Bucket Name:", bucketName); // Use the bucket name as needed

        } else {
            const errorText = await response.text(); // Get the error message from the server
            alert(`Error uploading files: ${errorText}`); // Show error message from the server
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while uploading files.');
    }
});