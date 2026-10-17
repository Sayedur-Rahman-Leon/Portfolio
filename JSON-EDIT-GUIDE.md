# JSON Editing Guide

## 1. Change profile information

Open `data/site.json`:

```json
"profile": {
  "name": "Sayedur Rahman Leon",
  "role": "CSE Student · Developer · Researcher · Creative",
  "email": "your-email@example.com",
  "location": "Dhaka, Bangladesh",
  "avatar": "assets/img/my-photo.jpg"
}
```

## 2. Add a software project

Open `data/software.json` and add another object inside `projects`:

```json
{
  "title": "Hospital Management System",
  "category": "Desktop",
  "description": "A desktop system for managing patients, doctors, appointments, and billing.",
  "image": "assets/img/hospital-project.jpg",
  "stack": ["C#", "WinForms", "SQL Server"],
  "github": "https://github.com/username/project",
  "live": "#",
  "featured": true
}
```

The project card will appear automatically.

## 3. Add a research publication

Open `data/research.json` and add an object inside `publications`:

```json
{
  "title": "Your Paper Title",
  "venue": "Conference / Journal Name",
  "year": "2026",
  "authors": "Author One, Author Two, Author Three",
  "description": "One or two sentences explaining the paper.",
  "tags": ["Computer Vision", "Healthcare", "Deep Learning"],
  "link": "https://example.com/paper"
}
```

## 4. Add a photograph

Open `data/photography.json`:

```json
{
  "title": "Rainy Dhaka",
  "category": "Urban",
  "image": "assets/img/rainy-dhaka.jpg",
  "location": "Dhaka",
  "device": "OnePlus 15",
  "caption": "Evening traffic after rain."
}
```

If you create a new category, also add it to the `filters` array.

## 5. Add education

Open `data/education.json` and add an item to `timeline`:

```json
{
  "date": "2026",
  "title": "Course or Degree",
  "organization": "Institution Name",
  "description": "Short description."
}
```

## 6. Add a qualification or certificate

Add an item to `qualifications`:

```json
{
  "title": "Certificate Name",
  "description": "Issued by Organization, 2026.",
  "icon": "bi-patch-check"
}
```

Bootstrap Icons are used for icon names.

## 7. Add social links

In `data/site.json`:

```json
"socials": [
  {
    "label": "GitHub",
    "icon": "bi-github",
    "url": "https://github.com/username"
  }
]
```

## JSON rules

JSON is strict:

- Use double quotes `"`.
- Put commas between items.
- Do not put a comma after the last item.
- Keep `{}` and `[]` balanced.

If the site suddenly stops loading after an edit, validate the JSON syntax first.

---

## Google Drive photo / audio / video

The updated portfolio now supports Google Drive media on every page. See `MEDIA-GUIDE.md` for the current media schema and full examples.

Basic format:

```json
"media": [
  {
    "type": "image",
    "title": "My Photo",
    "url": "https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
  },
  {
    "type": "audio",
    "title": "My Song",
    "url": "https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
  },
  {
    "type": "video",
    "title": "My Video",
    "url": "https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
  }
]
```
