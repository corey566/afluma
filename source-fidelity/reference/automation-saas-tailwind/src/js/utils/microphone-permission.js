// Microphone Permission Handler
const MicPermissionHandler = () => {
  if (!navigator.mediaDevices?.getUserMedia) return;

  const micButtons = document.querySelectorAll("[data-mic-button]");

  if (!micButtons.length) return;

  const requestMicPermission = async (button) => {
    try {
      // Request microphone access - browser will show native permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Permission granted - stop the stream (we just needed permission)
      stream.getTracks().forEach((track) => track.stop());

      // Add success class for styling if needed
      button.classList.add("mic-permission-granted");
      button.dispatchEvent(new CustomEvent("micPermissionGranted"));

      console.log("Microphone access granted");
    } catch (error) {
      // Permission denied or error occurred
      button.classList.add("mic-permission-denied");
      button.dispatchEvent(
        new CustomEvent("micPermissionDenied", { detail: error }),
      );
      console.error("Microphone access error:", error);
    }
  };

  // Attach click handler to all mic buttons
  micButtons.forEach((button) => {
    // Check if handler already attached
    if (button.dataset.micHandlerAttached === "true") return;

    button.dataset.micHandlerAttached = "true";
    button.addEventListener("click", () => requestMicPermission(button));
  });
};

document.addEventListener("DOMContentLoaded", () => {
  MicPermissionHandler();
});
