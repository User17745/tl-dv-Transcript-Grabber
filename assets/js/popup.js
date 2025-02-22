document.getElementById("scrape-transcript").addEventListener("click", async () => {
  try {
    // Query the active tab in the current window
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      alert("No active tab found");
      return;
    }

    // Check if the tab URL is from the tl;dv domain
    if (!tab.url.includes("tldv.io")) {
      alert("This extension works only on tl;dv");
      return;
    }

    // Execute the script in the context of the active tab
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        // Select the transcript container element by its ID
        (function () {
          let transcriptContainer = document.querySelector("#transcript-container");
          if (!transcriptContainer) {
            console.log("Transcript container not found!");
            alert("No transcript data found");
            return;
          }

          let transcriptData = [];

          // Iterate over each paragraph in the transcript container
          transcriptContainer.querySelectorAll("p").forEach((paragraph) => {
            // Find the speaker element and text elements within the paragraph
            let speakerElement = paragraph.querySelector("[data-speaker=true]");
            let textElements = paragraph.querySelectorAll("span[data-speaker=false]");

            // If both speaker and text elements are found, process them
            if (speakerElement && textElements.length > 0) {
              let speaker = speakerElement.textContent.trim();
              let text = Array.from(textElements)
                .map((span) => span.textContent.trim())
                .join(" ");
              // Add the speaker and text to the transcript data
              transcriptData.push(`${speaker}: ${text}`);
            }
          });

          if (transcriptData.length > 0) {
            console.log("Extracted Transcript:\n\n" + transcriptData.join("\n"));
            copyToClipboard(transcriptData.join("\n"));
            alert("Transcript copied to clipboard!");
          } else {
            console.log("No transcript data found.");
            alert("No transcript data found");
          }

          function copyToClipboard(text) {
            let textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
          }
        })();
      },
    });
  } catch (error) {
    console.error("Failed to copy transcript:", error);
    if (error.message.includes("permissions")) {
      alert("Required permission not granted");
    } else {
      alert("Clipboard access denied. Please allow clipboard permissions.");
    }
  }
});
