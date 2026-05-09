# Migration Guide - Term Management Update

## Overview

This guide explains the new term management features added to the KSO Chandigarh Organization Portal and how to migrate from the previous version.

---

## What's New in This Update?

### 1. **Dynamic Term Management**
- No longer hardcoded to "2026-2027"
- Create and manage multiple organizational terms/sessions
- Switch between terms dynamically
- Only one term can be active at a time

### 2. **Enhanced Admin Management**
- Create admins with custom designations
- Extended from 4 to 9 predefined admin roles
- Associate admins with specific terms
- Full CRUD operations on admin accounts

### 3. **Term-Based Member Tracking**
- All members are now associated with a term
- Filter members by term in the dashboard
- View member statistics per term
- Historical data preserved across terms

### 4. **Automatic Enrollment Number Generation**
- Enrollment numbers now use the active term's year
- Example: KSOI2027-0001 for 2027-2028 term
- Automatically updates when term is changed

---

## Breaking Changes

### Database Schema Changes

**Individual & Family Sheets:**
- Added new column: `Term` (stores which term the member joined)

**Admins Sheet:**
- Added column: `Designation` (custom designation beyond role)
- Added column: `Term` (which term the admin was appointed)

**New Sheet:**
- `Terms` sheet created with columns:
  - TermID
  - TermName
  - StartDate
  - EndDate
  - Active
  - CreatedDate
  - CreatedBy

---

## Migration Steps

### For Existing Installations

If you're updating an existing KSO Portal installation:

#### Step 1: Backup Your Data
```
1. Go to your Google Sheet
2. File > Make a copy
3. Rename: "KSO Portal Backup - [DATE]"
```

#### Step 2: Update Code Files
```
1. Open Apps Script editor
2. Replace Code.gs with new version
3. Replace Dashboard.html with new version
4. Save all files
```

#### Step 3: Run Migration
```
1. In Apps Script editor, select function: migrateAddTermColumn
2. Click Run (▶️)
3. Check Logs to verify migration completed successfully
4. Look for message: "Migration completed: X records updated with term..."
```

#### Step 4: Deploy New Version
```
1. Click Deploy > Manage deployments
2. Click Edit (✏️) on existing deployment
3. Change Version to "New version"
4. Click Deploy
```

#### Step 5: Verify Migration
```
1. Open your portal URL
2. Login to admin dashboard
3. Go to "Terms" tab - verify 2026-2027 term exists and is active
4. Go to "Individual Members" - verify Term column appears
5. Check that all existing members show "2026-2027" in Term column
```

### For New Installations

If this is a fresh installation:

1. Follow standard setup from SETUP.md
2. Run `initializeDatabase()` function
3. Default 2026-2027 term will be created automatically
4. No migration needed!

---

## Using the New Features

### Creating a New Term

1. Login to Admin Dashboard
2. Go to **Terms** tab
3. Click **Create Term**
4. Fill in details:
   - Term Name: e.g., "2027-2028"
   - Start Year: 2027
   - Start Date: April 1, 2027
   - End Date: March 31, 2028
5. Click **Create Term**

**Note:** New terms are created as inactive. Only one term can be active at a time.

### Activating a Term

1. Go to **Terms** tab
2. Find the term you want to activate
3. Click **Activate** button
4. Confirm activation
5. Page will reload with new active term

**Important:** When you activate a new term:
- All new member enrollments will use this term
- Enrollment numbers will use the new term's year
- Dashboard statistics will show all-time data unless filtered

### Creating Admins with Custom Designations

1. Login to Admin Dashboard
2. Go to **Admins** tab
3. Click **Add Admin**
4. Fill in details:
   - Email
   - Full Name
   - Password
   - Role (select from 9 options)
   - Designation (custom text, e.g., "Technical Coordinator")
   - Term (which term this admin serves)
5. Click **Create Admin**

### Filtering Members by Term

1. Go to **Individual Members** or **Family Members** tab
2. Use the **Term** dropdown filter
3. Select a specific term or "All Terms"
4. Members list updates automatically
5. Combine with Status filter for refined results

### Viewing Term Statistics

1. Go to **Terms** tab
2. View active term details at the top
3. See all terms in the table below
4. Each term shows:
   - Term Name
   - Start/End Dates
   - Active status
   - Created date

**Note:** Term-specific statistics can be implemented using the `getTermStatistics()` function.

---

## API Changes

### New Functions Available

#### Backend (Code.gs)

**Term Management:**
```javascript
getActiveTerm()           // Returns active term name
getActiveTermYear()       // Returns active term's start year
getTermSetting(key, defaultValue)  // Gets term-specific settings
createTerm(termData)      // Creates a new term
setActiveTerm(termName)   // Activates a term
getAllTerms()             // Gets all terms
```

