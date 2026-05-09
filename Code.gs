const APP = {
  ORG_NAME: 'Kuki Students’ Organisation (KSO) Chandigarh',
  SESSION: '2026-2027',
  SHEETS: {
    INDIVIDUAL: 'Individual',
    FAMILY: 'Family',
    PAYMENTS: 'Payments',
    ADMINS: 'Admins',
    SETTINGS: 'Settings',
    LOGS: 'Logs'
  },
  ROLES: ['Admin', 'President', 'General Secretary', 'Treasurer'],
  TOKEN_TTL_SECONDS: 60 * 60 * 8,
  DEFAULT_PHOTO_FOLDER_KEY: 'PHOTO_FOLDER_ID'
};

const INDIVIDUAL_HEADERS = [
  'Timestamp', 'EnrollmentNo', 'Status', 'Name', 'FatherName', 'MotherName', 'Gender', 'DOB', 'MaritalStatus',
  'Email', 'Phone', 'Course', 'Institution', 'LocalGuardian', 'OfficeAddress', 'ResidentialAddress',
  'PermanentAddress', 'PhotoURL', 'AmountPaid', 'PaymentMode', 'ReceiptNo', 'ApprovedBy', 'ApprovedDate', 'Notes'
];

const FAMILY_HEADERS = INDIVIDUAL_HEADERS.concat([
  'Relative1_Name', 'Relative1_Relation',
  'Relative2_Name', 'Relative2_Relation',
  'Relative3_Name', 'Relative3_Relation',
  'Relative4_Name', 'Relative4_Relation'
]);

const PAYMENT_HEADERS = [
  'Timestamp', 'EnrollmentNo', 'MemberType', 'Name', 'Amount', 'PaymentMode', 'ReceiptNo', 'RecordedBy', 'Notes'
];

const ADMIN_HEADERS = ['Email', 'Password', 'Role', 'FullName', 'Active'];
const SETTINGS_HEADERS = ['Key', 'Value'];
const LOG_HEADERS = ['Timestamp', 'ActorEmail', 'Action', 'Details'];

function doGet(e) {
  initializeSheets();
  const page = (e && e.parameter && e.parameter.page ? e.parameter.page : 'home').toLowerCase();
  const fileByPage = {
    home: 'Home',
    individual: 'FormIndividual',
    family: 'FormFamily',
    login: 'Login',
    dashboard: 'Dashboard'
  };

  const file = fileByPage[page] || 'Home';
  return HtmlService.createTemplateFromFile(file)
    .evaluate()
    .setTitle(`${APP.ORG_NAME} Portal`)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet(ss, APP.SHEETS.INDIVIDUAL, INDIVIDUAL_HEADERS);
  ensureSheet(ss, APP.SHEETS.FAMILY, FAMILY_HEADERS);
  ensureSheet(ss, APP.SHEETS.PAYMENTS, PAYMENT_HEADERS);
  ensureSheet(ss, APP.SHEETS.ADMINS, ADMIN_HEADERS);
  ensureSheet(ss, APP.SHEETS.SETTINGS, SETTINGS_HEADERS);
  ensureSheet(ss, APP.SHEETS.LOGS, LOG_HEADERS);
  seedDefaults(ss);
}

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  const existingHeader = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeader = headers.some((h, idx) => existingHeader[idx] !== h);
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function seedDefaults(ss) {
  const settings = ss.getSheetByName(APP.SHEETS.SETTINGS);
  const map = readSettings(settings);
  if (!map.SESSION_YEAR) {
    settings.appendRow(['SESSION_YEAR', '2026']);
  }

  const admins = ss.getSheetByName(APP.SHEETS.ADMINS);
  if (admins.getLastRow() === 1) {
    admins.appendRow(['admin@ksochd.org', 'admin123', 'Admin', 'Default Admin', 'Yes']);
    logAction('system', 'SEED_ADMIN', 'Created default admin account');
  }
}

function readSettings(settingsSheet) {
  const values = settingsSheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) map[String(values[i][0]).trim()] = values[i][1];
  }
  return map;
}

function getSetting(key) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.SHEETS.SETTINGS);
  return readSettings(sheet)[key];
}

