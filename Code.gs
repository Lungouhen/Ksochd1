/**
 * KSO Chandigarh Organization Portal (2026-2027)
 * Google Apps Script Backend
 *
 * This script handles all server-side operations including:
 * - Member registration (Individual & Family)
 * - Authentication and authorization
 * - Payment processing and receipt generation
 * - Email notifications
 * - Data management and exports
 * - Enhanced features (20+)
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  SHEET_ID: PropertiesService.getScriptProperties().getProperty('SHEET_ID') || SpreadsheetApp.getActiveSpreadsheet().getId(),
  ORGANIZATION: 'Kuki Students\' Organisation (KSO) Chandigarh',
  SESSION: getActiveTerm(), // Dynamic session from Terms sheet
  DRIVE_FOLDER_ID: PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || '',
  APP_URL: ScriptApp.getService().getUrl(),
  INDIVIDUAL_FEE: getTermSetting('INDIVIDUAL_FEE', 500),
  FAMILY_FEE: getTermSetting('FAMILY_FEE', 1500),
  ADMIN_ROLES: ['Admin', 'President', 'General Secretary', 'Treasurer', 'Vice President', 'Joint Secretary', 'Cultural Secretary', 'Sports Secretary', 'Finance Secretary']
};

// ==================== TERM MANAGEMENT ====================

function getActiveTerm() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID || SpreadsheetApp.getActiveSpreadsheet().getId()).getSheetByName('Terms');
    if (!sheet) return '2026-2027'; // Default fallback

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][4] === true) { // Active column
        return data[i][1]; // TermName
      }
    }
    return '2026-2027'; // Default fallback
  } catch (error) {
    return '2026-2027'; // Default fallback
  }
}

function getActiveTermYear() {
  try {
    const termName = getActiveTerm();
    const year = termName.split('-')[0];
    return parseInt(year) || new Date().getFullYear();
  } catch (error) {
    return new Date().getFullYear();
  }
}

function getTermSetting(key, defaultValue) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID || SpreadsheetApp.getActiveSpreadsheet().getId()).getSheetByName('Settings');
    if (!sheet) return defaultValue;

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        return parseInt(data[i][1]) || defaultValue;
      }
    }
    return defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

// ==================== WEB APP ROUTING ====================

function doGet(e) {
  const page = e.parameter.page || 'home';
  const session = getSession();

  // Public routes
  if (['home', 'individual', 'family'].includes(page)) {
    return HtmlService.createTemplateFromFile(getPageFile(page))
      .evaluate()
      .setTitle(`${CONFIG.ORGANIZATION} - ${CONFIG.SESSION}`)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Admin routes (require authentication)
  if (page === 'login') {
    if (session && session.authenticated) {
      return doGet({parameter: {page: 'dashboard'}});
    }
    return HtmlService.createTemplateFromFile('Login')
      .evaluate()
      .setTitle('Admin Login')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  if (page === 'dashboard' || page.startsWith('admin')) {
    if (!session || !session.authenticated) {
      return doGet({parameter: {page: 'login'}});
    }
    const template = HtmlService.createTemplateFromFile('Dashboard');
    template.userSession = session;
    return template.evaluate()
      .setTitle('Admin Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Default to home
  return doGet({parameter: {page: 'home'}});
}

function getPageFile(page) {
  const pages = {
    'home': 'Home',
    'individual': 'FormIndividual',
    'family': 'FormFamily',
    'login': 'Login',
    'dashboard': 'Dashboard'
  };
  return pages[page] || 'Home';
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==================== SHEET MANAGEMENT ====================

function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SHEET_ID);
}

function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheet, sheetName);
  }

  return sheet;
}

function initializeSheet(sheet, sheetName) {
  const headers = getSheetHeaders(sheetName);
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4B5563').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
}

function getSheetHeaders(sheetName) {
  const baseHeaders = [
    'Timestamp', 'EnrollmentNo', 'Status', 'Name', 'FatherName', 'MotherName',
    'Gender', 'DOB', 'MaritalStatus', 'Email', 'Phone', 'Course', 'Institution',
    'LocalGuardian', 'OfficeAddress', 'ResidentialAddress', 'PermanentAddress',
    'PhotoURL', 'AmountPaid', 'PaymentMode', 'ReceiptNo', 'ApprovedBy', 'ApprovedDate', 'Notes', 'Term'
  ];

  const familyHeaders = [
    ...baseHeaders,
    'Relative1_Name', 'Relative1_Relation', 'Relative2_Name', 'Relative2_Relation',
    'Relative3_Name', 'Relative3_Relation', 'Relative4_Name', 'Relative4_Relation'
  ];

  const headers = {
    'Individual': baseHeaders,
    'Family': familyHeaders,
    'Payments': ['Timestamp', 'EnrollmentNo', 'MemberName', 'Amount', 'PaymentMode', 'TransactionRef', 'ReceiptNo', 'RecordedBy', 'Notes'],
    'Admins': ['Email', 'Password', 'Role', 'Designation', 'FullName', 'Term', 'Active', 'CreatedDate', 'LastLogin'],
    'Terms': ['TermID', 'TermName', 'StartDate', 'EndDate', 'Active', 'CreatedDate', 'CreatedBy'],
    'Settings': ['Key', 'Value', 'Description', 'UpdatedDate'],
    'Logs': ['Timestamp', 'Action', 'User', 'Details', 'IPAddress'],
    'Events': ['EventID', 'EventName', 'EventDate', 'Location', 'Description', 'Organizer', 'Status', 'CreatedDate'],
    'Attendance': ['AttendanceID', 'EventID', 'EnrollmentNo', 'MemberName', 'CheckInTime', 'CheckOutTime', 'Status'],
    'Announcements': ['AnnouncementID', 'Title', 'Content', 'Priority', 'PostedBy', 'PostedDate', 'ExpiryDate', 'Active'],
    'Documents': ['DocumentID', 'Title', 'Description', 'FileURL', 'Category', 'UploadedBy', 'UploadDate', 'AccessLevel'],
    'Committees': ['CommitteeID', 'CommitteeName', 'EnrollmentNo', 'MemberName', 'Position', 'StartDate', 'EndDate', 'Active'],
    'Renewals': ['RenewalID', 'EnrollmentNo', 'MemberName', 'RenewalDate', 'ExpiryDate', 'Amount', 'Status', 'ReceiptNo'],
    'Donations': ['DonationID', 'DonorName', 'EnrollmentNo', 'Amount', 'Purpose', 'Date', 'PaymentMode', 'ReceiptNo'],
    'Certificates': ['CertificateID', 'EnrollmentNo', 'MemberName', 'CertificateType', 'IssueDate', 'FileURL', 'IssuedBy'],
    'Skills': ['SkillID', 'EnrollmentNo', 'MemberName', 'SkillName', 'ProficiencyLevel', 'YearsExperience', 'Certification'],
    'Jobs': ['JobID', 'JobTitle', 'Company', 'Description', 'PostedBy', 'PostedDate', 'ExpiryDate', 'ContactEmail', 'Active'],
    'Volunteers': ['VolunteerID', 'EnrollmentNo', 'MemberName', 'Activity', 'Hours', 'Date', 'Supervisor', 'Notes'],
    'Polls': ['PollID', 'Question', 'Options', 'CreatedBy', 'CreatedDate', 'ExpiryDate', 'Active'],
    'PollVotes': ['VoteID', 'PollID', 'EnrollmentNo', 'SelectedOption', 'VoteDate'],
    'Meetings': ['MeetingID', 'Title', 'Date', 'Location', 'Agenda', 'Minutes', 'Attendees', 'RecordedBy']
  };

  return headers[sheetName] || [];
}

// ==================== ENROLLMENT NUMBER GENERATION ====================

function generateEnrollmentNo(type) {
  const prefix = type === 'Individual' ? 'KSOI' : 'KSOF';
  const year = getActiveTermYear();
  const sheet = getSheet(type);
  const lastRow = sheet.getLastRow();

  let nextNumber = 1;
  if (lastRow > 1) {
    const enrollmentNumbers = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    const numbers = enrollmentNumbers
      .map(row => row[0])
      .filter(val => val && typeof val === 'string' && val.startsWith(prefix + year))
      .map(val => parseInt(val.split('-')[1]))
      .filter(num => !isNaN(num));

    if (numbers.length > 0) {
      nextNumber = Math.max(...numbers) + 1;
    }
  }

  return `${prefix}${year}-${String(nextNumber).padStart(4, '0')}`;
}

// ==================== MEMBER REGISTRATION ====================

function submitIndividual(formData) {
  try {
    const sheet = getSheet('Individual');
    const enrollmentNo = generateEnrollmentNo('Individual');

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      throw new Error('Required fields missing');
    }

    // Handle photo upload
    let photoURL = '';
    if (formData.photoFile) {
      photoURL = uploadPhoto(formData.photoFile, enrollmentNo);
    }

    const rowData = [
      new Date(),
      enrollmentNo,
      'Pending',
      formData.name,
      formData.fatherName,
      formData.motherName,
      formData.gender,
      formData.dob,
      formData.maritalStatus,
      formData.email,
      formData.phone,
      formData.course,
      formData.institution,
      formData.localGuardian,
      formData.officeAddress,
      formData.residentialAddress,
      formData.permanentAddress,
      photoURL,
      0, // AmountPaid
      '', // PaymentMode
      '', // ReceiptNo
      '', // ApprovedBy
      '', // ApprovedDate
      '',  // Notes
      getActiveTerm() // Term
    ];

    sheet.appendRow(rowData);

    // Send confirmation email
    sendConfirmationEmail(formData.email, formData.name, enrollmentNo, 'Individual');

    // Log action
    logAction('MEMBER_REGISTRATION', 'System', `New individual member: ${enrollmentNo} - ${formData.name}`);

    return {
      success: true,
      enrollmentNo: enrollmentNo,
      message: 'Application submitted successfully! You will receive a confirmation email shortly.'
    };
  } catch (error) {
    logAction('ERROR', 'System', `Individual registration failed: ${error.message}`);
    return {
      success: false,
      message: 'Failed to submit application: ' + error.message
    };
  }
}

function submitFamily(formData) {
  try {
    const sheet = getSheet('Family');
    const enrollmentNo = generateEnrollmentNo('Family');

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      throw new Error('Required fields missing');
    }

    // Handle photo upload
    let photoURL = '';
    if (formData.photoFile) {
      photoURL = uploadPhoto(formData.photoFile, enrollmentNo);
    }

    const rowData = [
      new Date(),
      enrollmentNo,
      'Pending',
      formData.name,
      formData.fatherName,
      formData.motherName,
      formData.gender,
      formData.dob,
      formData.maritalStatus,
      formData.email,
      formData.phone,
      formData.course,
      formData.institution,
      formData.localGuardian,
      formData.officeAddress,
      formData.residentialAddress,
      formData.permanentAddress,
      photoURL,
      0, // AmountPaid
      '', // PaymentMode
      '', // ReceiptNo
      '', // ApprovedBy
      '', // ApprovedDate
      '', // Notes
      getActiveTerm(), // Term
      formData.relative1Name || '',
      formData.relative1Relation || '',
      formData.relative2Name || '',
      formData.relative2Relation || '',
      formData.relative3Name || '',
      formData.relative3Relation || '',
      formData.relative4Name || '',
      formData.relative4Relation || ''
    ];

    sheet.appendRow(rowData);

    // Send confirmation email
    sendConfirmationEmail(formData.email, formData.name, enrollmentNo, 'Family');

    // Log action
    logAction('MEMBER_REGISTRATION', 'System', `New family member: ${enrollmentNo} - ${formData.name}`);

    return {
      success: true,
      enrollmentNo: enrollmentNo,
      message: 'Family application submitted successfully! You will receive a confirmation email shortly.'
    };
  } catch (error) {
    logAction('ERROR', 'System', `Family registration failed: ${error.message}`);
    return {
      success: false,
      message: 'Failed to submit application: ' + error.message
    };
  }
}

// ==================== PHOTO UPLOAD ====================

function uploadPhoto(photoData, enrollmentNo) {
  try {
    const folderId = CONFIG.DRIVE_FOLDER_ID || createPhotoFolder();
    const folder = DriveApp.getFolderById(folderId);

    // photoData format: data:image/jpeg;base64,/9j/4AAQ...
    const [metadata, base64Data] = photoData.split(',');
    const mimeType = metadata.match(/:(.*?);/)[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, `${enrollmentNo}.jpg`);

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();
  } catch (error) {
    logAction('ERROR', 'System', `Photo upload failed for ${enrollmentNo}: ${error.message}`);
    return '';
  }
}

function createPhotoFolder() {
  const folder = DriveApp.createFolder('KSO_Member_Photos_2026-2027');
  const folderId = folder.getId();
  PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', folderId);
  return folderId;
}

// ==================== AUTHENTICATION ====================

function adminLogin(email, password) {
  try {
    const sheet = getSheet('Admins');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email && data[i][1] === password && data[i][4] === true) {
        const session = {
          email: data[i][0],
          role: data[i][2],
          fullName: data[i][3],
          authenticated: true,
          loginTime: new Date().getTime()
        };

        // Update last login
        sheet.getRange(i + 1, 7).setValue(new Date());

        // Save session
        saveSession(session);

        // Log action
        logAction('ADMIN_LOGIN', email, `Successful login - Role: ${data[i][2]}`);

        return {
          success: true,
          session: session
        };
      }
    }

    logAction('ADMIN_LOGIN_FAILED', email, 'Invalid credentials');
    return {
      success: false,
      message: 'Invalid email or password'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Login failed: ' + error.message
    };
  }
}

function saveSession(session) {
  const cache = CacheService.getUserCache();
  cache.put('adminSession', JSON.stringify(session), 21600); // 6 hours
}

function getSession() {
  try {
    const cache = CacheService.getUserCache();
    const sessionData = cache.get('adminSession');
    if (sessionData) {
      return JSON.parse(sessionData);
    }
  } catch (error) {
    logAction('ERROR', 'System', `Session retrieval failed: ${error.message}`);
  }
  return null;
}

function logout() {
  const session = getSession();
  if (session) {
    logAction('ADMIN_LOGOUT', session.email, 'User logged out');
  }
  const cache = CacheService.getUserCache();
  cache.remove('adminSession');
  return {success: true};
}

function checkAuth() {
  const session = getSession();
  return {
    authenticated: session && session.authenticated,
    session: session
  };
}

// ==================== MEMBER MANAGEMENT ====================

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

function getMemberByEnrollment(enrollmentNo) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    // Try Individual sheet first
    let sheet = getSheet('Individual');
    let data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === enrollmentNo) {
        const member = {type: 'Individual', rowIndex: i + 1};
        data[0].forEach((header, index) => {
          member[header] = data[i][index];
        });
        return member;
      }
    }

    // Try Family sheet
    sheet = getSheet('Family');
    data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === enrollmentNo) {
        const member = {type: 'Family', rowIndex: i + 1};
        data[0].forEach((header, index) => {
          member[header] = data[i][index];
        });
        return member;
      }
    }

    return null;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get member: ${error.message}`);
    return null;
  }
}

function approveMember(enrollmentNo, notes) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const member = getMemberByEnrollment(enrollmentNo);
    if (!member) {
      throw new Error('Member not found');
    }

    const sheet = getSheet(member.type);
    const rowIndex = member.rowIndex;

    // Update status, approved by, approved date, and notes
    sheet.getRange(rowIndex, 3).setValue('Approved'); // Status
    sheet.getRange(rowIndex, 22).setValue(session.fullName); // ApprovedBy
    sheet.getRange(rowIndex, 23).setValue(new Date()); // ApprovedDate
    if (notes) {
      sheet.getRange(rowIndex, 24).setValue(notes); // Notes
    }

    // Send approval email
    sendApprovalEmail(member.Email, member.Name, enrollmentNo, member.type);

    // Log action
    logAction('MEMBER_APPROVED', session.email, `Approved ${enrollmentNo} - ${member.Name}`);

    return {
      success: true,
      message: 'Member approved successfully'
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to approve member: ${error.message}`);
    return {
      success: false,
      message: 'Failed to approve member: ' + error.message
    };
  }
}

function rejectMember(enrollmentNo, reason) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const member = getMemberByEnrollment(enrollmentNo);
    if (!member) {
      throw new Error('Member not found');
    }

    const sheet = getSheet(member.type);
    const rowIndex = member.rowIndex;

    // Update status and notes
    sheet.getRange(rowIndex, 3).setValue('Rejected'); // Status
    sheet.getRange(rowIndex, 22).setValue(session.fullName); // ApprovedBy
    sheet.getRange(rowIndex, 23).setValue(new Date()); // ApprovedDate
    sheet.getRange(rowIndex, 24).setValue(reason || 'Application rejected'); // Notes

    // Send rejection email
    sendRejectionEmail(member.Email, member.Name, enrollmentNo, reason);

    // Log action
    logAction('MEMBER_REJECTED', session.email, `Rejected ${enrollmentNo} - ${member.Name}`);

    return {
      success: true,
      message: 'Member rejected'
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to reject member: ${error.message}`);
    return {
      success: false,
      message: 'Failed to reject member: ' + error.message
    };
  }
}

// ==================== PAYMENT MANAGEMENT ====================

function recordPayment(paymentData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const member = getMemberByEnrollment(paymentData.enrollmentNo);
    if (!member) {
      throw new Error('Member not found');
    }

    // Generate receipt number
    const receiptNo = generateReceiptNo();

    // Update member record
    const sheet = getSheet(member.type);
    sheet.getRange(member.rowIndex, 19).setValue(paymentData.amount); // AmountPaid
    sheet.getRange(member.rowIndex, 20).setValue(paymentData.paymentMode); // PaymentMode
    sheet.getRange(member.rowIndex, 21).setValue(receiptNo); // ReceiptNo

    // Add to Payments sheet
    const paymentsSheet = getSheet('Payments');
    paymentsSheet.appendRow([
      new Date(),
      paymentData.enrollmentNo,
      member.Name,
      paymentData.amount,
      paymentData.paymentMode,
      paymentData.transactionRef || '',
      receiptNo,
      session.fullName,
      paymentData.notes || ''
    ]);

    // Send receipt email
    sendReceiptEmail(member.Email, member.Name, paymentData.enrollmentNo, paymentData.amount, receiptNo, member.type);

    // Log action
    logAction('PAYMENT_RECORDED', session.email, `Payment recorded for ${paymentData.enrollmentNo} - Amount: ${paymentData.amount}`);

    return {
      success: true,
      receiptNo: receiptNo,
      message: 'Payment recorded successfully'
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to record payment: ${error.message}`);
    return {
      success: false,
      message: 'Failed to record payment: ' + error.message
    };
  }
}

function generateReceiptNo() {
  const paymentsSheet = getSheet('Payments');
  const lastRow = paymentsSheet.getLastRow();

  let nextNumber = 1;
  if (lastRow > 1) {
    const receiptNumbers = paymentsSheet.getRange(2, 7, lastRow - 1, 1).getValues();
    const numbers = receiptNumbers
      .map(row => row[0])
      .filter(val => val && typeof val === 'string' && val.startsWith('REC2026-'))
      .map(val => parseInt(val.split('-')[1]))
      .filter(num => !isNaN(num));

    if (numbers.length > 0) {
      nextNumber = Math.max(...numbers) + 1;
    }
  }

  return `REC2026-${String(nextNumber).padStart(5, '0')}`;
}

function getPaymentHistory(enrollmentNo) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Payments');
    const data = sheet.getDataRange().getValues();

    const payments = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === enrollmentNo) {
        payments.push({
          timestamp: data[i][0],
          enrollmentNo: data[i][1],
          memberName: data[i][2],
          amount: data[i][3],
          paymentMode: data[i][4],
          transactionRef: data[i][5],
          receiptNo: data[i][6],
          recordedBy: data[i][7],
          notes: data[i][8]
        });
      }
    }

    return payments;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get payment history: ${error.message}`);
    return [];
  }
}

// ==================== EMAIL NOTIFICATIONS ====================

function sendConfirmationEmail(email, name, enrollmentNo, type) {
  try {
    const subject = `${CONFIG.ORGANIZATION} - Application Received`;
    const body = `
Dear ${name},

Thank you for submitting your ${type} membership application to ${CONFIG.ORGANIZATION}.

Your application has been received and is under review.

Enrollment Number: ${enrollmentNo}
Application Type: ${type} Membership
Session: ${CONFIG.SESSION}

You will receive an email notification once your application is approved. After approval, please complete the payment process to activate your membership.

Membership Fees:
- Individual Membership: ₹${CONFIG.INDIVIDUAL_FEE}
- Family Membership: ₹${CONFIG.FAMILY_FEE}

For any queries, please contact us at the organization office.

Best regards,
${CONFIG.ORGANIZATION}
    `;

    MailApp.sendEmail(email, subject, body);
  } catch (error) {
    logAction('ERROR', 'System', `Failed to send confirmation email to ${email}: ${error.message}`);
  }
}

function sendApprovalEmail(email, name, enrollmentNo, type) {
  try {
    const fee = type === 'Individual' ? CONFIG.INDIVIDUAL_FEE : CONFIG.FAMILY_FEE;
    const subject = `${CONFIG.ORGANIZATION} - Application Approved`;
    const body = `
Dear ${name},

Congratulations! Your ${type} membership application has been APPROVED.

Enrollment Number: ${enrollmentNo}
Application Type: ${type} Membership
Session: ${CONFIG.SESSION}

Next Steps:
1. Please complete your membership fee payment of ₹${fee}
2. Contact the treasurer or admin for payment details
3. You will receive an official receipt after payment confirmation

Payment can be made through:
- Bank Transfer
- UPI
- Cash (at office)

Welcome to ${CONFIG.ORGANIZATION}!

Best regards,
${CONFIG.ORGANIZATION}
    `;

    MailApp.sendEmail(email, subject, body);
  } catch (error) {
    logAction('ERROR', 'System', `Failed to send approval email to ${email}: ${error.message}`);
  }
}

function sendRejectionEmail(email, name, enrollmentNo, reason) {
  try {
    const subject = `${CONFIG.ORGANIZATION} - Application Status`;
    const body = `
Dear ${name},

Thank you for your interest in ${CONFIG.ORGANIZATION}.

After careful review, we regret to inform you that your membership application (${enrollmentNo}) could not be approved at this time.

${reason ? 'Reason: ' + reason : ''}

If you have any questions or would like to reapply, please contact us at the organization office.

Best regards,
${CONFIG.ORGANIZATION}
    `;

    MailApp.sendEmail(email, subject, body);
  } catch (error) {
    logAction('ERROR', 'System', `Failed to send rejection email to ${email}: ${error.message}`);
  }
}

function sendReceiptEmail(email, name, enrollmentNo, amount, receiptNo, type) {
  try {
    const subject = `${CONFIG.ORGANIZATION} - Payment Receipt (${receiptNo})`;
    const body = `
Dear ${name},

Thank you for your payment. Your membership is now ACTIVE!

PAYMENT RECEIPT

Receipt No: ${receiptNo}
Enrollment No: ${enrollmentNo}
Member Name: ${name}
Membership Type: ${type}
Amount Paid: ₹${amount}
Payment Date: ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd MMM yyyy')}
Session: ${CONFIG.SESSION}

Your membership benefits are now active. You can access all member services and participate in organization activities.

For any queries regarding this receipt, please contact the treasurer.

Best regards,
${CONFIG.ORGANIZATION}
    `;

    MailApp.sendEmail(email, subject, body);
  } catch (error) {
    logAction('ERROR', 'System', `Failed to send receipt email to ${email}: ${error.message}`);
  }
}

// ==================== SEARCH & FILTER ====================

function searchMembers(query) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const results = [];
    const searchLower = query.toLowerCase();

    // Search in Individual sheet
    const individualMembers = getMembers('Individual');
    individualMembers.forEach(member => {
      if (member.Name.toLowerCase().includes(searchLower) ||
          member.EnrollmentNo.toLowerCase().includes(searchLower) ||
          member.Email.toLowerCase().includes(searchLower) ||
          member.Phone.includes(query)) {
        results.push({...member, type: 'Individual'});
      }
    });

    // Search in Family sheet
    const familyMembers = getMembers('Family');
    familyMembers.forEach(member => {
      if (member.Name.toLowerCase().includes(searchLower) ||
          member.EnrollmentNo.toLowerCase().includes(searchLower) ||
          member.Email.toLowerCase().includes(searchLower) ||
          member.Phone.includes(query)) {
        results.push({...member, type: 'Family'});
      }
    });

    return results;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Search failed: ${error.message}`);
    return [];
  }
}

// ==================== DATA EXPORT ====================

function exportToExcel(type, status) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(type);
    const data = sheet.getDataRange().getValues();

    // Filter by status if provided
    let exportData = data;
    if (status) {
      const statusIndex = data[0].indexOf('Status');
      exportData = [data[0]];
      for (let i = 1; i < data.length; i++) {
        if (data[i][statusIndex] === status) {
          exportData.push(data[i]);
        }
      }
    }

    // Create new spreadsheet for export
    const ss = SpreadsheetApp.create(`KSO_${type}_Export_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')}`);
    const exportSheet = ss.getActiveSheet();
    exportSheet.getRange(1, 1, exportData.length, exportData[0].length).setValues(exportData);

    // Format header
    exportSheet.getRange(1, 1, 1, exportData[0].length).setFontWeight('bold').setBackground('#4B5563').setFontColor('#FFFFFF');

    logAction('DATA_EXPORT', session.email, `Exported ${type} members (${status || 'all'})`);

    return {
      success: true,
      url: ss.getUrl(),
      message: 'Data exported successfully'
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Export failed: ${error.message}`);
    return {
      success: false,
      message: 'Export failed: ' + error.message
    };
  }
}

// ==================== STATISTICS & DASHBOARD ====================

function getDashboardStats() {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const individualMembers = getMembers('Individual');
    const familyMembers = getMembers('Family');

    const stats = {
      totalMembers: individualMembers.length + familyMembers.length,
      individualMembers: individualMembers.length,
      familyMembers: familyMembers.length,
      pendingApprovals: 0,
      approvedMembers: 0,
      rejectedMembers: 0,
      totalRevenue: 0,
      pendingPayments: 0
    };

    [...individualMembers, ...familyMembers].forEach(member => {
      if (member.Status === 'Pending') stats.pendingApprovals++;
      if (member.Status === 'Approved') stats.approvedMembers++;
      if (member.Status === 'Rejected') stats.rejectedMembers++;

      if (member.AmountPaid > 0) {
        stats.totalRevenue += Number(member.AmountPaid);
      } else if (member.Status === 'Approved') {
        stats.pendingPayments++;
      }
    });

    // Get recent activities
    const logsSheet = getSheet('Logs');
    const logsData = logsSheet.getDataRange().getValues();
    const recentActivities = [];

    for (let i = Math.max(1, logsData.length - 10); i < logsData.length; i++) {
      recentActivities.push({
        timestamp: logsData[i][0],
        action: logsData[i][1],
        user: logsData[i][2],
        details: logsData[i][3]
      });
    }

    return {
      stats: stats,
      recentActivities: recentActivities.reverse()
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get dashboard stats: ${error.message}`);
    return null;
  }
}

// ==================== LOGGING ====================

function logAction(action, user, details) {
  try {
    const sheet = getSheet('Logs');
    sheet.appendRow([
      new Date(),
      action,
      user,
      details,
      '' // IPAddress (not available in Apps Script)
    ]);
  } catch (error) {
    console.error('Logging failed:', error);
  }
}

// ==================== ENHANCED FEATURES ====================

// Feature 1: Event Management
function createEvent(eventData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Events');
    const eventID = 'EVT' + Date.now();

    sheet.appendRow([
      eventID,
      eventData.eventName,
      eventData.eventDate,
      eventData.location,
      eventData.description,
      session.fullName,
      'Active',
      new Date()
    ]);

    logAction('EVENT_CREATED', session.email, `Created event: ${eventData.eventName}`);

    return {success: true, eventID: eventID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function getEvents(status) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Events');
    const data = sheet.getDataRange().getValues();
    const events = [];

    for (let i = 1; i < data.length; i++) {
      if (!status || data[i][6] === status) {
        events.push({
          eventID: data[i][0],
          eventName: data[i][1],
          eventDate: data[i][2],
          location: data[i][3],
          description: data[i][4],
          organizer: data[i][5],
          status: data[i][6],
          createdDate: data[i][7]
        });
      }
    }

    return events;
  } catch (error) {
    return [];
  }
}

// Feature 2: Attendance Tracking
function recordAttendance(attendanceData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Attendance');
    const attendanceID = 'ATT' + Date.now();

    sheet.appendRow([
      attendanceID,
      attendanceData.eventID,
      attendanceData.enrollmentNo,
      attendanceData.memberName,
      new Date(),
      attendanceData.checkOutTime || '',
      'Present'
    ]);

    logAction('ATTENDANCE_RECORDED', session.email, `Attendance: ${attendanceData.memberName} at ${attendanceData.eventID}`);

    return {success: true, attendanceID: attendanceID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function getEventAttendance(eventID) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Attendance');
    const data = sheet.getDataRange().getValues();
    const attendance = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === eventID) {
        attendance.push({
          attendanceID: data[i][0],
          enrollmentNo: data[i][2],
          memberName: data[i][3],
          checkInTime: data[i][4],
          checkOutTime: data[i][5],
          status: data[i][6]
        });
      }
    }

    return attendance;
  } catch (error) {
    return [];
  }
}

// Feature 3: Announcements
function createAnnouncement(announcementData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Announcements');
    const announcementID = 'ANN' + Date.now();

    sheet.appendRow([
      announcementID,
      announcementData.title,
      announcementData.content,
      announcementData.priority || 'Normal',
      session.fullName,
      new Date(),
      announcementData.expiryDate || '',
      true
    ]);

    logAction('ANNOUNCEMENT_CREATED', session.email, `Created: ${announcementData.title}`);

    return {success: true, announcementID: announcementID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function getAnnouncements(activeOnly) {
  try {
    const sheet = getSheet('Announcements');
    const data = sheet.getDataRange().getValues();
    const announcements = [];

    for (let i = 1; i < data.length; i++) {
      if (!activeOnly || data[i][7] === true) {
        announcements.push({
          announcementID: data[i][0],
          title: data[i][1],
          content: data[i][2],
          priority: data[i][3],
          postedBy: data[i][4],
          postedDate: data[i][5],
          expiryDate: data[i][6],
          active: data[i][7]
        });
      }
    }

    return announcements;
  } catch (error) {
    return [];
  }
}

// Feature 4: Document Management
function uploadDocument(documentData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Documents');
    const documentID = 'DOC' + Date.now();

    sheet.appendRow([
      documentID,
      documentData.title,
      documentData.description,
      documentData.fileURL,
      documentData.category,
      session.fullName,
      new Date(),
      documentData.accessLevel || 'Members'
    ]);

    logAction('DOCUMENT_UPLOADED', session.email, `Uploaded: ${documentData.title}`);

    return {success: true, documentID: documentID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function getDocuments(category) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Documents');
    const data = sheet.getDataRange().getValues();
    const documents = [];

    for (let i = 1; i < data.length; i++) {
      if (!category || data[i][4] === category) {
        documents.push({
          documentID: data[i][0],
          title: data[i][1],
          description: data[i][2],
          fileURL: data[i][3],
          category: data[i][4],
          uploadedBy: data[i][5],
          uploadDate: data[i][6],
          accessLevel: data[i][7]
        });
      }
    }

    return documents;
  } catch (error) {
    return [];
  }
}

// Feature 5: Committee Management
function assignCommittee(committeeData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Committees');
    const committeeID = 'COM' + Date.now();

    sheet.appendRow([
      committeeID,
      committeeData.committeeName,
      committeeData.enrollmentNo,
      committeeData.memberName,
      committeeData.position,
      committeeData.startDate,
      committeeData.endDate || '',
      true
    ]);

    logAction('COMMITTEE_ASSIGNED', session.email, `${committeeData.memberName} assigned to ${committeeData.committeeName}`);

    return {success: true, committeeID: committeeID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function getCommitteeMembers(committeeName) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Committees');
    const data = sheet.getDataRange().getValues();
    const members = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === true && (!committeeName || data[i][1] === committeeName)) {
        members.push({
          committeeID: data[i][0],
          committeeName: data[i][1],
          enrollmentNo: data[i][2],
          memberName: data[i][3],
          position: data[i][4],
          startDate: data[i][5],
          endDate: data[i][6],
          active: data[i][7]
        });
      }
    }

    return members;
  } catch (error) {
    return [];
  }
}

// Feature 6: Membership Renewal
function createRenewal(renewalData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Renewals');
    const renewalID = 'REN' + Date.now();

    sheet.appendRow([
      renewalID,
      renewalData.enrollmentNo,
      renewalData.memberName,
      new Date(),
      renewalData.expiryDate,
      renewalData.amount,
      'Pending',
      ''
    ]);

    logAction('RENEWAL_CREATED', session.email, `Renewal for ${renewalData.enrollmentNo}`);

    return {success: true, renewalID: renewalID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

// Feature 7: Donation Tracking
function recordDonation(donationData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Donations');
    const donationID = 'DON' + Date.now();
    const receiptNo = 'DONREC' + Date.now();

    sheet.appendRow([
      donationID,
      donationData.donorName,
      donationData.enrollmentNo || '',
      donationData.amount,
      donationData.purpose,
      new Date(),
      donationData.paymentMode,
      receiptNo
    ]);

    logAction('DONATION_RECORDED', session.email, `Donation: ₹${donationData.amount} from ${donationData.donorName}`);

    return {success: true, donationID: donationID, receiptNo: receiptNo};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

// Feature 8: Certificate Generation
function generateCertificate(certificateData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Certificates');
    const certificateID = 'CERT' + Date.now();

    sheet.appendRow([
      certificateID,
      certificateData.enrollmentNo,
      certificateData.memberName,
      certificateData.certificateType,
      new Date(),
      certificateData.fileURL || '',
      session.fullName
    ]);

    logAction('CERTIFICATE_GENERATED', session.email, `${certificateData.certificateType} for ${certificateData.memberName}`);

    return {success: true, certificateID: certificateID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

// Feature 9: Skills Database
function addMemberSkill(skillData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Skills');
    const skillID = 'SKL' + Date.now();

    sheet.appendRow([
      skillID,
      skillData.enrollmentNo,
      skillData.memberName,
      skillData.skillName,
      skillData.proficiencyLevel,
      skillData.yearsExperience,
      skillData.certification || ''
    ]);

    logAction('SKILL_ADDED', session.email, `${skillData.skillName} added for ${skillData.memberName}`);

    return {success: true, skillID: skillID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function searchSkills(skillName) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Skills');
    const data = sheet.getDataRange().getValues();
    const skills = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][3].toLowerCase().includes(skillName.toLowerCase())) {
        skills.push({
          skillID: data[i][0],
          enrollmentNo: data[i][1],
          memberName: data[i][2],
          skillName: data[i][3],
          proficiencyLevel: data[i][4],
          yearsExperience: data[i][5],
          certification: data[i][6]
        });
      }
    }

    return skills;
  } catch (error) {
    return [];
  }
}

// Feature 10: Job Board
function postJob(jobData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Jobs');
    const jobID = 'JOB' + Date.now();

    sheet.appendRow([
      jobID,
      jobData.jobTitle,
      jobData.company,
      jobData.description,
      session.fullName,
      new Date(),
      jobData.expiryDate,
      jobData.contactEmail,
      true
    ]);

    logAction('JOB_POSTED', session.email, `Job posted: ${jobData.jobTitle} at ${jobData.company}`);

    return {success: true, jobID: jobID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function getActiveJobs() {
  try {
    const sheet = getSheet('Jobs');
    const data = sheet.getDataRange().getValues();
    const jobs = [];
    const today = new Date();

    for (let i = 1; i < data.length; i++) {
      const expiryDate = new Date(data[i][6]);
      if (data[i][8] === true && expiryDate >= today) {
        jobs.push({
          jobID: data[i][0],
          jobTitle: data[i][1],
          company: data[i][2],
          description: data[i][3],
          postedBy: data[i][4],
          postedDate: data[i][5],
          expiryDate: data[i][6],
          contactEmail: data[i][7],
          active: data[i][8]
        });
      }
    }

    return jobs;
  } catch (error) {
    return [];
  }
}

// Feature 11: Volunteer Hours Tracking
function recordVolunteerHours(volunteerData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Volunteers');
    const volunteerID = 'VOL' + Date.now();

    sheet.appendRow([
      volunteerID,
      volunteerData.enrollmentNo,
      volunteerData.memberName,
      volunteerData.activity,
      volunteerData.hours,
      volunteerData.date,
      volunteerData.supervisor,
      volunteerData.notes || ''
    ]);

    logAction('VOLUNTEER_HOURS', session.email, `${volunteerData.hours}h logged for ${volunteerData.memberName}`);

    return {success: true, volunteerID: volunteerID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function getMemberVolunteerHours(enrollmentNo) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Volunteers');
    const data = sheet.getDataRange().getValues();
    let totalHours = 0;
    const activities = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === enrollmentNo) {
        totalHours += Number(data[i][4]);
        activities.push({
          volunteerID: data[i][0],
          activity: data[i][3],
          hours: data[i][4],
          date: data[i][5],
          supervisor: data[i][6],
          notes: data[i][7]
        });
      }
    }

    return {totalHours: totalHours, activities: activities};
  } catch (error) {
    return {totalHours: 0, activities: []};
  }
}

// Feature 12: Poll/Voting System
function createPoll(pollData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Polls');
    const pollID = 'POLL' + Date.now();

    sheet.appendRow([
      pollID,
      pollData.question,
      JSON.stringify(pollData.options),
      session.fullName,
      new Date(),
      pollData.expiryDate,
      true
    ]);

    logAction('POLL_CREATED', session.email, `Poll created: ${pollData.question}`);

    return {success: true, pollID: pollID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function castVote(voteData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    // Check if already voted
    const votesSheet = getSheet('PollVotes');
    const votesData = votesSheet.getDataRange().getValues();

    for (let i = 1; i < votesData.length; i++) {
      if (votesData[i][1] === voteData.pollID && votesData[i][2] === voteData.enrollmentNo) {
        return {success: false, message: 'You have already voted in this poll'};
      }
    }

    const voteID = 'VOTE' + Date.now();
    votesSheet.appendRow([
      voteID,
      voteData.pollID,
      voteData.enrollmentNo,
      voteData.selectedOption,
      new Date()
    ]);

    logAction('VOTE_CAST', session.email, `Vote in poll ${voteData.pollID}`);

    return {success: true, voteID: voteID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function getPollResults(pollID) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const votesSheet = getSheet('PollVotes');
    const votesData = votesSheet.getDataRange().getValues();
    const results = {};
    let totalVotes = 0;

    for (let i = 1; i < votesData.length; i++) {
      if (votesData[i][1] === pollID) {
        const option = votesData[i][3];
        results[option] = (results[option] || 0) + 1;
        totalVotes++;
      }
    }

    return {results: results, totalVotes: totalVotes};
  } catch (error) {
    return {results: {}, totalVotes: 0};
  }
}

// Feature 13: Meeting Minutes
function saveMeetingMinutes(meetingData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Meetings');
    const meetingID = 'MTG' + Date.now();

    sheet.appendRow([
      meetingID,
      meetingData.title,
      meetingData.date,
      meetingData.location,
      meetingData.agenda,
      meetingData.minutes,
      meetingData.attendees,
      session.fullName
    ]);

    logAction('MEETING_RECORDED', session.email, `Meeting: ${meetingData.title}`);

    return {success: true, meetingID: meetingID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

// Feature 14: Birthday Reminders
function getBirthdaysThisMonth() {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const currentMonth = new Date().getMonth();
    const birthdays = [];

    // Check Individual members
    const individualMembers = getMembers('Individual', 'Approved');
    individualMembers.forEach(member => {
      if (member.DOB) {
        const dobDate = new Date(member.DOB);
        if (dobDate.getMonth() === currentMonth) {
          birthdays.push({
            name: member.Name,
            enrollmentNo: member.EnrollmentNo,
            dob: member.DOB,
            email: member.Email,
            type: 'Individual'
          });
        }
      }
    });

    // Check Family members
    const familyMembers = getMembers('Family', 'Approved');
    familyMembers.forEach(member => {
      if (member.DOB) {
        const dobDate = new Date(member.DOB);
        if (dobDate.getMonth() === currentMonth) {
          birthdays.push({
            name: member.Name,
            enrollmentNo: member.EnrollmentNo,
            dob: member.DOB,
            email: member.Email,
            type: 'Family'
          });
        }
      }
    });

    return birthdays;
  } catch (error) {
    return [];
  }
}

// Feature 15: Bulk Email/SMS System
function sendBulkEmail(emailData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const recipients = emailData.recipients; // Array of enrollment numbers or 'all'
    let emailList = [];

    if (recipients === 'all') {
      const individualMembers = getMembers('Individual', 'Approved');
      const familyMembers = getMembers('Family', 'Approved');
      emailList = [...individualMembers, ...familyMembers].map(m => ({email: m.Email, name: m.Name}));
    } else {
      recipients.forEach(enrollmentNo => {
        const member = getMemberByEnrollment(enrollmentNo);
        if (member) {
          emailList.push({email: member.Email, name: member.Name});
        }
      });
    }

    // Send emails
    emailList.forEach(recipient => {
      try {
        MailApp.sendEmail(
          recipient.email,
          emailData.subject,
          emailData.body.replace('{{name}}', recipient.name)
        );
      } catch (e) {
        console.error(`Failed to send email to ${recipient.email}:`, e);
      }
    });

    logAction('BULK_EMAIL', session.email, `Sent to ${emailList.length} recipients: ${emailData.subject}`);

    return {success: true, sent: emailList.length};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

// Feature 16: Member Directory (Public/Private)
function getMemberDirectory(publicOnly) {
  try {
    const session = getSession();

    const individualMembers = getMembers('Individual', 'Approved');
    const familyMembers = getMembers('Family', 'Approved');

    const directory = [...individualMembers, ...familyMembers].map(member => {
      if (publicOnly) {
        return {
          name: member.Name,
          enrollmentNo: member.EnrollmentNo,
          institution: member.Institution,
          course: member.Course
        };
      } else {
        return {
          name: member.Name,
          enrollmentNo: member.EnrollmentNo,
          email: member.Email,
          phone: member.Phone,
          institution: member.Institution,
          course: member.Course,
          residentialAddress: member.ResidentialAddress,
          photoURL: member.PhotoURL
        };
      }
    });

    return directory;
  } catch (error) {
    return [];
  }
}

// Feature 17: Fee Structure Management
function updateFeeStructure(feeData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated || session.role !== 'Admin') {
      throw new Error('Unauthorized - Admin only');
    }

    const sheet = getSheet('Settings');
    const data = sheet.getDataRange().getValues();

    // Find and update or create
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === feeData.key) {
        sheet.getRange(i + 1, 2).setValue(feeData.value);
        sheet.getRange(i + 1, 4).setValue(new Date());
        found = true;
        break;
      }
    }

    if (!found) {
      sheet.appendRow([feeData.key, feeData.value, feeData.description, new Date()]);
    }

    logAction('SETTINGS_UPDATE', session.email, `Updated ${feeData.key}: ${feeData.value}`);

    return {success: true};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

// Feature 18: ID Card Generation (Data)
function generateMemberIDCard(enrollmentNo) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const member = getMemberByEnrollment(enrollmentNo);
    if (!member || member.Status !== 'Approved') {
      throw new Error('Member not found or not approved');
    }

    // Generate QR code data
    const qrData = `KSO:${enrollmentNo}:${member.Name}:${CONFIG.SESSION}`;

    logAction('ID_CARD_GENERATED', session.email, `ID Card for ${enrollmentNo}`);

    return {
      success: true,
      idCardData: {
        enrollmentNo: member.EnrollmentNo,
        name: member.Name,
        photoURL: member.PhotoURL,
        institution: member.Institution,
        course: member.Course,
        validUntil: '31 March 2027',
        qrData: qrData
      }
    };
  } catch (error) {
    return {success: false, message: error.message};
  }
}

// Feature 19: Data Backup
function createBackup() {
  try {
    const session = getSession();
    if (!session || !session.authenticated || session.role !== 'Admin') {
      throw new Error('Unauthorized - Admin only');
    }

    const ss = getSpreadsheet();
    const backupName = `KSO_Backup_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')}`;
    const backupFile = ss.copy(backupName);

    logAction('BACKUP_CREATED', session.email, `Backup created: ${backupName}`);

    return {
      success: true,
      backupURL: backupFile.getUrl(),
      backupName: backupName
    };
  } catch (error) {
    return {success: false, message: error.message};
  }
}

// Feature 20: Analytics & Reports
function generateAnalyticsReport() {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const stats = getDashboardStats();

    // Additional analytics
    const individualMembers = getMembers('Individual');
    const familyMembers = getMembers('Family');

    // Gender distribution
    const genderStats = {male: 0, female: 0, other: 0};
    [...individualMembers, ...familyMembers].forEach(member => {
      const gender = member.Gender?.toLowerCase();
      if (gender === 'male') genderStats.male++;
      else if (gender === 'female') genderStats.female++;
      else genderStats.other++;
    });

    // Institution distribution
    const institutionStats = {};
    [...individualMembers, ...familyMembers].forEach(member => {
      const inst = member.Institution || 'Not Specified';
      institutionStats[inst] = (institutionStats[inst] || 0) + 1;
    });

    // Payment status
    const paymentStats = {
      paid: 0,
      pending: 0,
      totalRevenue: 0
    };

    [...individualMembers, ...familyMembers].forEach(member => {
      if (member.Status === 'Approved') {
        if (member.AmountPaid > 0) {
          paymentStats.paid++;
          paymentStats.totalRevenue += Number(member.AmountPaid);
        } else {
          paymentStats.pending++;
        }
      }
    });

    return {
      overview: stats.stats,
      genderDistribution: genderStats,
      institutionDistribution: institutionStats,
      paymentStatus: paymentStats,
      generatedAt: new Date()
    };
  } catch (error) {
    return null;
  }
}

// ==================== ADMIN MANAGEMENT ====================

function createAdmin(adminData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated || session.role !== 'Admin') {
      throw new Error('Unauthorized - Admin only');
    }

    const sheet = getSheet('Admins');

    // Check if admin already exists
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === adminData.email) {
        return {success: false, message: 'Admin already exists'};
      }
    }

    const activeTerm = getActiveTerm();

    sheet.appendRow([
      adminData.email,
      adminData.password,
      adminData.role,
      adminData.designation || adminData.role, // Designation (can be custom)
      adminData.fullName,
      adminData.term || activeTerm, // Term
      true, // Active
      new Date(),
      '' // LastLogin
    ]);

    logAction('ADMIN_CREATED', session.email, `New admin: ${adminData.email} (${adminData.role}/${adminData.designation})`);

    return {success: true, message: 'Admin created successfully'};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

// ==================== TERM MANAGEMENT FUNCTIONS ====================

function createTerm(termData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated || session.role !== 'Admin') {
      throw new Error('Unauthorized - Admin only');
    }

    const sheet = getSheet('Terms');
    const termID = 'TERM' + termData.startYear;

    // Check if term already exists
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === termData.termName) {
        return {success: false, message: 'Term already exists'};
      }
    }

    sheet.appendRow([
      termID,
      termData.termName,
      new Date(termData.startDate),
      new Date(termData.endDate),
      false, // Not active by default
      new Date(),
      session.fullName
    ]);

    logAction('TERM_CREATED', session.email, `New term created: ${termData.termName}`);

    return {success: true, message: 'Term created successfully', termID: termID};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function setActiveTerm(termName) {
  try {
    const session = getSession();
    if (!session || !session.authenticated || session.role !== 'Admin') {
      throw new Error('Unauthorized - Admin only');
    }

    const sheet = getSheet('Terms');
    const data = sheet.getDataRange().getValues();

    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === termName) {
        sheet.getRange(i + 1, 5).setValue(true); // Set active
        found = true;
      } else {
        sheet.getRange(i + 1, 5).setValue(false); // Deactivate others
      }
    }

    if (!found) {
      return {success: false, message: 'Term not found'};
    }

    // Update Settings sheet
    const settingsSheet = getSheet('Settings');
    const settingsData = settingsSheet.getDataRange().getValues();
    for (let i = 1; i < settingsData.length; i++) {
      if (settingsData[i][0] === 'SESSION') {
        settingsSheet.getRange(i + 1, 2).setValue(termName);
        settingsSheet.getRange(i + 1, 4).setValue(new Date());
        break;
      }
    }

    logAction('TERM_ACTIVATED', session.email, `Term activated: ${termName}`);

    return {success: true, message: `Term ${termName} is now active`};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function getAllTerms() {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Terms');
    const data = sheet.getDataRange().getValues();
    const terms = [];

    for (let i = 1; i < data.length; i++) {
      terms.push({
        termID: data[i][0],
        termName: data[i][1],
        startDate: data[i][2],
        endDate: data[i][3],
        active: data[i][4],
        createdDate: data[i][5],
        createdBy: data[i][6]
      });
    }

    return terms;
  } catch (error) {
    return [];
  }
}

// ==================== ENHANCED ADMIN MANAGEMENT ====================

function getAllAdmins() {
  try {
    const session = getSession();
    if (!session || !session.authenticated || session.role !== 'Admin') {
      throw new Error('Unauthorized - Admin only');
    }

    const sheet = getSheet('Admins');
    const data = sheet.getDataRange().getValues();
    const admins = [];

    for (let i = 1; i < data.length; i++) {
      admins.push({
        email: data[i][0],
        role: data[i][2],
        designation: data[i][3],
        fullName: data[i][4],
        term: data[i][5],
        active: data[i][6],
        createdDate: data[i][7],
        lastLogin: data[i][8],
        rowIndex: i + 1
      });
    }

    return admins;
  } catch (error) {
    return [];
  }
}

function updateAdmin(email, updateData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated || session.role !== 'Admin') {
      throw new Error('Unauthorized - Admin only');
    }

    const sheet = getSheet('Admins');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        if (updateData.role) sheet.getRange(i + 1, 3).setValue(updateData.role);
        if (updateData.designation) sheet.getRange(i + 1, 4).setValue(updateData.designation);
        if (updateData.fullName) sheet.getRange(i + 1, 5).setValue(updateData.fullName);
        if (updateData.term) sheet.getRange(i + 1, 6).setValue(updateData.term);
        if (updateData.hasOwnProperty('active')) sheet.getRange(i + 1, 7).setValue(updateData.active);

        logAction('ADMIN_UPDATED', session.email, `Admin updated: ${email}`);
        return {success: true, message: 'Admin updated successfully'};
      }
    }

    return {success: false, message: 'Admin not found'};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function deleteAdmin(email) {
  try {
    const session = getSession();
    if (!session || !session.authenticated || session.role !== 'Admin') {
      throw new Error('Unauthorized - Admin only');
    }

    if (email === session.email) {
      return {success: false, message: 'Cannot delete your own admin account'};
    }

    const sheet = getSheet('Admins');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        sheet.deleteRow(i + 1);
        logAction('ADMIN_DELETED', session.email, `Admin deleted: ${email}`);
        return {success: true, message: 'Admin deleted successfully'};
      }
    }

    return {success: false, message: 'Admin not found'};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function changeAdminPassword(email, newPassword) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    // Only allow changing own password or Admin role can change others
    if (email !== session.email && session.role !== 'Admin') {
      throw new Error('Unauthorized - Can only change own password');
    }

    const sheet = getSheet('Admins');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        sheet.getRange(i + 1, 2).setValue(newPassword);
        logAction('PASSWORD_CHANGED', session.email, `Password changed for: ${email}`);
        return {success: true, message: 'Password changed successfully'};
      }
    }

    return {success: false, message: 'Admin not found'};
  } catch (error) {
    return {success: false, message: error.message};
  }
}

function getAdminsByTerm(termName) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet('Admins');
    const data = sheet.getDataRange().getValues();
    const admins = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][5] === termName) {
        admins.push({
          email: data[i][0],
          role: data[i][2],
          designation: data[i][3],
          fullName: data[i][4],
          active: data[i][6]
        });
      }
    }

    return admins;
  } catch (error) {
    return [];
  }
}

// ==================== MEMBER MANAGEMENT BY TERM ====================

function getMembersByTerm(memberType, termName) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(memberType); // 'Individual' or 'Family'
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const termIndex = headers.indexOf('Term');

    if (termIndex === -1) {
      // If Term column doesn't exist, return all members
      return getAllMembers(memberType);
    }

    const members = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][termIndex] === termName || (termName === 'All' && data[i][termIndex])) {
        const member = {};
        headers.forEach((header, index) => {
          member[header] = data[i][index];
        });
        members.push(member);
      }
    }

    return members;
  } catch (error) {
    console.error('Error getting members by term:', error);
    return [];
  }
}

function getAllMembers(memberType) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(memberType);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const members = [];

    for (let i = 1; i < data.length; i++) {
      const member = {};
      headers.forEach((header, index) => {
        member[header] = data[i][index];
      });
      members.push(member);
    }

    return members;
  } catch (error) {
    console.error('Error getting all members:', error);
    return [];
  }
}

function getTermStatistics(termName) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const individualMembers = getMembersByTerm('Individual', termName);
    const familyMembers = getMembersByTerm('Family', termName);

    const individualApproved = individualMembers.filter(m => m.Status === 'Approved').length;
    const individualPending = individualMembers.filter(m => m.Status === 'Pending').length;
    const familyApproved = familyMembers.filter(m => m.Status === 'Approved').length;
    const familyPending = familyMembers.filter(m => m.Status === 'Pending').length;

    const totalRevenue = [...individualMembers, ...familyMembers]
      .reduce((sum, m) => sum + (parseFloat(m.AmountPaid) || 0), 0);

    return {
      success: true,
      termName: termName,
      statistics: {
        totalIndividual: individualMembers.length,
        individualApproved: individualApproved,
        individualPending: individualPending,
        totalFamily: familyMembers.length,
        familyApproved: familyApproved,
        familyPending: familyPending,
        totalMembers: individualMembers.length + familyMembers.length,
        totalRevenue: totalRevenue
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==================== INITIALIZATION ====================

function initializeDatabase() {
  const sheetNames = [
    'Individual', 'Family', 'Payments', 'Admins', 'Terms', 'Settings', 'Logs',
    'Events', 'Attendance', 'Announcements', 'Documents', 'Committees',
    'Renewals', 'Donations', 'Certificates', 'Skills', 'Jobs',
    'Volunteers', 'Polls', 'PollVotes', 'Meetings'
  ];

  sheetNames.forEach(sheetName => {
    getSheet(sheetName);
  });

  // Create default term if not exists
  const termsSheet = getSheet('Terms');
  if (termsSheet.getLastRow() <= 1) {
    termsSheet.appendRow([
      'TERM2026',
      '2026-2027',
      new Date('2026-04-01'),
      new Date('2027-03-31'),
      true, // Active
      new Date(),
      'System'
    ]);
  }

  // Create default admin if not exists
  const adminsSheet = getSheet('Admins');
  if (adminsSheet.getLastRow() <= 1) {
    adminsSheet.appendRow([
      'admin@ksocandigarh.org',
      'admin123',
      'Admin',
      'System Administrator', // Designation
      'System Administrator', // FullName
      '2026-2027', // Term
      true,
      new Date(),
      ''
    ]);
  }

  // Set default settings
  const settingsSheet = getSheet('Settings');
  if (settingsSheet.getLastRow() <= 1) {
    settingsSheet.appendRow(['INDIVIDUAL_FEE', '500', 'Individual membership fee', new Date()]);
    settingsSheet.appendRow(['FAMILY_FEE', '1500', 'Family membership fee', new Date()]);
    settingsSheet.appendRow(['SESSION', '2026-2027', 'Current session', new Date()]);
  }

  logAction('SYSTEM_INIT', 'System', 'Database initialized');

  return 'Database initialized successfully!';
}

// ==================== DATA MIGRATION ====================

/**
 * Migration function to add Term column to existing member records
 * Run this once after updating to the new version with term support
 */
