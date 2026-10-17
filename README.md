# Fully Dynamic Portfolio

A professional multi-page portfolio built with HTML, CSS, Bootstrap 5, JavaScript, and JSON.

## Main idea

You normally edit **JSON only**. HTML provides the shell, JavaScript renders the content, and CSS/Bootstrap provide the design.

### Global settings
Edit `data/site.json` to control:
- site title and description
- dark and light color palettes
- navigation labels and links
- contact button
- profile name, bio, avatar, university, location, email, phone, CV link
- homepage hero buttons and headings
- stats
- portfolio area cards
- social links
- contact section
- footer
- global media
- labels such as Code, Live, Photo, Audio, Video

### Page content
- `data/software.json`
- `data/photography.json`
- `data/research.json`
- `data/music.json`
- `data/fitness.json`
- `data/education.json`

Each file controls its page hero, section headings, cards/items, filters, links, and media.

## Run locally
Because JSON is loaded with `fetch()`, use a local server.

### VS Code
1. Install **Live Server**.
2. Right-click `index.html`.
3. Choose **Open with Live Server**.

## Content Manager
Open:

`content-manager.html`

It can:
- load any portfolio JSON file
- edit JSON
- validate JSON
- format JSON
- download the updated JSON

After downloading, replace the matching file in the `data/` folder.

> This is a static portfolio. The browser cannot permanently overwrite your deployed JSON files without a backend/CMS.

## Google Drive media
For a Google Drive file:
1. Upload photo/audio/video.
2. Set **General access → Anyone with the link → Viewer**.
3. Copy the normal Drive share link.
4. Paste it into any `media` array.

Example:

```json
{
  "type": "video",
  "title": "Project Demo",
  "caption": "Demo recorded for my portfolio.",
  "url": "https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
}
```

Supported media types:
- `image`
- `audio`
- `video`
- normal external links
- YouTube video URLs, including `youtube-nocookie.com/embed/...` links
- copied YouTube `<iframe ...>` embed snippets in a media `url` field

The JavaScript automatically extracts Google Drive file IDs and creates previews/thumbnails.

## Theme colors
Change `data/site.json`:

```json
"theme": {
  "dark": {
    "background": "#07101F",
    "backgroundAlt": "#0B1324",
    "surface": "#101A2F",
    "surfaceAlt": "#14213A",
    "text": "#F8FAFC",
    "muted": "#A9B7CA",
    "primary": "#4F7CFF",
    "secondary": "#7C5CFF",
    "accent": "#2DD4BF",
    "highlight": "#F5B84B",
    "border": "#CBD5E1",
    "white": "#FFFFFF"
  }
}
```

The site applies these colors to CSS variables at runtime.

## Deployment
The project is suitable for GitHub Pages, Netlify, Cloudflare Pages, or another static host.
