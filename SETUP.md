# KSO Chandigarh Organization Portal - Setup Guide

## Complete Setup Instructions for Session 2026-2027

This guide will walk you through setting up the complete KSO Chandigarh portal using Google Sheets and Google Apps Script.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Google Spreadsheet](#step-1-create-google-spreadsheet)
3. [Step 2: Set Up Apps Script](#step-2-set-up-apps-script)
4. [Step 3: Add HTML Files](#step-3-add-html-files)
5. [Step 4: Initialize Database](#step-4-initialize-database)
6. [Step 5: Deploy as Web App](#step-5-deploy-as-web-app)
7. [Step 6: Configure Settings](#step-6-configure-settings)
8. [Step 7: Test the Portal](#step-7-test-the-portal)
9. [Admin Guide](#admin-guide)
10. [Troubleshooting](#troubleshooting)
11. [Feature List](#feature-list)

---

## Prerequisites

- Google Account with access to Google Drive
- Basic understanding of Google Sheets
- Admin/President of KSO Chandigarh organization

---

## Step 1: Create Google Spreadsheet

1. **Go to Google Sheets**: [https://sheets.google.com](https://sheets.google.com)

2. **Create a new spreadsheet**:
   - Click on "+ Blank" or use the template
   - Name it: **"KSO Chandigarh Portal 2026-2027"**

3. **Note the Spreadsheet ID**:
   - Look at the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Copy the `YOUR_SHEET_ID` part (you'll need this later)

---

## Step 2: Set Up Apps Script

1. **Open Script Editor**:
   - In your spreadsheet, click **Extensions** > **Apps Script**
   - This opens a new tab with the script editor

2. **Replace Default Code**:
   - Delete the default `function myFunction() {}` code
   - Copy the entire contents of **`Code.gs`** from this repository
   - Paste it into the script editor

3. **Save the Script**:
   - Click the save icon (💾) or press `Ctrl+S` / `Cmd+S`
   - Name the project: **"KSO Portal Backend"**

---

## Step 3: Add HTML Files

You need to add 5 HTML files to your Apps Script project:

1. **Click the "+" next to "Files"** in the left sidebar
2. **Select "HTML"** for each file
3. **Create these files with exact names**:

### File 1: Home.html
- Click **+** > **HTML**
- Name: `Home`
- Paste the contents of **`Home.html`** from this repository

### File 2: FormIndividual.html
- Click **+** > **HTML**
- Name: `FormIndividual`
- Paste the contents of **`FormIndividual.html`**

### File 3: FormFamily.html
- Click **+** > **HTML**
- Name: `FormFamily`
- Paste the contents of **`FormFamily.html`**

### File 4: Login.html
- Click **+** > **HTML**
- Name: `Login`
- Paste the contents of **`Login.html`**

### File 5: Dashboard.html
- Click **+** > **HTML**
- Name: `Dashboard`
- Paste the contents of **`Dashboard.html`**

4. **Save All Files**: Press `Ctrl+S` / `Cmd+S`

---

## Step 4: Initialize Database

1. **Open the Script Editor** (if not already open)

2. **Find the `initializeDatabase` function** in Code.gs

3. **Run the Initialization**:
   - Select `initializeDatabase` from the function dropdown at the top
   - Click the **Run** (▶️) button
   - **First time**: You'll need to authorize the script
     - Click **Review Permissions**
     - Choose your Google account
     - Click **Advanced** > **Go to KSO Portal Backend (unsafe)**
     - Click **Allow**

4. **Wait for Completion**:
   - The execution log will show "Execution completed"
   - Go back to your spreadsheet
   - You should now see multiple sheets created:
     - Individual
     - Family
     - Payments
     - Admins
     - Settings
     - Logs
     - Events
     - Attendance
     - Announcements
     - Documents
     - Committees
     - Renewals
     - Donations
     - Certificates
     - Skills
     - Jobs
     - Volunteers
     - Polls
     - PollVotes
     - Meetings

5. **Verify Default Admin**:
   - Check the **Admins** sheet
   - You should see one row with default credentials:
     - Email: `admin@ksocandigarh.org`
     - Password: `admin123`
     - Role: `Admin`

---

## Step 5: Deploy as Web App

1. **In the Script Editor**, click **Deploy** > **New deployment**

2. **Configure Deployment**:
   - Click the gear icon ⚙️ next to "Select type"
   - Choose **Web app**

3. **Fill in Details**:
   - **Description**: "KSO Portal 2026-2027"
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone** (for public membership forms)

4. **Click Deploy**:
   - Review permissions if asked
   - Click **Authorize access**
   - Complete the authorization flow

5. **Copy the Web App URL**:
   - After deployment, you'll see a **Web app URL**
   - It looks like: `https://script.google.com/macros/s/XXXXX/exec`
   - **Save this URL** - this is your portal's public URL!

6. **Important**: Every time you make changes to the code:
   - Go to **Deploy** > **Manage deployments**
   - Click the edit icon (✏️)
   - Change **Version** to "New version"
   - Click **Deploy**

---

## Step 6: Configure Settings

### 6.1 Set Up Photo Storage

1. **Create a Google Drive Folder**:
   - Go to [Google Drive](https://drive.google.com)
   - Create a new folder: **"KSO Member Photos 2026-2027"**
   - Right-click the folder > **Get link** > **Copy link**
   - Extract the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID`

2. **Add Folder ID to Script**:
   - In Apps Script, go to **Project Settings** (gear icon ⚙️)
   - Scroll to **Script Properties**
   - Click **Add script property**
   - Property: `DRIVE_FOLDER_ID`
   - Value: Paste your folder ID
   - Click **Save**

### 6.2 Configure Email Settings

The portal uses Gmail to send emails. Make sure:
- Your Gmail account has sufficient quota (100 emails/day for free accounts)
- For more emails, consider using a Google Workspace account

### 6.3 Update Organization Details (Optional)

In **Code.gs**, you can customize:
```javascript
const CONFIG = {
  ORGANIZATION: 'Kuki Students\' Organisation (KSO) Chandigarh',
  SESSION: '2026-2027',
  INDIVIDUAL_FEE: 500,
  FAMILY_FEE: 1500,
  // ... other settings
};
```

---

## Step 7: Test the Portal

### 7.1 Test Public Pages

1. **Open your Web App URL** in a browser
2. You should see the **Home page**
3. Click **Individual Membership** - form should load
4. Click **Family Membership** - form should load
5. Try filling and submitting a test form

### 7.2 Test Admin Login

1. Click **Admin Login** in the navigation
2. Use default credentials:
   - Email: `admin@ksocandigarh.org`
   - Password: `admin123`
3. You should be redirected to the Dashboard

### 7.3 Test Admin Features

1. **Check Dashboard Stats**: Should show 0 or your test data
2. **Go to Individual Members tab**: Should show your test submission
3. **Try Approving**: Click approve on a pending member
4. **Try Recording Payment**: Use the payment modal
5. **Check Email**: The member should receive confirmation/approval emails

---

## Admin Guide

### Default Admin Credentials

**Important**: Change these immediately after first login!

- **Email**: admin@ksocandigarh.org
- **Password**: admin123
- **Role**: Admin

### Creating Additional Admins

Currently, you need to manually add admins to the **Admins** sheet:

1. Go to the **Admins** sheet
2. Add a new row with:
   - Email: user's email
   - Password: temporary password (user should change it)
   - Role: `Admin`, `President`, `General Secretary`, or `Treasurer`
   - FullName: Full name
   - Active: `TRUE`
   - CreatedDate: Today's date
   - LastLogin: (leave empty)

### Admin Roles & Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full access - all features, database management, backups |
| **President** | Member management, approvals, events, committees |
| **General Secretary** | Events, announcements, communications, documents |
| **Treasurer** | Payment management, financial reports, donations |

### Common Admin Tasks

#### 1. Approve Member Applications

1. Login to Admin Dashboard
2. Go to **Individual Members** or **Family Members** tab
3. Click filter dropdown > Select **Pending**
4. Review member details (click eye icon 👁️)
5. Click **Approve** ✓ or **Reject** ✗
6. Member receives automatic email notification

#### 2. Record Payments

1. Go to **Dashboard** > Click **Record Payment**
2. Enter:
   - Enrollment Number
   - Amount
   - Payment Mode (Cash/UPI/Bank Transfer/Cheque)
   - Transaction Reference (optional)
   - Notes
3. Click **Record Payment**
4. Member receives email with receipt

#### 3. Create Events

1. Go to **Events** tab
2. Click **Create Event**
3. Fill in event details
4. Members can view and register for events

#### 4. Send Announcements

1. Go to **Announcements** tab
2. Click **Post Announcement**
3. Write announcement
4. Set priority and expiry date
5. Announcement appears on member portal

#### 5. Export Data

1. Go to any member tab
2. Click filter (if needed)
3. Click **Export** button
4. Opens new spreadsheet with filtered data

#### 6. Create Backups

1. Go to **Tools** tab
2. Click **Create Backup**
3. A complete copy of the spreadsheet is created
4. Opens in new tab

---

## Troubleshooting

### Problem: "Authorization Required" error

**Solution**:
- Go to Apps Script editor
- Run `initializeDatabase` function
- Complete authorization flow
- Try accessing the web app again

### Problem: Forms not submitting

**Solution**:
1. Check browser console for errors (F12)
2. Verify all HTML files are properly named
3. Check that the deployment is up-to-date
4. Try creating a new deployment

### Problem: Emails not sending

**Solution**:
1. Check Gmail quota (100/day for free accounts)
2. Verify email addresses are correct
3. Check spam folder
4. Enable "Less secure app access" in Gmail (if needed)

### Problem: Photos not uploading

**Solution**:
1. Verify `DRIVE_FOLDER_ID` is set in Script Properties
2. Check folder permissions (should be accessible by you)
3. Ensure image size is under 2MB

### Problem: Dashboard not loading

**Solution**:
1. Clear browser cache
2. Try incognito/private mode
3. Check if you're logged in to correct Google account
4. Verify deployment URL is correct

### Problem: "Script function not found" error

**Solution**:
- Deploy a new version:
  - Go to Deploy > Manage deployments
  - Edit > New version > Deploy
- Clear cache and refresh

---

## Feature List

### ✅ Core Features (Required)

**Public Pages**:
- ✅ Home page with organization info
- ✅ Individual membership form
- ✅ Family membership form (4 relatives)
- ✅ Photo upload functionality
- ✅ Form validation

**Admin Dashboard**:
- ✅ Login system with role-based access
- ✅ Member approval/rejection workflow
- ✅ Payment recording and receipt generation
- ✅ Search and filter members
- ✅ Export to Excel
- ✅ Member details view with photo

**Backend**:
- ✅ Auto-generate enrollment numbers (KSOI2026-XXXX, KSOF2026-XXXX)
- ✅ Status management (Pending → Approved)
- ✅ Multiple sheets structure
- ✅ Data validation

**Email System**:
- ✅ Confirmation email on registration
- ✅ Approval/rejection notifications
- ✅ Payment receipt emails

**Security**:
- ✅ Role-based authentication
- ✅ Protected admin routes
- ✅ Session management

### ✅ Enhanced Features (20+ Additional)

1. ✅ **Event Management** - Create, manage, and track events
2. ✅ **Attendance Tracking** - Record member attendance at events
3. ✅ **Announcement System** - Post and manage announcements
4. ✅ **Document Repository** - Upload and share documents
5. ✅ **Committee Management** - Assign members to committees
6. ✅ **Membership Renewal** - Track and manage renewals
7. ✅ **Donation Tracking** - Record and receipt donations
8. ✅ **Certificate Generation** - Generate member certificates
9. ✅ **Skills Database** - Track member skills and expertise
10. ✅ **Job Board** - Post job opportunities for members
11. ✅ **Volunteer Hours Tracking** - Log community service hours
12. ✅ **Poll/Voting System** - Create polls for member voting
13. ✅ **Meeting Minutes** - Record meeting notes and decisions
14. ✅ **Birthday Reminders** - Auto-detect birthdays this month
15. ✅ **Bulk Email System** - Send emails to all or selected members
16. ✅ **Member Directory** - Searchable member directory
17. ✅ **Fee Structure Management** - Update membership fees
18. ✅ **Member ID Card Generation** - Generate digital ID cards with QR codes
19. ✅ **Data Backup System** - One-click database backup
20. ✅ **Analytics & Reports** - Detailed reports and statistics
21. ✅ **Audit Logs** - Track all admin actions
22. ✅ **Dashboard Statistics** - Real-time stats and charts
23. ✅ **Advanced Search** - Search across all member fields
24. ✅ **Payment History** - View complete payment records

---

## Security Best Practices

1. **Change Default Password Immediately**
2. **Use Strong Passwords** for all admin accounts
3. **Limit Admin Access** - Only give to trusted members
4. **Regular Backups** - Create weekly backups
5. **Review Logs** - Check audit logs regularly
6. **Update Permissions** - Remove admin access when members leave
7. **Test in Incognito** - Always test new deployments in incognito mode

---

## Customization Guide

### Changing Membership Fees

Edit in **Code.gs**:
```javascript
const CONFIG = {
  INDIVIDUAL_FEE: 500,  // Change this
  FAMILY_FEE: 1500,     // Change this
  // ...
};
```

### Changing Colors/Branding

Edit in HTML files:
- Home.html: Search for `bg-blue-900` and replace with your color
- Forms: Change color classes (Tailwind CSS)
- Dashboard: Update navigation bar colors

### Adding Custom Fields

1. Add column to respective sheet (Individual/Family)
2. Update `getSheetHeaders()` function in Code.gs
3. Add field to HTML form
4. Update form submission function

---

## Support & Contact

For technical issues or questions:
- **Repository**: Check GitHub issues
- **Email**: admin@ksocandigarh.org
- **Documentation**: Refer to this SETUP.md file

---

## Version History

- **v1.0** (May 2026) - Initial release
  - Complete portal with all core features
  - 20+ enhanced features
  - Full documentation

---

## License

This project is created for KSO Chandigarh. All rights reserved.

---

## Acknowledgments

Built with:
- Google Apps Script
- Google Sheets
- Tailwind CSS
- Font Awesome Icons

---

**Congratulations! Your KSO Chandigarh Portal is now set up and ready to use! 🎉**

If you encounter any issues, refer to the Troubleshooting section or contact your technical administrator.
