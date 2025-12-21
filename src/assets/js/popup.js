/**
 * Extracts transcript entries from the page DOM under the #transcript-container element.
 *
 * @returns {Array<{timestamp: string, speaker: string, text: string}> | null} An array of transcript items or `null` if the transcript container is not found. Each item contains:
 *  - `timestamp`: the timestamp text from the speaker anchor (empty string if absent),
 *  - `speaker`: the cleaned speaker name (colons and surrounding whitespace removed),
 *  - `text`: the joined transcript text for that paragraph.
 */
function scrapeTranscriptFromPage() {
  const transcriptContainer = document.querySelector('#transcript-container');
  if (!transcriptContainer) {
    return null;
  }

  let transcriptData = [];

  transcriptContainer.querySelectorAll('p').forEach((paragraph) => {
    let speakerElement = paragraph.querySelector('[data-speaker=true]');
    let textElements = paragraph.querySelectorAll('span[data-speaker=false]');

    if (speakerElement && textElements.length > 0) {
      // Extract timestamp from the <a> tag
      let timestampElement = speakerElement.querySelector('a');
      let timestamp = timestampElement
        ? timestampElement.textContent.trim()
        : '';

      // Extract speaker name from the generic text content, removing the timestamp
      // We avoid selecting by specific class (like text-base-800) to remain slightly more robust to styling changes
      let fullSpeakerText = speakerElement.textContent.trim();
      let speaker = fullSpeakerText;

      if (timestamp) {
        speaker = fullSpeakerText.replace(timestamp, '').trim();
      }

      // Clean up any leading/trailing colons or whitespace often found in these elements
      speaker = speaker.replace(/^[:\s]+|[:\s]+$/g, '');

      let text = Array.from(textElements)
        .map((span) => span.textContent.trim())
        .join(' ');

      transcriptData.push({ timestamp, speaker, text });
    }
  });

  return transcriptData;
}

/**
 * Orchestrates extracting a transcript from the active tl;dv tab and triggers formatting and output.
 *
 * Executes the in-page scraper on the currently active tab, validates the result, derives a meeting ID
 * from the URL, and passes the transcript data to the formatting/handling routine which either copies
 * the formatted content to the clipboard or starts a file download.
 *
 * @param {('txt'|'md'|'csv')} format - Output format to produce: "txt", "md", or "csv".
 * @param {('copy'|'download')} mode - Action to perform with the formatted output: "copy" to clipboard or "download" as a file.
 */
async function handleTranscriptAction(format, mode) {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      alert('No active tab found');
      return;
    }

    if (!tab.url.includes('tldv.io')) {
      alert('This extension works only on tl;dv');
      return;
    }

    // Execute script
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeTranscriptFromPage,
    });

    const result = injectionResults[0].result;

    if (!result || result.length === 0) {
      alert('No transcript data found');
      return;
    }

    // Extract Meeting ID
    let meetingId = 'unknown';
    const meetingIdMatch = tab.url.match(/\/meetings\/([a-zA-Z0-9]+)/);
    if (meetingIdMatch && meetingIdMatch[1]) {
      meetingId = meetingIdMatch[1];
    }

    processTranscript(result, format, mode, meetingId);
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred: ' + error.message);
  }
}

/**
 * Format transcript items into TXT, Markdown, or CSV and either copy the result to the clipboard or download it as a file.
 *
 * @param {Array<{timestamp?: string, speaker: string, text: string}>} data - Array of transcript entries; each entry may include a `timestamp`, and must include `speaker` and `text`.
 * @param {'txt'|'md'|'csv'} format - Desired output format: 'txt' produces plain lines, 'md' produces Markdown with bold timestamps and italic speakers, 'csv' produces a CSV with header "Timestamp,Speaker,Transcript".
 * @param {'copy'|'download'} mode - Action to perform: 'copy' writes the formatted content to the clipboard, 'download' triggers a file download named using `meetingId`.
 * @param {string} meetingId - Identifier appended to the generated download filename when mode is 'download'.
 * @returns {Promise<void>|undefined} The Promise returned by the clipboard write operation when `mode` is 'copy'; otherwise `undefined`.
 */
function processTranscript(data, format, mode, meetingId) {
  let content = '';

  // Content Collection
  if (format === 'txt') {
    content = data
      .map((item) => {
        const timePart = item.timestamp ? `${item.timestamp} ` : '';
        return `${timePart}${item.speaker} :: ${item.text}`;
      })
      .join('\n');
  } else if (format === 'md') {
    content = data
      .map((item) => {
        const timePart = item.timestamp ? `**${item.timestamp}** ` : '';
        return `${timePart}*${item.speaker}* :: ${item.text}`;
      })
      .join('\n\n');
  } else if (format === 'csv') {
    // CSV Header
    content = 'Timestamp,Speaker,Transcript\n';
    content += data
      .map((item) => {
        // Escape quotes by doubling them, and wrap fields in quotes
        const escape = (text) => `"${(text || '').replace(/"/g, '""')}"`;
        return `${escape(item.timestamp)},${escape(item.speaker)},${escape(item.text)}`;
      })
      .join('\n');
  }

  if (mode === 'copy') {
    return navigator.clipboard.writeText(content).then(() => {
      showStatus(`${format.toUpperCase()} copied to clipboard!`);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      // Fallback for clipboard issues if any
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showStatus(`${format.toUpperCase()} copied to clipboard!`);
    });
  } else if (mode === "download") {
    const filename = `tldv_${meetingId}_meeting_transcript.${format}`;
    let mimeType = 'text/plain';
    if (format === 'md') mimeType = 'text/markdown';
    if (format === 'csv') mimeType = 'text/csv';
    downloadFile(content, filename, mimeType);
    showStatus(`${format.toUpperCase()} downloading...`);
  }
}

function showStatus(msg) {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.textContent = msg;
    // CSS handle the rest via :not(:empty)
    setTimeout(() => {
      statusEl.textContent = "";
    }, 4000);
  } else {
    alert(msg);
  }
}


/**
 * Initiates a browser download of the given content by creating a temporary Blob URL and programmatically clicking a hidden link.
 *
 * @param {string|Blob|ArrayBuffer|Uint8Array} content - The data to save; may be a string, Blob, or binary data (any valid BlobPart).
 * @param {string} filename - The filename to present to the user for the downloaded file.
 * @param {string} mimeType - The MIME type to assign to the created Blob (e.g., "text/plain", "text/csv").
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
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

  attachListener('copy-txt', 'click', () =>
    handleTranscriptAction('txt', 'copy')
  );
  attachListener('download-txt', 'click', () =>
    handleTranscriptAction('txt', 'download')
  );

  attachListener('copy-md', 'click', () =>
    handleTranscriptAction('md', 'copy')
  );
  attachListener('download-md', 'click', () =>
    handleTranscriptAction('md', 'download')
  );

  attachListener('copy-csv', 'click', () =>
    handleTranscriptAction('csv', 'copy')
  );
  attachListener('download-csv', 'click', () =>
    handleTranscriptAction('csv', 'download')
  );

  attachListener('info-toggle', 'click', () => {
    const panel = document.getElementById('info-panel');
    if (panel) panel.classList.toggle('collapsed');
  });
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    scrapeTranscriptFromPage,
    processTranscript,
  };
}