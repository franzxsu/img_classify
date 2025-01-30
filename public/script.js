let classes = [];

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


function updateClassList() {
  const classList = document.getElementById('classList');
  classList.innerHTML = `<h5>Classes:</h5><ul>${classes.map(cls => `<li>${cls}</li>`).join('')}</ul>`;
}

function updateUploadInputs() {
  const uploadInputs = document.getElementById('uploadInputs');
  uploadInputs.innerHTML = classes.map(cls => `
    <div class="mb-3">
      <label for="${cls}" class="form-label">Upload images for ${cls}</label>
      <input type="file" name="images" multiple class="form-control">
    </div>
  `).join('');
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.text();
      alert(result);
    } else {
      alert('error uploading files');
    }
  } catch (err) {
    console.error('err:', err);
    alert('error occurred! '+err);
  }
});