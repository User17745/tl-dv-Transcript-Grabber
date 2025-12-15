# tl;dv Transcript Grabber - Manual Test Suite

**Version**: 1.0  
**Test URL**: [Any tl;dv meeting recording with a transcript]  
**Prerequisites**: 
- Latest `main` branch code pulled locally.
- Extension loaded in Chrome (Developer Mode -> Load Unpacked).

---

## 1. Installation & Smoke Test

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| T1.1 | Load Extension | 1. Go to `chrome://extensions`.<br>2. Toggle "Developer mode" ON.<br>3. Click "Load unpacked".<br>4. Select project folder. | Extension appears in the list without errors. Icon appears in toolbar. | |
| T1.2 | Popup Open | 1. Navigate to a tl;dv meeting page.<br>2. Click extension icon. | Popup opens. UI shows 3 rows (TXT, MD, CSV) with Copy/Download buttons. Footer links present. | |

## 2. UI Verification

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| T2.1 | Layout Check | 1. Open popup. | All buttons aligned. Labels (TXT, MD, CSV) bold. Footer text centered and gray. | |
| T2.2 | Hover Effects | 1. Hover over "Copy" and "Download" buttons. | Buttons change shade (darker green). | |
| T2.3 | Footer Links | 1. Click "GitHub".<br>2. Click "Privacy Policy". | Opens correct URLs in new tabs. | |

## 3. Transcript Extraction Functional Tests

**Test Data Reference**:
- Speaker: *Abhishek Aggarwal*
- Timestamp: *18:21*
- Text: *Hi. How is everyone doing?*

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| T3.1 | **TXT Copy** | 1. Click "Copy" next to TXT.<br>2. Paste into Notepad | **Format**: `18:21 Abhishek Aggarwal :: Hi. How is everyone doing?`<br>Confirm `::` separator and correct spacing. Copy alert appears. | |
| T3.2 | **TXT Download** | 1. Click "Download" next to TXT. | file downloads. **Name**: `tldv_<id>_meeting_transcript.txt`.<br>**Content**: Matches copy format. | |
| T3.3 | **MD Copy** | 1. Click "Copy" next to MD. | **Format**: `**18:21** *Abhishek Aggarwal* :: Hi. How is everyone doing?`<br>Confirm Bold time, Italic speaker. | |
| T3.4 | **MD Download** | 1. Click "Download" next to MD. | File downloads. **Name**: `tldv_<id>_meeting_transcript.md`.<br>**Content**: Matches MD format. | |
| T3.5 | **CSV Copy** | 1. Click "Copy" next to CSV.<br>2. Paste into Excel/Sheets. | **Format**: Headers `Timestamp,Speaker,Transcript`. Data in correct columns. Quotes handled correctly. | |
| T3.6 | **CSV Download** | 1. Click "Download" next to CSV. | File downloads. **Name**: `tldv_<id>_meeting_transcript.csv`.<br>**Content**: Valid CSV format. | |

## 4. Edge Cases & Error Handling

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| T4.1 | Invalid Page | 1. Go to `google.com`.<br>2. Click extension icon.<br>3. Click any Copy button. | Alert: "This extension works only on tl;dv" | |
| T4.2 | No Transcript | 1. Load a tl;dv video *without* transcript (or before it loads).<br>2. Click Download. | Alert: "No transcript data found" | |
| T4.3 | Long Transcript | 1. Test on >1hr meeting. | Application pulls all lines without crashing or truncation. | |
| T4.4 | Special Chars | 1. Test transcript with emojis/quotes in text. | CSV handles quotes (doubled `""`). Text preserves emojis. | |

## 5. File Naming Convention

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| T5.1 | Valid ID | URL: `.../meetings/693dc...` | Filename contains `693dc...`. | |
| T5.2 | Unknown ID | URL structure differs (mock test if possible). | Filename defaults to `tldv_unknown_meeting_transcript.<ext>`. | |

---

**Tester Signature**: ____________________  
**Date**: ____________________
