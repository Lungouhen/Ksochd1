# KSO Chandigarh Organization Portal (Google Apps Script + Google Sheets)

This project provides a complete portal for **Kuki Students’ Organisation (KSO) Chandigarh** for **Session 2026–2027**.

## Files

- `Code.gs`
- `Home.html`
- `FormIndividual.html`
- `FormFamily.html`
- `Login.html`
- `Dashboard.html`

## Setup Instructions

1. Create a new Google Spreadsheet.
2. Open **Extensions → Apps Script**.
3. Add each file above in the Apps Script editor and paste the contents.
4. Save project.
5. Run `initializeSheets()` once from Apps Script editor to auto-create required sheets and headers.
6. In **Settings** sheet, optionally add:
   - `PHOTO_FOLDER_ID` → Google Drive folder ID for uploaded photos
   - `SESSION_YEAR` → defaults to `2026`
7. In **Admins** sheet, update admin users with exact columns:
   - `Email, Password, Role, FullName, Active`
   - Password format must be: `sha256:<hash>`
   - Generate password hash by running `createPasswordHash("your-strong-password")` in Apps Script editor, then paste output into the Password column.
   - Allowed roles: `Admin`, `President`, `General Secretary`, `Treasurer`
   - Default seeded admin row is inactive; set `Active` to `Yes` after setting hashed password.

## Required Sheet Structures

### Individual Sheet Columns
`Timestamp, EnrollmentNo, Status, Name, FatherName, MotherName, Gender, DOB, MaritalStatus, Email, Phone, Course, Institution, LocalGuardian, OfficeAddress, ResidentialAddress, PermanentAddress, PhotoURL, AmountPaid, PaymentMode, ReceiptNo, ApprovedBy, ApprovedDate, Notes`

### Family Sheet Columns
Same as Individual +
`Relative1_Name, Relative1_Relation, Relative2_Name, Relative2_Relation, Relative3_Name, Relative3_Relation, Relative4_Name, Relative4_Relation`

### Payments Sheet Columns
`Timestamp, EnrollmentNo, MemberType, Name, Amount, PaymentMode, ReceiptNo, RecordedBy, Notes`

### Admins Sheet Columns
`Email, Password, Role, FullName, Active`

### Additional Sheets
- `Settings`
- `Logs`

## Deploy as Web App

1. Click **Deploy → New Deployment**.
2. Type: **Web app**.
3. Execute as: **Me**.
4. Who has access: as required for your organization.
5. Deploy and authorize scopes (Gmail, Sheets, Drive).
6. Open the web app URL.

## Core Functions Implemented

- `submitIndividual()`
- `submitFamily()`
- `adminLogin()`
- `getMembers()`
- `approveMember()`
- `recordPayment()`
- `sendReceipt()`

## Feature Coverage

- Public home page with navigation
- Individual and Family forms (with 4 relatives/dependents)
- Photo upload to Google Drive and URL storage in Sheets
- Auto enrollment numbers (`KSOI2026-0001`, `KSOF2026-0001`)
- Protected admin dashboard with role-based actions
- Pending/approved/rejected tracking
- Payment recording and PDF receipt emailing
- Search/filter/export to Excel
- Member details with photo view
- Action logging