**Member Management by Term:**
```javascript
getMembersByTerm(memberType, termName)  // Get members for specific term
getAllMembers(memberType)               // Get all members
getTermStatistics(termName)             // Get statistics for a term
```

**Admin Management:**
```javascript
getAllAdmins()            // Get all admin accounts
updateAdmin(email, data)  // Update admin details
deleteAdmin(email)        // Delete admin account
changeAdminPassword(email, newPassword)  // Change password
getAdminsByTerm(termName) // Get admins for specific term
```

#### Frontend (Dashboard.html)

**JavaScript Functions:**
```javascript
loadTerms()               // Load and display all terms
populateTermFilters(terms)  // Populate term dropdown filters
loadAdmins()              // Load and display all admins
getMembersByTerm(type, term)  // Filter members by term (client-side)
```

---

## Configuration

### CONFIG Object (Code.gs)

The CONFIG object now loads dynamically:

```javascript
const CONFIG = {
  SHEET_ID: '...',
  ORGANIZATION: 'Kuki Students\' Organisation (KSO) Chandigarh',
  SESSION: getActiveTerm(),  // ← Dynamic, loads from Terms sheet
  INDIVIDUAL_FEE: getTermSetting('INDIVIDUAL_FEE', 500),  // ← Can be term-specific
  FAMILY_FEE: getTermSetting('FAMILY_FEE', 1500),         // ← Can be term-specific
  ADMIN_ROLES: [  // ← Expanded from 4 to 9 roles
    'Admin', 'President', 'General Secretary', 'Treasurer',
    'Vice President', 'Joint Secretary', 'Cultural Secretary',
    'Sports Secretary', 'Finance Secretary'
  ]
};
```

---

## Troubleshooting

### Issue: Term column not appearing

**Solution:**
1. Run `migrateAddTermColumn()` function from Apps Script
2. Refresh your browser
3. Clear browser cache if needed

### Issue: Active term not showing in dashboard

**Solution:**
1. Verify Terms sheet exists
2. Check at least one term has Active = TRUE
3. Deploy new version of web app
4. Reload dashboard

### Issue: Old enrollments still using 2026

**Solution:**
- Old enrollments keep their original numbers (correct behavior)
- New enrollments will use active term's year
- To regenerate old numbers, you'd need custom migration

### Issue: Members showing "N/A" for Term

**Solution:**
1. Run migration: `migrateAddTermColumn()`
2. This fills empty Term values with active term

### Issue: Cannot create admin with custom designation

**Solution:**
1. Verify you're using the new Dashboard.html
2. Check that Admins sheet has "Designation" column
3. Re-run `initializeDatabase()` if column is missing

---

## Best Practices

### When Starting a New Term

1. **Create the new term** (e.g., 2027-2028)
2. **Don't activate immediately** - finish current term first
3. **Export current term data** for records
4. **Activate new term** when ready to accept new members
5. **Verify enrollment numbers** are using new year

### Managing Historical Data

- **Keep old terms inactive** but don't delete them
- **Filter by term** to view historical members
- **Archive old data** by exporting to separate sheets
- **Use term statistics** to compare across years

### Admin Account Management

- **Create term-specific admins** for each executive committee
- **Use custom designations** to reflect actual roles
- **Deactivate (don't delete)** admins when term ends
- **Update admin terms** when creating new executive committee

### Data Integrity

- **Always backup** before major operations
- **Test in a copy** before making changes to production
- **Verify migration** completed successfully
- **Keep audit logs** for accountability

---

## Backward Compatibility

✅ **Fully backward compatible**

- Existing installations will continue to work
- Default 2026-2027 term created automatically
- Old members automatically assigned to active term during migration
- No data loss during migration
- All existing features remain functional

---

## Future Enhancements

Planned features for future updates:

- [ ] Term-specific fee structures
- [ ] Automatic term transition workflows
- [ ] Cross-term comparison reports
- [ ] Bulk member migration between terms
- [ ] Term-based permission scoping
- [ ] Academic year vs. calendar year term support
- [ ] Term archive functionality

---

## Support

For issues or questions:

- **Documentation:** README.md, SETUP.md
- **Email:** admin@ksocandigarh.org
- **GitHub Issues:** (if repository is public)

---

## Version History

- **v1.1** (Current) - Added term management and dynamic configuration
- **v1.0** - Initial release with hardcoded 2026-2027 session

---

**Last Updated:** May 2026

**Migration Guide Version:** 1.0
