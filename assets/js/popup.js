// Function to scrape transcript from the page
function scrapeTranscriptFromPage() {
  const transcriptContainer = document.querySelector("#transcript-container");
  if (!transcriptContainer) {
    return null;
  }

  let transcriptData = [];

  transcriptContainer.querySelectorAll("p").forEach((paragraph) => {
    let speakerElement = paragraph.querySelector("[data-speaker=true]");
    let textElements = paragraph.querySelectorAll("span[data-speaker=false]");

    if (speakerElement && textElements.length > 0) {
      // Extract timestamp from the <a> tag
      let timestampElement = speakerElement.querySelector("a");
      let timestamp = timestampElement ? timestampElement.textContent.trim() : "";

      // Extract speaker name from the generic text content, removing the timestamp
      // We avoid selecting by specific class (like text-base-800) to remain slightly more robust to styling changes
      let fullSpeakerText = speakerElement.textContent.trim();
      let speaker = fullSpeakerText;

      if (timestamp) {
        speaker = fullSpeakerText.replace(timestamp, "").trim();
      }

      // Clean up any leading/trailing colons or whitespace often found in these elements
      speaker = speaker.replace(/^[:\s]+|[:\s]+$/g, "");

      let text = Array.from(textElements)
        .map((span) => span.textContent.trim())
        .join(" ");

      transcriptData.push({ timestamp, speaker, text });
    }
  });

  return transcriptData;
}

// Function to handle the extraction and action
async function handleTranscriptAction(action) {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      alert("No active tab found");
      return;
    }

    if (!tab.url.includes("tldv.io")) {
      alert("This extension works only on tl;dv");
      return;
    }

    // Execute script
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeTranscriptFromPage,
    });

    const result = injectionResults[0].result;

    if (!result || result.length === 0) {
      alert("No transcript data found");
      return;
    }

    processTranscript(result, action);

  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred: " + error.message);
  }
}

function processTranscript(data, action) {
  let content = "";

  if (action === "copy" || action === "txt") {
    content = data.map(item => {
      const timePart = item.timestamp ? `${item.timestamp} ` : "";
      return `${timePart}${item.speaker}: ${item.text}`;
    }).join("\n");
  } else if (action === "md") {
    content = data.map(item => {
      const timePart = item.timestamp ? `**${item.timestamp}** ` : "";
      return `${timePart}*${item.speaker}* :: ${item.text}`;
    }).join("\n\n");
  }

  if (action === "copy") {
    navigator.clipboard.writeText(content).then(() => {
      alert("Transcript copied to clipboard!");
    }).catch(err => {
      console.error('Could not copy text: ', err);
      // Fallback for clipboard issues if any
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Transcript copied to clipboard!");
    });
  } else if (action === "txt" || action === "md") {
    const filename = `transcript.${action}`;
    const mimeType = action === 'md' ? 'text/markdown' : 'text/plain';
    downloadFile(content, filename, mimeType);
  }
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event Listeners
document.getElementById("scrape-transcript").addEventListener("click", () => handleTranscriptAction("copy"));
document.getElementById("download-txt").addEventListener("click", () => handleTranscriptAction("txt"));
document.getElementById("download-md").addEventListener("click", () => handleTranscriptAction("md"));
