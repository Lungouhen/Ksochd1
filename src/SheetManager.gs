/**
 * @fileoverview Sheet Management Module
 * Handles Google Sheets operations and data management
 */

// ==================== SHEET MANAGEMENT ====================

/**
 * Opens the main spreadsheet
 * @returns {Spreadsheet} Spreadsheet object
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SHEET_ID);
}

/**
 * Gets or creates a sheet by name
 * @param {string} sheetName - Name of the sheet
 * @returns {Sheet} Sheet object
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheet, sheetName);
  }

  return sheet;
}

/**
 * Initializes a new sheet with headers
 * @param {Sheet} sheet - Sheet object
 * @param {string} sheetName - Name of the sheet
 */
function initializeSheet(sheet, sheetName) {
  const headers = getSheetHeaders(sheetName);
  
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4B5563')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
}

/**
 * Gets header definitions for all sheets
 * @param {string} sheetName - Name of the sheet
 * @returns {Array} Array of header names
 */
function getSheetHeaders(sheetName) {
  const baseHeaders = [
    'Timestamp', 'EnrollmentNo', 'Status', 'Name', 'FatherName', 'MotherName',
    'Gender', 'DOB', 'MaritalStatus', 'Email', 'Phone', 'Course', 'Institution',
    'LocalGuardian', 'OfficeAddress', 'ResidentialAddress', 'PermanentAddress',
    'PhotoURL', 'AmountPaid', 'PaymentMode', 'ReceiptNo', 'ApprovedBy', 
    'ApprovedDate', 'Notes', 'Term'
  ];

  const familyHeaders = [
    ...baseHeaders,
    'Relative1_Name', 'Relative1_Relation', 'Relative2_Name', 'Relative2_Relation',
    'Relative3_Name', 'Relative3_Relation', 'Relative4_Name', 'Relative4_Relation'
  ];

  const headers = {
    [SHEETS.INDIVIDUAL]: baseHeaders,
    [SHEETS.FAMILY]: familyHeaders,
    [SHEETS.PAYMENTS]: [
      'Timestamp', 'EnrollmentNo', 'MemberName', 'Amount', 'PaymentMode', 
      'TransactionRef', 'ReceiptNo', 'RecordedBy', 'Notes'
    ],
    [SHEETS.ADMINS]: [
      'Email', 'Password', 'Role', 'Designation', 'FullName', 'Term', 
      'Active', 'CreatedDate', 'LastLogin'
    ],
    [SHEETS.TERMS]: [
      'TermID', 'TermName', 'StartDate', 'EndDate', 'Active', 'CreatedDate', 'CreatedBy'
    ],
    [SHEETS.SETTINGS]: ['Key', 'Value', 'Description', 'UpdatedDate'],
    [SHEETS.LOGS]: ['Timestamp', 'Action', 'User', 'Details', 'IPAddress'],
    [SHEETS.EVENTS]: [
      'EventID', 'EventName', 'EventDate', 'Location', 'Description', 
      'Organizer', 'Status', 'CreatedDate'
    ],
    [SHEETS.ATTENDANCE]: [
      'AttendanceID', 'EventID', 'EnrollmentNo', 'MemberName', 
      'CheckInTime', 'CheckOutTime', 'Status'
    ],
    [SHEETS.ANNOUNCEMENTS]: [
      'AnnouncementID', 'Title', 'Content', 'Priority', 'PostedBy', 
      'PostedDate', 'ExpiryDate', 'Active'
    ],
    [SHEETS.DOCUMENTS]: [
      'DocumentID', 'Title', 'Description', 'FileURL', 'Category', 
      'UploadedBy', 'UploadDate', 'AccessLevel'
    ],
    [SHEETS.COMMITTEES]: [
      'CommitteeID', 'CommitteeName', 'EnrollmentNo', 'MemberName', 
      'Position', 'StartDate', 'EndDate', 'Active'
    ],
    [SHEETS.RENEWALS]: [
      'RenewalID', 'EnrollmentNo', 'MemberName', 'RenewalDate', 
      'ExpiryDate', 'Amount', 'Status', 'ReceiptNo'
    ],
    [SHEETS.DONATIONS]: [
      'DonationID', 'DonorName', 'EnrollmentNo', 'Amount', 'Purpose', 
      'Date', 'PaymentMode', 'ReceiptNo'
    ],
    [SHEETS.CERTIFICATES]: [
      'CertificateID', 'EnrollmentNo', 'MemberName', 'CertificateType', 
      'IssueDate', 'FileURL', 'IssuedBy'
    ],
    [SHEETS.SKILLS]: [
      'SkillID', 'EnrollmentNo', 'MemberName', 'SkillName', 
      'ProficiencyLevel', 'YearsExperience', 'Certification'
    ],
    [SHEETS.JOBS]: [
      'JobID', 'JobTitle', 'Company', 'Description', 'PostedBy', 
      'PostedDate', 'ExpiryDate', 'ContactEmail', 'Active'
    ],
    [SHEETS.VOLUNTEERS]: [
      'VolunteerID', 'EnrollmentNo', 'MemberName', 'Activity', 
      'Hours', 'Date', 'Supervisor', 'Notes'
    ],
    [SHEETS.POLLS]: [
      'PollID', 'Question', 'Options', 'CreatedBy', 'CreatedDate', 
      'ExpiryDate', 'Active'
    ],
    [SHEETS.POLL_VOTES]: [
      'VoteID', 'PollID', 'EnrollmentNo', 'SelectedOption', 'VoteDate'
    ],
    [SHEETS.MEETINGS]: [
      'MeetingID', 'Title', 'Date', 'Location', 'Agenda', 
      'Minutes', 'Attendees', 'RecordedBy'
    ]
  };

  return headers[sheetName] || [];
}

/**
 * Gets all members from a sheet with optional status filter
 * @param {string} type - Member type (Individual/Family)
 * @param {string} status - Optional status filter
 * @returns {Array} Array of member objects
 */
function getMembers(type, status) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(type);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    const headers = data[0];
    const members = [];

    for (let i = 1; i < data.length; i++) {
      const member = {};
      headers.forEach((header, index) => {
        member[header] = data[i][index];
      });

      if (!status || member.Status === status) {
        member.rowIndex = i + 1;
        members.push(member);
      }
    }

    return members;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get members: ${error.message}`);
    return [];
  }
}

/**
 * Gets members filtered by term
 * @param {string} memberType - Member type (Individual/Family)
 * @param {string} termName - Term name to filter by
 * @returns {Array} Array of member objects
 */
function getMembersByTerm(memberType, termName) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(memberType);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    const headers = data[0];
    const termIndex = headers.indexOf('Term');
    const members = [];

    for (let i = 1; i < data.length; i++) {
      if (termIndex === -1 || data[i][termIndex] === termName) {
        const member = {};
        headers.forEach((header, index) => {
          member[header] = data[i][index];
        });
        member.rowIndex = i + 1;
        members.push(member);
      }
    }

    return members;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get members by term: ${error.message}`);
    return [];
  }
}

/**
 * Gets all members of a specific type
 * @param {string} memberType - Member type (Individual/Family)
 * @returns {Array} Array of member objects
 */
function getAllMembers(memberType) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(memberType);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    const headers = data[0];
    const members = [];

    for (let i = 1; i < data.length; i++) {
      const member = {};
      headers.forEach((header, index) => {
        member[header] = data[i][index];
      });
      member.rowIndex = i + 1;
      members.push(member);
    }

    return members;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get all members: ${error.message}`);
    return [];
  }
}
