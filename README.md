# Vendor-Ledger
For optimization of vendor invoice tracking and payment

## Project Purpose:
 - This application is to optimize vendor invoice tracking and payment for small business

## Essential Features:
 - 1.	Keep a list of vendors. Who you do business with.
 - 2.	Enter an invoice. Vendor information, what it’s for, amount, invoice date, and terms. The app works out the due date based on invoice date and term (net 30 terms).
 - 3.	Mark it completed and approved. Was the order completed and did someone approve payment
 - 4.	See what to pay. A screen that lists the invoices ready to pay (completed, approved, not yet paid), showing who, how much, and when, with the soonest due date first.
 - 5.	Record the payment. Paid in full, with the date.

## Team and Responsibilities:
 - I am completing this solo, so I will be handling all design, implementation, and testing.

## Prerequisites
 - Node.js (LTS version; developed and tested with v24) and npm
 - Git
 - No database software is needed. SQLite runs inside the app through the `better-sqlite3` package.
 - No configuration, accounts, or secrets are needed, so there is no `.env` file.

## Installation
```
git clone https://github.com/corymess/Vendor-Ledger.git
cd Vendor-Ledger
npm install
```

## Database setup and sample data
The database is a file named `vendor-ledger.db`. It is created automatically in the project folder the first time the app or the seed script runs.

To start from a clean database loaded with the fictional sample data:
```
npm run seed
```
This **erases all existing vendors and invoices** and loads 3 vendors and 5 invoices, covering every invoice status.

## Starting the application
```
npm start
```
Then open http://localhost:3000 in a browser. The port is 3000. Stop the server with Ctrl+C.

Pages:
 - Vendors: http://localhost:3000/index.html
 - Invoices: http://localhost:3000/invoices.html
 - To Pay: http://localhost:3000/to-pay.html

## Sample data
Vendors: ACME Paper and Writing Implements, Bright Paper Supply, Metro Cleaning Services.

| Invoice | Amount | Invoice date | Terms | Status |
|---|---|---|---|---|
| ACME: Printer paper and pens | $250.00 | 2026-11-01 | 30 days | Completed, approved, unpaid |
| Bright Paper Supply: Printer paper | $75.50 | 2026-11-09 | 30 days | Completed, approved, unpaid |
| Metro Cleaning: November cleaning | $120.00 | 2026-11-05 | 15 days | Completed, not approved |
| ACME: Toner | $40.00 | 2026-11-11 | 30 days | Not completed |
| Metro Cleaning: October cleaning | $120.00 | 2026-10-05 | 15 days | Paid 2026-10-18 by ACH |

Quick check: after `npm run seed` and `npm start`, the To Pay page should show ACME first (due 2026-12-01), Bright Paper Supply second (due 2026-12-09), and **Total to pay: $325.50** ($250.00 + $75.50).

## How money and dates are handled
 - Amounts are stored as whole **cents** (integers), so $250.00 is stored as 25000. This avoids rounding errors.
 - Amounts are entered in dollars with at most two decimal places and must be greater than zero. The server converts them to cents, so no other rounding is applied.
 - Due date = invoice date + terms (days). It is calculated when invoices are read and is not stored.
 - The "Total to pay" is calculated by the server by adding the stored amounts (in cents) of invoices that are completed, approved, and not yet paid.
 - Each invoice is paid in full with a single payment.

## Input checks (done on the server)
 - Vendor name and what they provide cannot be blank.
 - An invoice needs an existing vendor, a description, a positive amount with at most two decimals, a valid date, and terms in whole days.
 - An invoice must be completed before it can be approved, and approving requires the approver's name.
 - A payment needs a payment method and a valid date that is not before the invoice date.
 - Paid invoices cannot be changed or paid again. A missing invoice returns a "not found" message.

## API endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | /api/health | Check that the server is running |
| GET | /api/vendors | List vendors |
| POST | /api/vendors | Add a vendor |
| GET | /api/invoices | List invoices with vendor name and due date |
| POST | /api/invoices | Add an invoice |
| PATCH | /api/invoices/:id | Mark an invoice completed and/or approved |
| GET | /api/invoices/to-pay | Invoices ready to pay, soonest due first, with the total in cents |
| POST | /api/invoices/:id/payment | Record a payment in full |

## Testing
Testing is manual. The test table, with inputs, expected results, actual results, and screenshots, is in the final report. To repeat the checks, run `npm run seed`, then `npm start`, and use the pages above with the sample data.

## Known limitations
 - Single user. There is no login.
 - One currency. Fictional data only.
 - Invoices are paid in full only. There are no partial payments or financing.
 - Vendors and invoices cannot be edited or deleted after they are added.
 - Payment methods come from a fixed list (Check, ACH, Wire, Card, Cash).
 - Runs locally only, on port 3000. There are no automated tests.

## Git history
Work was done on feature branches and merged through pull requests, with GitHub issues for the later tasks. See the repository's Pull requests and Issues tabs.

## AI assistance
I used Claude (Anthropic) as a step-by-step guide throughout this project. Claude provided explanations and code, which I entered, ran, and tested myself.