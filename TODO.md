# Dark Mode Fix - Consistent Surface System
## Progress: 0/14 [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜]

### Phase 1: Audit & Base Fixes (Dashboard Shell)
- [ ] 1. Audit base.css dashboard selectors for gaps (layouts, sidebar, forms)
- [ ] 2. Fix dark vars palette in base.css (primary contrast → #3b82f6, better harmony)
- [ ] 3. Standardize ALL dashboard dark surfaces using vars (--surface, --surface-muted, --border)

### Phase 2: Components & Shared Cards  
- [ ] 4. components.css: Replace ALL hard-coded light colors (#ffffff, #f8fafc) with vars
- [ ] 5. Add/complete :root[data-theme=\"dark\"] rules for tables, cards, buttons, modals
- [ ] 6. Audit & var-ify dashboard.css .admin-* rules for consistency

### Phase 3: Public Pages (High Priority: Auth/Navbar)
- [ ] 7. auth.css: Full dark mode - .login-container/#auth-shell dark bg #121a28, text #f8fafc, var-ify all
- [ ] 8. navbar.css: Dark navbar (bg #121a28 rgba, text #f8fafc, buttons adjusted)
- [ ] 9. pages.css/home.css/hero.css: Var-ify backgrounds, text, gradients

### Phase 4: Theme Toggle & Branding
- [ ] 10. Settings page: Add theme toggle (localStorage, data-theme=\"dark\"|\"light\"|\"auto\")
- [ ] 11. Audit frontend/src/lib/workspaceBranding.js - ensure logo/theme customizable

### Phase 5: Testing & Completion
- [ ] 12. Test: Toggle dark mode, check contrast/readability (login, dashboard, tables)
- [ ] 13. Polish: Hover states, shadows, borders for dark mode
- [ ] 14. Run dev server: `cd frontend && npm run dev` + attempt_completion

**Current step:** ✅ TODO.md created. Next: Phase 1 #1 - Audit base.css.

