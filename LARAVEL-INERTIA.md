# Laravel + Inertia setup

The application is served by Laravel 12 through Inertia React. The original
`src/pbm_ops_mvp.jsx` component remains the single UI implementation and is
imported by `resources/js/Pages/PbmOps.jsx`. This is deliberate: it prevents
markup, styling, chart, state, and responsive-layout drift during migration.

## Requirements

- PHP 8.2 or newer
- Composer 2
- Node.js 22 or newer

## Development

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
npm install
php artisan serve
npm run dev
```

Open `http://127.0.0.1:8000`.

## Verification

```powershell
npm test
npm run build
php artisan test
```

Browser data and the demo session intentionally continue to use the existing
`localStorage` and `sessionStorage` keys, so previously entered prototype data
is preserved after switching to the Laravel/Inertia entry point.
