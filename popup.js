document.getElementById("scrape-transcript").addEventListener("click", () => {
    chrome.scripting.executeScript({
      target: { tabId: chrome.tabs.TAB_ID_CURRENT },
      function: scrapeTranscript
    }, (results) => {
      if (chrome.runtime.lastError) {
        document.getElementById("status").innerText = "Error: " + chrome.runtime.lastError.message;
      } else {
        document.getElementById("status").innerText = "Transcript copied to clipboard!";
      }
    });
  });
  
  // Function that runs on the webpage to extract and copy the transcript
  function scrapeTranscript() {
    let transcriptContainer = document.querySelector("#transcript-container");
    if (!transcriptContainer) {
      alert("Transcript container not found!");
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
        alert("Transcript copied to clipboard!");
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    } else {
      alert("No transcript data found.");
    }
  }  