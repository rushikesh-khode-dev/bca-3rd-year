# BCA Third Year Study Hub (YCMOU)

Study website for **Yashwantrao Chavan Maharashtra Open University – BCA Third Year**
(Semester V and Semester VI). Every theory and practical e-book in one place: **Open** online
(works on phone and laptop) or **Download**.

Designed & created by **Rushikesh Khode** · © codebyrushi. All rights reserved.
Not an official YCMOU website. The e-books are published by YCMOU, Nashik.

## Subjects

| Sem | Code | Subject | Type |
|---|---|---|---|
| V | CMP332 | Quantitative Aptitude | Theory |
| V | CMP513 | E-Commerce Technologies | Theory |
| V | CMP514 | Advance Java | Theory |
| V | CMP515 | Linux Administration | Theory |
| V | CMP713 | Lab: E-Commerce Technologies | Practical |
| V | CMP714 | Lab: Advance Java | Practical |
| V | CMP715 | Lab: Linux Administration | Practical |
| VI | CMP516 | Android Programming | Theory |
| VI | CMP517 | PHP Programming | Theory |
| VI | CMP716 | Lab: Android Programming | Practical |
| VI | CMP717 | Lab: PHP Programming | Practical |
| VI | OPN273 | Personality and Career Skills | *(book not added yet)* |
| VI | CMP801 | Project – BCA | *(not added yet)* |

## Folder layout

```
index.html            ← the website
assets/
  data.js             ← list of books (edit this to add books)
  app.js, style.css   ← website code
books/
  sem5/theory/  sem5/practical/
  sem6/theory/  sem6/practical/
.nojekyll
```

## Put it online with GitHub Pages (free)

1. Create a new **public** repository on GitHub, e.g. `bca-study-hub`.
2. Click **Add file → Upload files**, drag **everything inside this folder**
   (`index.html`, `assets`, `books`, `README.md`, `.nojekyll`) and click **Commit changes**.
   *(If `.nojekyll` is hidden, it is optional. The site still works without it.)*
3. Go to **Settings → Pages** → *Source:* **Deploy from a branch** → Branch **main**, folder **/ (root)** → **Save**.
4. After 1–2 minutes your site is live at
   `https://<your-github-username>.github.io/bca-study-hub/`. Share this link with friends.

## Add a missing book later (e.g. OPN273)

1. Copy the PDF into `books/sem6/theory/` with a name without spaces, e.g. `OPN273-Personality-and-Career-Skills.pdf`.
2. Open `assets/data.js`, find `OPN273`, and set:
   `file: "books/sem6/theory/OPN273-Personality-and-Career-Skills.pdf", pages: <total pages>, sizeMB: <size>`.
3. Upload the changed files to GitHub. The site updates by itself.

## Viewing on your own computer

Double-clicking `index.html` works, but PDFs open in the browser's own viewer.
For the built-in reader, run a local server inside this folder:
`python -m http.server 8000`, then open http://localhost:8000.

---
Website © codebyrushi — created by Rushikesh Khode. E-books © YCMOU, Nashik, shared only for study.
