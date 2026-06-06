# AGENTS

## Purpose
This repository contains a TCG management system with a Django backend and a React + Vite frontend.
Use these instructions to be productive quickly and avoid common mistakes.

## Start Here
- Repo root: `C:\Proyecto`
- Main docs:
  - [README.md](README.md)
  - [Producto/README.md](Producto/README.md)
  - [Documentacion/README.md](Documentacion/README.md)

## Project Map
- Backend (Django): `Producto/backend/gecko_tcg/`
- Frontend (React + TS + Vite): `Producto/frontend/`

## Standard Commands
- Backend install:
  - `pip install -r Producto/backend/gecko_tcg/requeriments.txt`
- Backend run:
  - `python Producto/backend/gecko_tcg/manage.py runserver`
- Backend tests:
  - `python Producto/backend/gecko_tcg/manage.py test`
- Frontend install/build/dev (run inside `Producto/frontend`):
  - `npm install`
  - `npm run dev`
  - `npm run build`

## Git: "Donde esta el ultimo commit"
When asked where the latest commit is, answer with concrete commit data from the repository root.

1. Check latest commit in current branch:
   - `git -C C:\Proyecto log -1 --format="%H%n%an%n%ad%n%s"`
2. Check active branch and its head:
   - `git -C C:\Proyecto branch --show-current`
   - `git -C C:\Proyecto log -1 --oneline`
3. If user asks for a specific file:
   - `git -C C:\Proyecto log -1 --follow -- <path/to/file>`

Expected response style for this question:
- Mention branch name.
- Mention commit hash (short and full if useful), author, date, and message.
- If requested, include whether there are uncommitted changes via:
  - `git -C C:\Proyecto status --short`

## Backend Conventions
- REST framework default permission is admin-only unless overridden in views.
- Database engine in main settings is Oracle; test settings use in-memory SQLite.
- API routes are mounted under `/api/`.

## Frontend Conventions
- Dev server proxies `/api` to `http://127.0.0.1:8000`.
- Keep API calls centralized in `Producto/frontend/src/services/api.ts`.

## Known Pitfalls
- Dependency file is named `requeriments.txt` (spelling kept as-is in repo).
- Do not rename files unless explicitly requested.
- Avoid destructive git operations unless explicitly requested by the user.

## Scope
Keep edits minimal and targeted. Prefer reading linked docs instead of duplicating project documentation in responses.