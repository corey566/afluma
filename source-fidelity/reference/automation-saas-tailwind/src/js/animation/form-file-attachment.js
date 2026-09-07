const FileUploadHandler = () => {
  const fileUploadContainers = document.querySelectorAll('[data-file-upload]');

  if (!fileUploadContainers.length) return;

  const initFileUpload = (container) => {
    // Skip if already initialized
    if (container.dataset.fileUploadInitialized === 'true') return;
    container.dataset.fileUploadInitialized = 'true';

    const fileInput = container.querySelector('input[type="file"]');
    const fileIcon = container.querySelector('[data-file-upload-icon]');
    const fileNameWrapper = container.querySelector('[data-file-upload-filename]');
    const fileName = container.querySelector('[data-file-upload-name]');
    const removeButton = container.querySelector('[data-file-upload-remove]');

    if (!fileInput || !fileIcon || !fileNameWrapper || !fileName || !removeButton) return;

    // Handle file selection
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Set filename
      fileName.textContent = file.name;

      fileIcon.classList.add('hidden');
      fileNameWrapper.classList.remove('hidden');
      fileNameWrapper.classList.add('flex');
      container.classList.remove('size-9', 'min-w-9');
      container.classList.add('h-9', 'min-w-fit');

      // Get natural width and animate
      const finalWidth = container.offsetWidth;
      gsap.fromTo(
        container,
        { width: '36px' },
        { width: finalWidth, duration: 0.3, ease: 'linear' }
      );

      gsap.fromTo(
        fileNameWrapper,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' }
      );
    };

    // Handle file removal
    const handleFileRemove = (event) => {
      event.preventDefault();
      event.stopPropagation();

      gsap.to(fileNameWrapper, {
        opacity: 0,
        x: -10,
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          fileNameWrapper.classList.add('hidden');
          fileNameWrapper.classList.remove('flex');
          fileIcon.classList.remove('hidden');
          fileInput.value = '';

          // Animate label width back
          gsap.to(container, {
            width: '36px',
            duration: 0.3,
            ease: 'power3.out',
            onComplete: () => {
              container.classList.remove('h-9', 'min-w-fit');
              container.classList.add('size-9', 'min-w-9');
              gsap.set(container, { clearProps: 'width' });
            },
          });

          // Animate icon in
          gsap.fromTo(
            fileIcon,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' }
          );
        },
      });
    };

    fileInput.addEventListener('change', handleFileSelect);
    removeButton.addEventListener('click', handleFileRemove);
  };

  fileUploadContainers.forEach(initFileUpload);
};

document.addEventListener('DOMContentLoaded', () => {
  FileUploadHandler();
});