function submitIndividual(formData) {
  initializeSheets();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.SHEETS.INDIVIDUAL);
    const enrollmentNo = nextEnrollmentNo('I', sheet);
    const photoURL = uploadPhotoIfAvailable(formData.photoBase64, formData.photoName, enrollmentNo);

    const row = mapIndividualRow(formData, enrollmentNo, photoURL);
    sheet.appendRow(row);
    sendSubmissionConfirmation(formData.email, formData.name, enrollmentNo, 'Individual');
    logAction(formData.email, 'SUBMIT_INDIVIDUAL', enrollmentNo);

    return { success: true, enrollmentNo, message: 'Individual membership submitted successfully.' };
  } finally {
    lock.releaseLock();
  }
}

function submitFamily(formData) {
  initializeSheets();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.SHEETS.FAMILY);
    const enrollmentNo = nextEnrollmentNo('F', sheet);
    const photoURL = uploadPhotoIfAvailable(formData.photoBase64, formData.photoName, enrollmentNo);

    const row = mapFamilyRow(formData, enrollmentNo, photoURL);
    sheet.appendRow(row);
    sendSubmissionConfirmation(formData.email, formData.name, enrollmentNo, 'Family');
    logAction(formData.email, 'SUBMIT_FAMILY', enrollmentNo);

    return { success: true, enrollmentNo, message: 'Family membership submitted successfully.' };
  } finally {
    lock.releaseLock();
  }
}

function mapIndividualRow(data, enrollmentNo, photoURL) {
  return [
    new Date(), enrollmentNo, 'Pending',
    data.name || '', data.fatherName || '', data.motherName || '', data.gender || '', data.dob || '', data.maritalStatus || '',
    data.email || '', data.phone || '', data.course || '', data.institution || '', data.localGuardian || '',
    data.officeAddress || '', data.residentialAddress || '', data.permanentAddress || '', photoURL,
    '', '', '', '', '', data.notes || ''
  ];
}

function mapFamilyRow(data, enrollmentNo, photoURL) {
  const base = mapIndividualRow(data, enrollmentNo, photoURL);
  return base.concat([
    data.relative1Name || '', data.relative1Relation || '',
    data.relative2Name || '', data.relative2Relation || '',
    data.relative3Name || '', data.relative3Relation || '',
    data.relative4Name || '', data.relative4Relation || ''
  ]);
}

function nextEnrollmentNo(typeCode, sheet) {
  const sessionYear = String(getSetting('SESSION_YEAR') || '2026');
  const prefix = `KSO${typeCode}${sessionYear}-`;
  const values = sheet.getRange(2, 2, Math.max(sheet.getLastRow() - 1, 0), 1).getValues().flat();
  let maxCounter = 0;
  values.forEach(v => {
    const value = String(v || '');
    if (value.indexOf(prefix) === 0) {
      const counter = parseInt(value.split('-')[1], 10);
      if (!isNaN(counter) && counter > maxCounter) maxCounter = counter;
    }
  });
  const next = String(maxCounter + 1).padStart(4, '0');
  return `${prefix}${next}`;
}

