# HANDOVER SUMMARY & CONTEXT — PORTFOLIO CMS DEV

## Project Overview
- **Repository**: `Xzavis/dev` (`C:\xzavis`)
- **Active Branch**: `feature/admin-cms`
- **Framework**: Next.js (App Router, Turbopack, Tailwind CSS, TypeScript)
- **Local Dev Server**: `http://localhost:3000` (Admin: `http://localhost:3000/admin`, PIN: `zickrian2026`)

---

## Architecture & Data Flow
```
Admin Dashboard (src/app/admin/*)
       │
       ▼
Server Actions (src/features/admin/actions/content-actions.ts)
       │
       ▼
Content Manager (src/features/admin/lib/content-manager.ts)
       │
       ▼
LocalContentRepository (src/lib/content/local-repo.ts)
       │
       ▼
Canonical JSON Files (/content/**/*.json)
       │
       ▼
Content Loader (src/lib/content/index.ts)
       │
       ▼
Public Portfolio Website (src/app/(app)/*, src/app/projects/*, etc.)
```

---

## Media Storage Strategy & Management (Contextual Mapping & Ponytail Minimalist)
- **Logos (`public/logos/`)**:
  - Digunakan untuk logo perusahaan di `Experience` dan logo penerbit di `Certifications`.
  - Path URL: `/logos/[file-name].[ext]`.
- **Proyek (`public/projects/[projectSlug]/`)**:
  - Folder khusus dibuat otomatis saat proyek dibuat atau diedit (`ensureProjectFolderAction`).
  - Digunakan untuk foto galeri (`project.gallery`) dan hero image (`project.image`).
  - Path URL: `/projects/[slug]/[file-name].[ext]`.
  - Thumbnail umum proyek tersimpan di `public/projects/`.
- **Gambar Profil & Showcase Umum (`public/image/`)**:
  - Disimpan langsung di folder `public/image/` (tanpa subfolder `uploads/`).
  - Path URL: `/image/[file-name].[ext]`.
- **Banner (Video WebM/MP4, Hero Banner)**:
  - Disimpan langsung di root folder `public/` (e.g. `/banner.webp`, `/dithered-video.webm`).
  - Path URL: `/[file-name].[ext]`.
- **Deduplikasi Cerdas**:
  - Pengecekan nama file sebelum upload: jika file dengan nama yang sama sudah ada di direktori tujuan, sistem langsung menggunakan file tersebut tanpa menduplikasi atau menambah timestamp.
- **Media Library & Deletion**:
  - Modal `MediaLibraryModal` terpasang di semua dashboard dengan tombol `[Galeri]` & `[Upload]`.
  - Terarah secara kontekstual ke folder aset yang relevan.
  - Fitur pencarian instan nama file.
  - Fitur hapus file permanen dari disk dengan dialog konfirmasi dan proteksi file sistem.
- **Project Gallery Showcase Manager**:
  - Tab "Media & Assets" di form proyek dilengkapi kontrol visual array `project.gallery` (tambah, upload ke folder proyek, reorder urutan naik/turun, dan hapus foto).

---

## Canonical Data Files (`content/`)
- `content/profile.json` — Profile bio, avatar (`/image/profile2.webp`), and video/image banner (`/dithered-video.webm`).
- `content/projects/*.json` + `order.json` — 13 case studies with ordered slugs.
- `content/experiences/*.json` + `order.json` — 7 career experiences with nested positions & skills.
- `content/skills.json` — 33 technologies from vetted catalog.
- `content/social-links.json` — 5 social media links with auto-icon & label mapping.
- `content/awards.json` — 3 honors & awards.
- `content/certifications.json` — 29 certification records.
- `content/publications.json` — 1 publication record.
- `content/gallery.json` — Showcase photos and videos with aspect ratio and metadata.
- `content/blog.json` — Portfolio articles and synchronized Medium posts.
- `content/settings.json` — SEO metadata and site configuration.

---

## Recent Implementations & Fixes Completed
1. **Media Library Modal & Unified Upload UX**:
   - `FormMediaUpload` integrated in Profile, Projects, Experience, Certifications, Gallery, and Settings.
   - Separate directory targeting (`targetFolder="image"` vs `targetFolder="banner"`).
   - Instant search, select card, and permanent deletion with confirmation dialog.
2. **Deduplication**:
   - Reuses existing files if identical filename exists.
3. **Banner Support for WebM/MP4 Video and GIF Animations**:
   - Auto-detection of `.webm`, `.mp4`, `.gif` with looping autoplay video or unoptimized GIF image.
4. **Mobile-First Back Navigation & UX**:
   - Added `← Back` in `AdminHeader` and bottom action bars.
5. **Audits & Verification**:
   - TypeScript (`npm run check-types`): **0 errors**.
   - ESLint (`npm run lint`): **0 errors**.
   - Browser Subagent end-to-end verification passed.
