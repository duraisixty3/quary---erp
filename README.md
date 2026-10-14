# Vajra Stone & Pebble Management ERP
### Enterprise Resource Planning for Quarry Operations, Pebble Trading & Lorry Logistics

Designed specifically for Indian small-to-medium stone trading and quarry enterprises operating across South and Western Indian corridors (Bangalore, Chennai, Kerala, Hyderabad, Pune, Ahmedabad).

---

## 🌟 Key Business Features

### 1. Flexible Business Operating Modes
- **Trading Mode**: Sourcing materials (pebbles, jalli, gravel, M-sand) from partner quarries and selling to landscaping firms, infrastructure contractors, and stone wholesalers.
- **Own Quarry Mode**: Production pit extraction logs, vibratory screening, crushing plants, equipment hour-meters, diesel consumption, statutory mining lease permit validity tracking, and daily production cost per tonne.
- **Combined Operations ERP**: Operate both trading distribution and future quarry extraction side-by-side with isolated inventory and shared customer directories.

### 2. Commercial & Indian Financial Localization
- **Currency**: Indian Rupees (**INR ₹**) with standard `en-IN` numbering (`₹ 1,25,000`, `₹ 12.50 L`, `₹ 1.20 Cr`).
- **Dates & Timezone**: `DD-MM-YYYY` formats synced with `Asia/Kolkata` (IST).
- **Metric Units & Configurable Densities**: Tonnes (MT), Kilograms (kg), Cubic Metres (m³), and Quarry Brass (1 Brass = 100 cu ft ~ 2.83 m³), with material-specific densities (e.g., 1.62 MT/m³ for white pebbles, 1.55 MT/m³ for 20mm jalli).
- **GST Compliance**: Tax invoice generation with CGST/SGST/IGST breakdown (5% mineral stone rate, 18% services), buyer/seller GSTINs, and bank remittance coordinates.

### 3. Load-Wise Profitability Calculator & Ledger (Flagship Feature)
Calculates real financial profitability for every lorry dispatch:
$$\text{Gross Profit} = \text{Delivered MT} \times \text{Customer Rate} - (\text{Supplier Purchase} + \text{Freight} + \text{Loading/Unloading} + \text{Tolls})$$
- Real-time gross margin percentage.
- Net profit per metric tonne ($\text{INR / MT}$).
- Transporter freight advances and final trip settlements.
- One-click CSV export for accountant auditing.

### 4. Fleet & Lorry Logistics
- Weighbridge gross weight, empty tare weight, and certified net weight calculations.
- Automatic legal RTO overload warnings when loaded MT exceeds vehicle permitted capacity.
- Delivery confirmation audit lock before closing orders and deducting warehouse stock.

### 5. Multi-Yard Inventory & Stock Ledger
- Immutable journal tracking `purchase_in`, `sales_out`, `quarry_production`, and audited manual adjustments.
- Valuation using weighted-average landed costing.
- Minimum stock reorder alerts.

---

## 📁 System Architecture & Routes

| Route | Module Description |
| :--- | :--- |
| `/dashboard` | Executive KPI dashboard, Recharts revenue trends, low stock alerts, in-transit lorries. |
| `/load-profit` | Load-wise Profitability Calculator, trip P&L margins, and CSV export. |
| `/materials` | Aggregate & pebble catalogue, densities, sizes, grades, unit buy/sell rates. |
| `/suppliers` | External quarry owners directory, credit terms, loading availability, payables. |
| `/customers` | B2B buyer CRM (landscapers, contractors, wholesalers) with negotiated pricing. |
| `/quotations` | Quotation builder with multi-item GST calculations and 1-click conversion to sales order. |
| `/sales` | Sales orders, delivery confirmation with weighbridge slip reference, tax invoice generator. |
| `/purchases` | Purchase orders, landed cost tracking, shortage reconciliation, and goods inward receipt. |
| `/transport` | Lorry tracking, vehicle capacity compliance, driver advances, freight settlement. |
| `/delivery-planning`| Route distance estimator for Bangalore/Chennai/Kerala corridors and freight models. |
| `/inventory` | Multi-bay stock ledger (Attibele Yard, Shoolagiri Crusher, Hosur Hub). |
| `/expenses` | Operating expenses: diesel fuel, crusher HT electricity, labour wages, explosives, yard leases. |
| `/payments` | Invoice-by-invoice allocation, customer receivables, supplier payables, UTR tracking. |
| `/reports` | Financial statements: P&L statement, customer aging, stock valuation, transport reports. |
| `/quarry` | Own quarry site register, survey numbers, statutory permit validity countdown, shift logs. |
| `/machinery` | Heavy equipment register (crushers, excavators), hour-meters, maintenance cost/hour. |
| `/documents` | Central document vault for weighbridge slips, GST tax invoices, and mining lease deeds. |
| `/notifications` | In-app alerts for overdue bills, low inventory, and permit renewals. |
| `/users` | Role-Based Access Control (Owner, Manager, Accountant, Sales, Operations). |
| `/settings` | Business profile, GSTIN, bank details, numbering prefixes, mode toggle, data reset. |
| `/audit` | Chronological security audit log of all system mutations with user role stamps. |
| `/login` | Fast role-based simulator and auth screen. |
| `/setup` | Guided first-time business onboarding wizard. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 LTS or higher
- **Package Manager**: npm

### 2. Installation
```bash
# Navigate to the project directory
cd quarry-erp

# Install dependencies (already installed)
npm install
```

### 3. Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Running Production Build
```bash
npm run build
npm run start
```

### 5. Running Automated Calculation Tests
```bash
node --test src/tests/calculations.test.mjs
```

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

1. Create a PostgreSQL project on [Supabase](https://supabase.com).
2. Open the Supabase SQL Editor and run the provided schema migration:
   ```
   supabase/schema.sql
   ```
3. Copy your project credentials into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. If credentials are not supplied, the application automatically runs in **Offline-First Demo Mode** with persistent browser storage and preloaded realistic Indian stone trading records. You can safely reset or clear demo data from the `/settings` page.
