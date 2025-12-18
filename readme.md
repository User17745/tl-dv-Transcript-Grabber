# tl;dv Transcript Grabber Chrome Extension

## Overview

A simple Chrome extension designed to extract and copy transcripts from online meeting recordings, specifically on the **tl;dv** platform. It allows users to easily retrieve text from transcripts that are otherwise difficult to copy manually.

## Features

- Extracts speaker names, timestamps, and text from tl;dv meeting pages.
- Supports multiple formats: **TXT**, **Markdown (MD)**, and **CSV**.
- Provides options to either **Copy** to clipboard or **Download** as a file for each format.

## Installation

### Option 1: Chrome Web Store (Recommended)

[**Install from Chrome Web Store**](https://chromewebstore.google.com/detail/tldv-transcript-grabber/imdeigjlcophdhdfhebkgaliacabkhmc)

### Option 2: Manual Installation

1. Clone or download this repository to your local machine.
2. Go to `chrome://extensions/` in your browser.
3. Enable **Developer Mode** in the top right corner.
4. Click on **Load unpacked** and select the folder where you saved this project.
5. The Transcript Scraper extension will now appear in your Chrome toolbar.

## Usage

1. Navigate to a tl;dv meeting recording page.
2. Click on the **Transcript Scraper** extension icon.
3. Choose your desired format (TXT, MD, CSV) and click either **Copy** or **Download**.
4. The transcript will be processed accordingly, and you will see a confirmation message.

## File Structure

```
tl-dv-Transcript-Grabber/
├── assets/
├──── css/
├────── popup.css       // Popup Styling
├──── icons/
├────── icon16.png
├────── icon48.png
├────── icon128.png
├──── js/
├────── popup.js        // Main logic for extracting transcript
├── manifest.json       // Chrome extension configuration
├── popup.html          // Popup UI
```

## Technologies Used

- JavaScript (Vanilla)
- HTML/CSS for the popup UI
- Chrome Extension Manifest V3

## Permissions Required

- `activeTab`: To access the active tab content.
- `scripting`: To inject JavaScript into the webpage.
- `clipboardWrite`: To copy the transcript to the clipboard.

## Contributing

Feel free to fork this project, make improvements, and create pull requests. Any contributions are welcome!

## Credit

<a href="https://www.flaticon.com/free-icons/transcription" title="Flaticon transcription icons" target="_blank">Transcription icons created by Freepik - Flaticon</a>

## License

This project is licensed under GNU GENERAL PUBLIC LICENSE Version 3.

## Contact & Support

- **Report Bugs**: [GitHub Issues](https://github.com/User17745/tl-dv-Transcript-Grabber/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/User17745/tl-dv-Transcript-Grabber/discussions)
- **Reach out**: [X/Twitter](https://x.com/InuMeo) | [LinkedIn](https://www.linkedin.com/in/abhishek-aggarwal-8bb82b100/)
- **Rate the Extension**: [Chrome Web Store](https://chromewebstore.google.com/detail/tldv-transcript-grabber/imdeigjlcophdhdfhebkgaliacabkhmc)

## Privacy Policy

[Read Privacy Policy](https://user17745.github.io/tl-dv-Transcript-Grabber/privacy-policy)
