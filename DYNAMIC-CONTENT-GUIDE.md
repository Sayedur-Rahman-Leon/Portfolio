# Dynamic Content Guide

## 1. Profile
Edit `data/site.json` → `profile`.

```json
"profile": {
  "name": "Your Name",
  "shortName": "Name",
  "role": "Developer · Researcher",
  "headline": "Your headline",
  "bio": "Your biography",
  "university": "Your university",
  "location": "Dhaka, Bangladesh",
  "email": "you@example.com",
  "phone": "+880...",
  "avatar": "GOOGLE_DRIVE_OR_LOCAL_IMAGE_LINK",
  "resume": "YOUR_CV_LINK"
}
```

The avatar can be a local image path or a public Google Drive photo link.

## 2. Navigation
`site.json` → `navigation` controls labels/order/links for the existing portfolio pages.

```json
{"label":"Research","href":"research.html","page":"research"}
```

## 3. Theme
`site.json` → `theme.dark` and `theme.light` control the complete site palette.

Important keys:
- `background`
- `backgroundAlt`
- `surface`
- `surfaceAlt`
- `text`
- `muted`
- `primary`
- `secondary`
- `accent`
- `highlight`
- `border`

## 4. Home page
`site.json` controls:
- `home.hero`
- `home.about`
- `home.portfolioSection`
- `stats`
- `portfolioAreas`
- `contact`
- `footer`
- `media`

## 5. Software page
Edit `data/software.json`.

Add a project:

```json
{
  "title": "Hospital Management System",
  "category": "Desktop",
  "description": "Hospital management application.",
  "image": "https://drive.google.com/file/d/IMAGE_ID/view",
  "stack": ["C#", "WinForms", "SQL Server"],
  "github": "https://github.com/username/repository",
  "live": "#",
  "featured": true,
  "media": [
    {
      "type": "video",
      "title": "Demo",
      "url": "https://drive.google.com/file/d/VIDEO_ID/view"
    }
  ]
}
```

`filters` are also JSON-driven. The first filter is treated as the show-all filter, so it may be renamed to any language.

## 6. Photography
Edit `data/photography.json` → `items`.

```json
{
  "title": "Dhaka at Night",
  "category": "Urban",
  "image": "GOOGLE_DRIVE_PHOTO_LINK",
  "location": "Dhaka",
  "device": "Phone name",
  "caption": "Night street photography.",
  "media": []
}
```

## 7. Research
Edit `data/research.json`.

You can update:
- research interests
- publications
- authors
- venue/year
- tags
- paper links
- research workflow
- poster images
- presentation videos
- supporting media

## 8. Music
Edit `data/music.json`.

Each work can include audio, video, and photos:

```json
{
  "title": "Original Song",
  "type": "Music",
  "description": "Original song recording.",
  "icon": "bi-music-note-beamed",
  "link": "#",
  "media": [
    {
      "type": "audio",
      "title": "Listen",
      "url": "GOOGLE_DRIVE_AUDIO_LINK"
    },
    {
      "type": "video",
      "title": "Performance",
      "url": "GOOGLE_DRIVE_VIDEO_LINK"
    },
    {
      "type": "image",
      "title": "Cover",
      "url": "GOOGLE_DRIVE_IMAGE_LINK"
    }
  ]
}
```

## 9. Fitness
`data/fitness.json` controls activities, records, and training media.

## 10. Education
`data/education.json` controls:
- academic timeline
- skills
- certificates
- awards
- courses
- certificate photos/videos

## 11. Media on ANY page
Every main page JSON has a top-level `media` array.
Many individual cards also accept their own `media` array.

Universal format:

```json
"media": [
  {
    "type": "image",
    "title": "Photo",
    "caption": "Optional caption",
    "url": "GOOGLE_DRIVE_OR_NORMAL_URL"
  },
  {
    "type": "audio",
    "title": "Audio",
    "url": "GOOGLE_DRIVE_OR_DIRECT_AUDIO_URL"
  },
  {
    "type": "video",
    "title": "Video",
    "url": "GOOGLE_DRIVE_YOUTUBE_OR_DIRECT_VIDEO_URL"
  }
]
```

## 12. Content Manager
Run the portfolio with Live Server and open `content-manager.html`.

This editor validates and downloads JSON. Because the project is static, you then replace the matching JSON file manually.