function uploadPhotoIfAvailable(photoBase64, photoName, enrollmentNo) {
  if (!photoBase64) return '';
  const folderId = getSetting(APP.DEFAULT_PHOTO_FOLDER_KEY);
  const folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  const data = photoBase64.split(',');
  const metadata = data[0].match(/data:(.*);base64/);
  const contentType = metadata && metadata[1] ? metadata[1] : 'image/jpeg';
  const bytes = Utilities.base64Decode(data[1]);
  const ext = contentType.split('/')[1] || 'jpg';
  const safeName = (photoName || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${enrollmentNo}_${safeName}.${ext}`;
  const file = folder.createFile(Utilities.newBlob(bytes, contentType, fileName));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function adminLogin(email, password) {
  initializeSheets();
  const admins = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.SHEETS.ADMINS).getDataRange().getValues();
  for (let i = 1; i < admins.length; i++) {
    const row = admins[i];
    const active = String(row[4] || '').toLowerCase();
    if (String(row[0]).toLowerCase() === String(email).toLowerCase() && (active === 'yes' || active === 'true')) {
      if (String(row[1]) === String(password)) {
        const token = Utilities.getUuid();
        const sessionData = {
          email: row[0],
          role: row[2],
          fullName: row[3],
          loginAt: new Date().toISOString()
        };
        CacheService.getScriptCache().put(`session:${token}`, JSON.stringify(sessionData), APP.TOKEN_TTL_SECONDS);
        logAction(email, 'ADMIN_LOGIN', row[2]);
        return { success: true, token, user: sessionData };
      }
    }
  }
  return { success: false, message: 'Invalid credentials or inactive account.' };
}

function getMembers(token, memberType, status, query) {
  const session = requireSession(token);
  const type = String(memberType || 'Individual');
  const sheetName = type === 'Family' ? APP.SHEETS.FAMILY : APP.SHEETS.INDIVIDUAL;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const normalizedQuery = String(query || '').toLowerCase();

  const data = rows.slice(1).map(rowToObject.bind(null, headers)).filter(item => {
    const statusMatch = !status || status === 'All' || item.Status === status;
    const queryMatch = !normalizedQuery ||
      String(item.Name || '').toLowerCase().indexOf(normalizedQuery) >= 0 ||
      String(item.EnrollmentNo || '').toLowerCase().indexOf(normalizedQuery) >= 0 ||
      String(item.Phone || '').toLowerCase().indexOf(normalizedQuery) >= 0 ||
      String(item.Email || '').toLowerCase().indexOf(normalizedQuery) >= 0;
    return statusMatch && queryMatch;
  });

  logAction(session.email, 'GET_MEMBERS', `${type}:${status || 'All'}`);
  return { success: true, data, role: session.role, user: session };
}

function getMemberDetail(token, memberType, enrollmentNo) {
  requireSession(token);
  const type = memberType === 'Family' ? APP.SHEETS.FAMILY : APP.SHEETS.INDIVIDUAL;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(type);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(enrollmentNo)) {
      return { success: true, member: rowToObject(headers, rows[i]) };
    }
  }
  return { success: false, message: 'Member not found.' };
}

function approveMember(token, memberType, enrollmentNo, action, notes) {
  const session = requireSession(token);
  if (['Admin', 'President', 'General Secretary'].indexOf(session.role) === -1) {
    throw new Error('You do not have permission to approve/reject members.');
  }

  const sheetName = memberType === 'Family' ? APP.SHEETS.FAMILY : APP.SHEETS.INDIVIDUAL;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(enrollmentNo)) {
      const status = action === 'Approve' ? 'Approved' : 'Rejected';
      sheet.getRange(i + 1, 3).setValue(status);
      sheet.getRange(i + 1, 22).setValue(session.fullName || session.email);
      sheet.getRange(i + 1, 23).setValue(new Date());
      if (notes) sheet.getRange(i + 1, 24).setValue(notes);

      logAction(session.email, 'APPROVE_MEMBER', `${enrollmentNo}:${status}`);
      return { success: true, message: `Application ${status.toLowerCase()} successfully.` };
    }
  }
  return { success: false, message: 'Enrollment number not found.' };
}

function recordPayment(token, memberType, enrollmentNo, amount, paymentMode, notes) {
  const session = requireSession(token);
  if (['Admin', 'Treasurer'].indexOf(session.role) === -1) {
    throw new Error('You do not have permission to record payments.');
  }

  const sheetName = memberType === 'Family' ? APP.SHEETS.FAMILY : APP.SHEETS.INDIVIDUAL;
  const memberSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const paymentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.SHEETS.PAYMENTS);
  const rows = memberSheet.getDataRange().getValues();
  const receiptNo = generateReceiptNo();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(enrollmentNo)) {
      const memberName = rows[i][3];
      memberSheet.getRange(i + 1, 19).setValue(amount);
      memberSheet.getRange(i + 1, 20).setValue(paymentMode);
      memberSheet.getRange(i + 1, 21).setValue(receiptNo);
      paymentSheet.appendRow([new Date(), enrollmentNo, memberType, memberName, amount, paymentMode, receiptNo, session.email, notes || '']);

      const email = rows[i][9];
      sendReceipt(email, {
        name: memberName,
        enrollmentNo,
        memberType,
        amount,
        paymentMode,
        receiptNo,
        notes,
        recordedBy: session.fullName || session.email
      });

      logAction(session.email, 'RECORD_PAYMENT', `${enrollmentNo}:${receiptNo}`);
      return { success: true, receiptNo, message: 'Payment recorded and receipt sent.' };
    }
  }
  return { success: false, message: 'Member not found.' };
}

function sendReceipt(email, receiptData) {
  if (!email) return { success: false, message: 'No email provided for receipt.' };

  const html = `
    <div style="font-family:Arial,sans-serif;padding:20px;line-height:1.5;">
      <h2>${APP.ORG_NAME}</h2>
      <p><strong>Session:</strong> ${APP.SESSION}</p>
      <hr>
      <h3>Payment Receipt</h3>
      <p><strong>Receipt No:</strong> ${receiptData.receiptNo}</p>
      <p><strong>Name:</strong> ${receiptData.name}</p>
      <p><strong>Enrollment No:</strong> ${receiptData.enrollmentNo}</p>
      <p><strong>Membership Type:</strong> ${receiptData.memberType}</p>
      <p><strong>Amount:</strong> ₹${receiptData.amount}</p>
      <p><strong>Payment Mode:</strong> ${receiptData.paymentMode}</p>
      <p><strong>Recorded By:</strong> ${receiptData.recordedBy}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      ${receiptData.notes ? `<p><strong>Notes:</strong> ${receiptData.notes}</p>` : ''}
      <hr>
      <p>Thank you for your contribution.</p>
    </div>`;

  const pdfBlob = Utilities.newBlob(html, 'text/html', `${receiptData.receiptNo}.html`).getAs(MimeType.PDF);
  pdfBlob.setName(`${receiptData.receiptNo}.pdf`);

  MailApp.sendEmail({
    to: email,
    subject: `KSO Chandigarh Payment Receipt (${receiptData.receiptNo})`,
    htmlBody: html,
    attachments: [pdfBlob]
  });

  return { success: true, message: 'Receipt sent successfully.' };
}

function exportMembers(token, memberType) {
  requireSession(token);
  const sheetName = memberType === 'Family' ? APP.SHEETS.FAMILY : APP.SHEETS.INDIVIDUAL;
  const sourceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  const exportSpreadsheet = SpreadsheetApp.create(`${sheetName}_Export_${Date.now()}`);
  const exportSheet = exportSpreadsheet.getSheets()[0];
  exportSheet.setName(sheetName);

  const data = sourceSheet.getDataRange().getValues();
  exportSheet.getRange(1, 1, data.length, data[0].length).setValues(data);

  const url = `https://docs.google.com/spreadsheets/d/${exportSpreadsheet.getId()}/export?format=xlsx`;
  return { success: true, url, fileId: exportSpreadsheet.getId() };
}

function logout(token) {
  if (token) CacheService.getScriptCache().remove(`session:${token}`);
  return { success: true };
}

function requireSession(token) {
  const raw = CacheService.getScriptCache().get(`session:${token}`);
  if (!raw) throw new Error('Unauthorized access. Please login again.');
  return JSON.parse(raw);
}

function generateReceiptNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const n = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `KSO-R-${y}${m}${d}-${n}`;
}

function rowToObject(headers, row) {
  const item = {};
  headers.forEach((h, idx) => { item[h] = row[idx]; });
  return item;
}

function sendSubmissionConfirmation(email, name, enrollmentNo, type) {
  if (!email) return;
  MailApp.sendEmail({
    to: email,
    subject: `${APP.ORG_NAME} Membership Submission Confirmation`,
    htmlBody: `<p>Dear ${name || 'Applicant'},</p>
      <p>Your <strong>${type}</strong> membership application has been submitted successfully.</p>
      <p><strong>Enrollment No:</strong> ${enrollmentNo}</p>
      <p>Status: Pending approval</p>
      <p>Thank you,<br>${APP.ORG_NAME}</p>`
  });
}

function logAction(actorEmail, action, details) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.SHEETS.LOGS);
  logSheet.appendRow([new Date(), actorEmail || 'unknown', action, details || '']);
}
