# Local Product Finder

A complete, responsive web platform helping neighborhood shoppers find products at nearby local shops, compare current shelf prices and live stock, and discover neighborhood merchants.

---

## Technical Stack & Architecture Rationale

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
  - *Rationale*: Server components and API Route Handlers enable server-side validation, secure authentication tokens in HTTP-only cookies, and fast streaming page loads.
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
  - *Rationale*: Persistent relational data model with strict foreign-key constraints (ensuring shop owners can only access and modify their own shop inventory), case-insensitive partial searches, and type-safe schema definitions.
- **AI-Assisted Search**: Gemma AI / Gemini API integration with semantic NLP heuristic fallback
  - *Rationale*: Natural language query interpretation (e.g., &ldquo;cheap 1 kg rice near me&rdquo;) detects product target, brand, package size, and budget intent. If no external API key is set, the built-in heuristic parser handles queries reliably without failing.
- **Styling**: Tailwind CSS v4
  - *Rationale*: Modern utility-first styles, accessible responsive mobile-first layouts, and clear stock status badges.
- **Security & Auth**: HTTP-only JWT sessions via `jose` and `bcryptjs` password hashing. Strict server-side ownership authorization on every merchant inventory modification endpoint.

---

## Main User Journeys

### 1. Customer (No account required)
1. **Search**: Search by product name, brand, category, or barcode directly on the homepage or search page.
2. **Location & Distance**: Enter a neighborhood name, allow GPS location access, or click the 1-click **&ldquo;Use NYC Demo Area&rdquo;** button.
3. **Price & Stock Comparison**: See all matching items with unit price, stock status (**In stock**, **Low stock**, **Out of stock**), shelf quantity, walking distance in km/meters, and inventory verification timestamp.
4. **Sort & Filter**: Sort by nearest distance, lowest price, stock count, or update time. Filter by in-stock status, maximum distance, price range, brand, and category.
5. **Shop Details**: Click any store to view its full profile, opening hours, verified badge, street address, map coordinates, contact details, and current catalog.
6. **Broadening Suggestions**: If no results are found, clear suggestions advise shoppers to relax filters or search broader terms.

### 2. Shop Owner (Merchant Portal)
1. **Register / Sign In**: Register a new store account or use one of the pre-seeded demo merchant accounts.
2. **Dashboard**: View summary cards: Total items, Live/published items, Pending drafts, Low-stock alerts, and Out-of-stock items.
3. **Single Item Management**: Add or edit products with name, brand, category, size, barcode, price, currency, and stock threshold.
4. **Review & Confirm Workflow**: Items can be saved as drafts. Shop owners review drafts and batch-publish them before they become visible to customers.
5. **CSV Bulk Import**: Paste or upload comma-separated inventory to instantly import dozens of products.
6. **Server-Side Security**: Shop owners are strictly forbidden on the server from accessing, editing, or deleting items belonging to other shops.

---

## Setup & Running Locally

### Prerequisites
- Node.js 18+ or Node 20+
- PostgreSQL database running locally or via Docker

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` points to your PostgreSQL instance, e.g.:
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
AUTH_SECRET=local-product-finder-session-secret-change-in-production-123456
# Optional Gemma AI:
GEMMA_API_KEY=your_key_here
```

### 3. Apply Schema & Seed Demo Data
```bash
npx drizzle-kit push
curl -X POST http://localhost:3000/api/seed
```
*Note: Demo shops and items are automatically marked with clear `DEMO` badges.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 5. Automated MVP Flow Checks
Run the included verification suite:
```bash
npx tsx scripts/automated-checks.ts
```

---

## Demo Accounts (Pre-seeded)

- **Shop 1: Green Valley Farm Market**
  - Email: `owner@greenvalleymarket.com`
  - Password: `owner123`
- **Shop 2: Vance's 24/7 Corner Bodega**
  - Email: `marcus@cornerbodega.com`
  - Password: `owner123`
