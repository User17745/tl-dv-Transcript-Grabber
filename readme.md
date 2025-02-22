# tl;dv Transcript Grabber Chrome Extension

## Overview
A simple Chrome extension designed to extract and copy transcripts from online meeting recordings, specifically on the **tl;dv** platform. It allows users to easily retrieve text from transcripts that are otherwise difficult to copy manually.

## Features
- Extracts speaker names and text and timestamp from the transcript container on tl;dv meeting pages.
- Copies the formatted transcript directly to the clipboard for easy pasting.

## Installation
1. Clone or download this repository to your local machine.
2. Go to `chrome://extensions/` in your browser.
3. Enable **Developer Mode** in the top right corner.
4. Click on **Load unpacked** and select the folder where you saved this project.
5. The Transcript Scraper extension will now appear in your Chrome toolbar.

## Usage
1. Navigate to a tl;dv meeting recording page.
2. Click on the **Transcript Scraper** extension icon.
3. Click on the **Copy Transcript** button in the popup.
4. The transcript will be copied to your clipboard, and you will see a confirmation message.

## File Structure
```
transcript-scraper/
├── manifest.json       // Chrome extension configuration
├── popup.html          // Popup UI
└── popup.js            // Main logic for extracting transcript
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
<a href="https://www.flaticon.com/free-icons/transcription" title="transcription icons">Transcription icons created by Freepik - Flaticon</a>

## License
This project is licensed under GNU GENERAL PUBLIC LICENSE Version 3.

## Contact
For any issues or feature requests, please open an issue on the GitHub repository.