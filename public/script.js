let classes = [];

// Add Class
document.getElementById('addClassForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const className = document.getElementById('className').value;
  if (className) {
    classes.push(className);
    updateClassList();
    updateUploadInputs();
    document.getElementById('className').value = ''; // Clear input
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
  e.preventDefault(); // Prevent the default form submission

  const formData = new FormData(e.target); // Create a FormData object from the form

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData, // Send the FormData object
    });

    if (response.ok) {
      const result = await response.text();
      alert(result); // Show success message
    } else {
      alert('Error uploading files.');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('An error occurred while uploading files.');
  }
});