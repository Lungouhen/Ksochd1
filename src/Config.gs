/**
 * @fileoverview Configuration and Constants
 * Centralized configuration management for KSO Chandigarh Portal
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  SHEET_ID: PropertiesService.getScriptProperties().getProperty('SHEET_ID') || SpreadsheetApp.getActiveSpreadsheet().getId(),
  ORGANIZATION: 'Kuki Students\' Organisation (KSO) Chandigarh',
  SESSION: getActiveTerm(),
  DRIVE_FOLDER_ID: PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || '',
  APP_URL: ScriptApp.getService().getUrl(),
  INDIVIDUAL_FEE: getTermSetting('INDIVIDUAL_FEE', 500),
  FAMILY_FEE: getTermSetting('FAMILY_FEE', 1500),
  ADMIN_ROLES: [
    'Admin', 
    'President', 
    'General Secretary', 
    'Treasurer', 
    'Vice President', 
    'Joint Secretary', 
    'Cultural Secretary', 
    'Sports Secretary', 
    'Finance Secretary'
  ],
  CACHE_EXPIRATION_SECONDS: 21600, // 6 hours
  MAX_PHOTO_SIZE_KB: 5120, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  DEFAULT_FALLBACK_TERM: '2026-2027'
};

// Sheet name constants
const SHEETS = {
  INDIVIDUAL: 'Individual',
  FAMILY: 'Family',
  PAYMENTS: 'Payments',
  ADMINS: 'Admins',
  TERMS: 'Terms',
  SETTINGS: 'Settings',
  LOGS: 'Logs',
  EVENTS: 'Events',
  ATTENDANCE: 'Attendance',
  ANNOUNCEMENTS: 'Announcements',
  DOCUMENTS: 'Documents',
  COMMITTEES: 'Committees',
  RENEWALS: 'Renewals',
  DONATIONS: 'Donations',
  CERTIFICATES: 'Certificates',
  SKILLS: 'Skills',
  JOBS: 'Jobs',
  VOLUNTEERS: 'Volunteers',
  POLLS: 'Polls',
  POLL_VOTES: 'PollVotes',
  MEETINGS: 'Meetings'
};

// Member status constants
const MEMBER_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

// Payment mode constants
const PAYMENT_MODES = {
  CASH: 'Cash',
  UPI: 'UPI',
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque'
};

// Export configuration
module.exports = { CONFIG, SHEETS, MEMBER_STATUS, PAYMENT_MODES };
