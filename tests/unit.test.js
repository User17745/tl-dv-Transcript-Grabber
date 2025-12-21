/** @jest-environment jsdom */
const { chrome } = require('jest-chrome');
const {
  processTranscript,
  scrapeTranscriptFromPage,
} = require('../src/assets/js/popup.js');

describe('Summary Generator Unit Tests', () => {
  // Mock Browser APIs
  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(),
      },
      configurable: true,
    });

    global.alert = jest.fn();
    global.console.log = jest.fn();
    global.console.error = jest.fn();

    // Mock URL and Blob for download tests
    global.URL.createObjectURL = jest.fn((blob) => `mock_url_for_${blob.size}`);
    global.URL.revokeObjectURL = jest.fn();

    // Mock DOM elements for download link click
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = ''; // Clean DOM
  });

  describe('scrapeTranscriptFromPage', () => {
    test('should return null if transcript container is missing', () => {
      document.body.innerHTML = '<div></div>';
      const result = scrapeTranscriptFromPage();
      expect(result).toBeNull();
    });

    test('should extract speaker, timestamp, and text correctly', () => {
      document.body.innerHTML = `
                <div id="transcript-container">
                    <p>
                        <span data-speaker="true"><a href="#">05:05</a> Speaker Name</span>
                        <span data-speaker="false">Hello</span>
                        <span data-speaker="false">World</span>
                    </p>
                </div>
            `;

      const result = scrapeTranscriptFromPage();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        timestamp: '05:05',
        speaker: 'Speaker Name',
        text: 'Hello World',
      });
    });

    test('should handle speaker name without timestamp cleanly', () => {
      document.body.innerHTML = `
                <div id="transcript-container">
                    <p>
                        <span data-speaker="true">Just Speaker</span>
                        <span data-speaker="false">Text line</span>
                    </p>
                </div>
            `;

      const result = scrapeTranscriptFromPage();

      expect(result[0]).toEqual({
        timestamp: '',
        speaker: 'Just Speaker',
        text: 'Text line',
      });
    });

    test('should handle missing text spans gracefully', () => {
      document.body.innerHTML = `
                <div id="transcript-container">
                    <p>
                        <span data-speaker="true"><a href="#">01:00</a> Alice</span>
                    </p>
                </div>
            `;
      const result = scrapeTranscriptFromPage();
      expect(result).toHaveLength(0);
    });

    test('should clean up speaker name with colons and extra whitespace', () => {
      document.body.innerHTML = `
                <div id="transcript-container">
                    <p>
                        <span data-speaker="true"><a href="#">02:00</a> : Bob : </span>
                        <span data-speaker="false">Message</span>
                    </p>
                </div>
            `;
      const result = scrapeTranscriptFromPage();
      expect(result[0].speaker).toBe('Bob');
    });

    test('should handle multiple speakers/paragraphs', () => {
      document.body.innerHTML = `
                <div id="transcript-container">
                    <p>
                        <span data-speaker="true"><a href="#">00:01</a> Alice</span>
                        <span data-speaker="false">Hi</span>
                    </p>
                    <p>
                        <span data-speaker="true"><a href="#">00:02</a> Bob</span>
                        <span data-speaker="false">Hey</span>
                    </p>
                </div>
            `;
      const result = scrapeTranscriptFromPage();
      expect(result).toHaveLength(2);
      expect(result[0].speaker).toBe('Alice');
      expect(result[1].speaker).toBe('Bob');
    });
  });

  describe('processTranscript', () => {
    const mockData = [
      { timestamp: '10:00', speaker: 'Alice', text: 'Hi there.' },
      { timestamp: '10:01', speaker: 'Bob', text: 'Hello Alice.' },
    ];

    test('should copy correctly formatted TXT to clipboard', async () => {
      await processTranscript(mockData, 'txt', 'copy', '123');

      const expectedContent =
        '10:00 Alice :: Hi there.\n10:01 Bob :: Hello Alice.';
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expectedContent
      );
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('TXT copied'));
    });

    test('should copy correctly formatted MD to clipboard', async () => {
      await processTranscript(mockData, 'md', 'copy', '123');

      const expectedContent =
        '**10:00** *Alice* :: Hi there.\n\n**10:01** *Bob* :: Hello Alice.';
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expectedContent
      );
    });

    test('should create correct CSV content for download', () => {
      processTranscript(mockData, 'csv', 'download', 'meeting_id');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      const call = document.body.appendChild.mock.calls[0][0];
      expect(call.tagName).toBe('A');
      expect(call.download).toBe('tldv_meeting_id_meeting_transcript.csv');
    });
  });

  describe('Chrome API Interactions', () => {
    test('should check if chrome.tabs is available', () => {
      expect(chrome.tabs).toBeDefined();
    });
  });
});
