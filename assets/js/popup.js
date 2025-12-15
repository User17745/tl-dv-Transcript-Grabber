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
async function handleTranscriptAction(format, mode) {
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

    // Extract Meeting ID
    let meetingId = "unknown";
    const meetingIdMatch = tab.url.match(/\/meetings\/([a-zA-Z0-9]+)/);
    if (meetingIdMatch && meetingIdMatch[1]) {
      meetingId = meetingIdMatch[1];
    }

    processTranscript(result, format, mode, meetingId);

  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred: " + error.message);
  }
}

function processTranscript(data, format, mode, meetingId) {
  let content = "";

  // Content Collection
  if (format === "txt") {
    content = data.map(item => {
      const timePart = item.timestamp ? `${item.timestamp} ` : "";
      return `${timePart}${item.speaker} :: ${item.text}`;
    }).join("\n");
  } else if (format === "md") {
    content = data.map(item => {
      const timePart = item.timestamp ? `**${item.timestamp}** ` : "";
      return `${timePart}*${item.speaker}* :: ${item.text}`;
    }).join("\n\n");
  } else if (format === "csv") {
    // CSV Header
    content = "Timestamp,Speaker,Transcript\n";
    content += data.map(item => {
      // Escape quotes by doubling them, and wrap fields in quotes
      const escape = (text) => `"${(text || "").replace(/"/g, '""')}"`;
      return `${escape(item.timestamp)},${escape(item.speaker)},${escape(item.text)}`;
    }).join("\n");
  }

  if (mode === "copy") {
    return navigator.clipboard.writeText(content).then(() => {
      alert(`${format.toUpperCase()} copied to clipboard!`);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      // Fallback for clipboard issues if any
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert(`${format.toUpperCase()} copied to clipboard!`);
    });
  } else if (mode === "download") {
    const filename = `tldv_${meetingId}_meeting_transcript.${format}`;
    let mimeType = 'text/plain';
    if (format === 'md') mimeType = 'text/markdown';
    if (format === 'csv') mimeType = 'text/csv';
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
if (typeof document !== 'undefined') {
  const attachListener = (id, event, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  };

  attachListener("copy-txt", "click", () => handleTranscriptAction("txt", "copy"));
  attachListener("download-txt", "click", () => handleTranscriptAction("txt", "download"));

  attachListener("copy-md", "click", () => handleTranscriptAction("md", "copy"));
  attachListener("download-md", "click", () => handleTranscriptAction("md", "download"));

  attachListener("copy-csv", "click", () => handleTranscriptAction("csv", "copy"));
  attachListener("download-csv", "click", () => handleTranscriptAction("csv", "download"));
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    scrapeTranscriptFromPage,
    processTranscript
  };
}