function migrateAddTermColumn() {
  try {
    const activeTerm = getActiveTerm();
    const sheets = ['Individual', 'Family'];
    let totalMigrated = 0;

    sheets.forEach(sheetName => {
      const sheet = getSheet(sheetName);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      // Check if Term column already exists
      const termIndex = headers.indexOf('Term');

      if (termIndex === -1) {
        // Add Term header
        headers.push('Term');
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

        // Add Term value to all existing rows
        const termColumnIndex = headers.length;
        for (let i = 1; i < data.length; i++) {
          sheet.getRange(i + 1, termColumnIndex).setValue(activeTerm);
          totalMigrated++;
        }

        Logger.log(`Added Term column to ${sheetName} sheet with ${data.length - 1} records`);
      } else {
        // Term column exists, fill empty Term values
        const emptyTermRows = [];
        for (let i = 1; i < data.length; i++) {
          if (!data[i][termIndex]) {
            emptyTermRows.push(i + 1);
            sheet.getRange(i + 1, termIndex + 1).setValue(activeTerm);
            totalMigrated++;
          }
        }

        if (emptyTermRows.length > 0) {
          Logger.log(`Filled ${emptyTermRows.length} empty Term values in ${sheetName} sheet`);
        } else {
          Logger.log(`No migration needed for ${sheetName} sheet - all records have Term values`);
        }
      }
    });

    Logger.log(`Migration completed: ${totalMigrated} records updated with term "${activeTerm}"`);
    return {
      success: true,
      message: `Successfully migrated ${totalMigrated} records to term "${activeTerm}"`,
      totalMigrated: totalMigrated
    };
  } catch (error) {
    Logger.log('Migration error: ' + error.message);
    return {
      success: false,
      message: 'Migration failed: ' + error.message
    };
  }
}
