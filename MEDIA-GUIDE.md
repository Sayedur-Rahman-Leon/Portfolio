# Google Drive Media Guide

This portfolio can display **photos, audio, and video from public Google Drive file links** on every page.

## 1. Prepare a Google Drive file

1. Upload your photo, MP3/audio file, or video to Google Drive.
2. Right-click the file → **Share**.
3. Under **General access**, choose **Anyone with the link**.
4. Keep permission as **Viewer**.
5. Copy the normal Google Drive share link.

Example share link:

```text
https://drive.google.com/file/d/1AbCdEfGh123456789/view?usp=sharing
```

**Do not manually convert the URL.** Paste the normal share link into JSON. The JavaScript extracts the Drive file ID and creates the preview/player URL automatically.

> Use a FILE link, not a Google Drive folder link.

---

## 2. Universal media format

Every page JSON file has a top-level `media` array. Add any combination of photos, audio, and videos:

```json
"media": [
  {
    "type": "image",
    "title": "Studio Session",
    "caption": "A photo from the recording session.",
    "url": "https://drive.google.com/file/d/YOUR_PHOTO_FILE_ID/view?usp=sharing"
  },
  {
    "type": "audio",
    "title": "Original Song Demo",
    "caption": "First demo recording.",
    "url": "https://drive.google.com/file/d/YOUR_AUDIO_FILE_ID/view?usp=sharing"
  },
  {
    "type": "video",
    "title": "Live Performance",
    "caption": "Live performance video.",
    "url": "https://drive.google.com/file/d/YOUR_VIDEO_FILE_ID/view?usp=sharing"
  }
]
```

For Google Drive URLs, always set `type` to one of:

```text
image
 audio
 video
```

Drive sharing URLs do not contain a file extension, so the `type` tells the website which player to create.

---

## 3. Add media to ANY page

The same top-level `media` array works in:

```text
data/site.json          → Home page
data/software.json      → Software page
data/photography.json   → Photography page
data/research.json      → Research page
data/music.json         → Music page
data/fitness.json       → Fitness page
data/education.json     → Education page
```

Example: add a video to the Research page by editing only `data/research.json`:

```json
"media": [
  {
    "type": "video",
    "title": "Research Presentation",
    "caption": "Conference presentation recording.",
    "url": "https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
  }
]
```

No HTML changes are needed.

---

## 4. Add media INSIDE one project or content item

### Software project

```json
{
  "title": "Hospital Management System",
  "category": "Desktop",
  "description": "Hospital management application.",
  "image": "https://drive.google.com/file/d/SCREENSHOT_ID/view?usp=sharing",
  "stack": ["C#", "SQL Server"],
  "github": "https://github.com/yourname/project",
  "live": "#",
  "featured": true,
  "media": [
    {
      "type": "video",
      "title": "Project Demo",
      "caption": "Complete application walkthrough.",
      "url": "https://drive.google.com/file/d/VIDEO_ID/view?usp=sharing"
    }
  ]
}
```

The `image` field itself can also be a public Drive image link.

### Research publication

Inside an item in `publications`:

```json
"media": [
  {
    "type": "image",
    "title": "Research Poster",
    "url": "https://drive.google.com/file/d/POSTER_ID/view?usp=sharing"
  },
  {
    "type": "video",
    "title": "Presentation",
    "url": "https://drive.google.com/file/d/VIDEO_ID/view?usp=sharing"
  }
]
```

### Music work

Inside an item in `works`:

```json
"media": [
  {
    "type": "audio",
    "title": "Acoustic Demo",
    "caption": "Original recording.",
    "url": "https://drive.google.com/file/d/AUDIO_ID/view?usp=sharing"
  },
  {
    "type": "image",
    "title": "Cover Art",
    "url": "https://drive.google.com/file/d/IMAGE_ID/view?usp=sharing"
  }
]
```

### Fitness activity

Inside an item in `activities`:

```json
"media": [
  {
    "type": "video",
    "title": "Training Session",
    "url": "https://drive.google.com/file/d/VIDEO_ID/view?usp=sharing"
  }
]
```

### Education timeline item

Inside an item in `timeline`:

```json
"media": [
  {
    "type": "image",
    "title": "Certificate",
    "url": "https://drive.google.com/file/d/CERTIFICATE_IMAGE_ID/view?usp=sharing"
  }
]
```

---

## 5. Photography page

The normal `image` field in `photography.json` also accepts a Google Drive photo share link directly:

```json
{
  "title": "Dhaka at Night",
  "category": "Urban",
  "image": "https://drive.google.com/file/d/PHOTO_ID/view?usp=sharing",
  "location": "Dhaka",
  "device": "OnePlus",
  "caption": "Night street photography."
}
```

The site automatically turns the Drive link into a large thumbnail for the gallery.

---

## 6. Profile photo from Google Drive

In `data/site.json`:

```json
"avatar": "https://drive.google.com/file/d/PROFILE_PHOTO_ID/view?usp=sharing"
```

You can keep a local image instead if you prefer:

```json
"avatar": "assets/img/profile.jpg"
```

---

## 7. Non-Drive media

The same system supports normal direct file URLs:

```json
{
  "type": "audio",
  "title": "Song",
  "url": "https://example.com/song.mp3"
}
```

```json
{
  "type": "video",
  "title": "Demo",
  "url": "https://example.com/demo.mp4"
}
```

YouTube video links are also supported when `type` is `video`. The media parser accepts normal `youtube.com/watch?v=...`, `youtu.be/...`, Shorts URLs, `youtube.com/embed/...`, and privacy-enhanced `youtube-nocookie.com/embed/...` URLs. You can also paste a copied YouTube `<iframe ...>` snippet into the `url` field; the site extracts its `src` automatically. Start timestamps such as `?start=286` or `?t=4m46s` are preserved/converted.

Example:

```json
{
  "type": "video",
  "title": "YouTube Performance",
  "url": "https://www.youtube-nocookie.com/embed/VIDEO_ID?start=286"
}
```

---

## 8. Important notes

- Google Drive files must be **Anyone with the link → Viewer**.
- Use individual **file** links, not folder links.
- Audio and video are played with the Google Drive preview player.
- Drive photos use a generated thumbnail and open in the website lightbox when clicked.
- Very large video/audio files may take longer to load.
- Google Drive can enforce bandwidth or playback limits. For a high-traffic production website, use a dedicated media/CDN service instead.
- Run the website through **VS Code Live Server** or another web server because JSON files are loaded with `fetch()`.

---

## 9. Fast workflow

```text
Upload to Google Drive
        ↓
Share → Anyone with the link
        ↓
Copy link
        ↓
Open the relevant JSON file
        ↓
Paste link into url
        ↓
Set type: image / audio / video
        ↓
Save
        ↓
Refresh website
```

That is all you need to do.
