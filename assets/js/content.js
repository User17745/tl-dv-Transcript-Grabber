chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "copyTranscript") {
      try {
        let transcriptContainer = document.querySelector("#transcript-container");
        if (!transcriptContainer) {
          sendResponse({ message: "Transcript container not found." });
          return;
        }
  
        let transcriptData = [];
        transcriptContainer.querySelectorAll("p").forEach(paragraph => {
          let speakerElement = paragraph.querySelector("[data-speaker=true]");
          let textElements = paragraph.querySelectorAll("span[data-speaker=false]");
          if (speakerElement && textElements.length > 0) {
            let speaker = speakerElement.innerText.trim();
            let text = Array.from(textElements).map(span => span.innerText.trim()).join(" ");
            transcriptData.push(`${speaker}: ${text}`);
          }
        });
  
        if (transcriptData.length > 0) {
          navigator.clipboard.writeText(transcriptData.join("\n")).then(() => {
            sendResponse({ message: "Transcript copied to clipboard!" });
          }).catch(err => {
            sendResponse({ message: "Clipboard access denied. Please allow clipboard permissions." });
            console.error("Failed to copy text: ", err);
          });
        } else {
          sendResponse({ message: "No transcript data found." });
        }
      } catch (error) {
        console.error("An error occurred: ", error);
        sendResponse({ message: "An unexpected error occurred. Check console for details." });
      }
      return true; // Required for async sendResponse
    }
  });