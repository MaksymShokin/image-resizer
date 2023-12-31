// Some JavaScript to load the image and show the form. There is no actual backend functionality. This is just the UI

const form = document.querySelector('#img-form');
const outputPath = document.querySelector('#output-path');

const widthInput = document.querySelector('#width');
const heightInput = document.querySelector('#height');
const img = document.querySelector('#img');

function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError('Please select an image file');
    return;
  }

  // Get original dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = 'block';
  document.querySelector('#filename').innerHTML = file.name;
  outputPath.innerHTML = path.join(os.homedir(), 'imageresizer');
}

function isFileImage(file) {
  const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  return file && acceptedImageTypes.includes(file['type']);
}

function sendImageToMain(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;

  if (!img.files[0]) {
    alertError('Please provide image');
    return;
  }

  const imagePath = img.files[0].path;

  if (!width || !height) {
    alertError('Please provide dimensions');
    return;
  }

  // send to main using IPC renderer
  ipcRenderer.send('image:resize', {
    imagePath,
    width,
    height
  });
}

// catch image done event
ipcRenderer.on('image:done', () => {
  alertSuccess('Image resized');
});

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center'
    }
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center'
    }
  });
}

document.querySelector('#img').addEventListener('change', loadImage);
form.addEventListener('submit', sendImageToMain);
