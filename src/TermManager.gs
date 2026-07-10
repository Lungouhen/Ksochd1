/**
 * @fileoverview Term Management Module
 * Handles organizational term operations and settings
 */

// ==================== TERM MANAGEMENT ====================

/**
 * Gets the currently active term from the Terms sheet
 * @returns {string} Active term name (e.g., "2026-2027")
 */
function getActiveTerm() {
  try {
    const sheet = SpreadsheetApp.openById(
      CONFIG.SHEET_ID || SpreadsheetApp.getActiveSpreadsheet().getId()
    ).getSheetByName(SHEETS.TERMS);
    
    if (!sheet) {
      return CONFIG.DEFAULT_FALLBACK_TERM;
    }

    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][4] === true) { // Active column
        return data[i][1]; // TermName
      }
    }
    
    return CONFIG.DEFAULT_FALLBACK_TERM;
  } catch (error) {
    Logger.log(`Error getting active term: ${error.message}`);
    return CONFIG.DEFAULT_FALLBACK_TERM;
  }
}

/**
 * Gets the starting year of the active term
 * @returns {number} Year as integer
 */
function getActiveTermYear() {
  try {
    const termName = getActiveTerm();
    const year = termName.split('-')[0];
    return parseInt(year) || new Date().getFullYear();
  } catch (error) {
    Logger.log(`Error getting active term year: ${error.message}`);
    return new Date().getFullYear();
  }
}

/**
 * Gets a setting value from the Settings sheet
 * @param {string} key - Setting key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Setting value or default
 */
function getTermSetting(key, defaultValue) {
  try {
    const sheet = SpreadsheetApp.openById(
      CONFIG.SHEET_ID || SpreadsheetApp.getActiveSpreadsheet().getId()
    ).getSheetByName(SHEETS.SETTINGS);
    
    if (!sheet) {
      return defaultValue;
    }

    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        return parseInt(data[i][1]) || defaultValue;
      }
    }
    
    return defaultValue;
  } catch (error) {
    Logger.log(`Error getting term setting '${key}': ${error.message}`);
    return defaultValue;
  }
}

/**
 * Creates a new organizational term
 * @param {Object} termData - Term data object
 * @returns {Object} Result with success status
 */
function createTerm(termData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.TERMS);
    const termId = `TERM${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss')}`;
    
    const rowData = [
      termId,
      termData.termName,
      termData.startDate,
      termData.endDate,
      termData.active || false,
      new Date(),
      session.email
    ];
    
    sheet.appendRow(rowData);
    
    logAction('TERM_CREATED', session.email, `Created term: ${termData.termName}`);
    
    return {
      success: true,
      termId: termId,
      message: 'Term created successfully'
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to create term: ${error.message}`);
    return {
      success: false,
      message: 'Failed to create term: ' + error.message
    };
  }
}

/**
 * Sets a term as active (deactivates others)
 * @param {string} termName - Name of term to activate
 * @returns {Object} Result with success status
 */
function setActiveTerm(termName) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.TERMS);
    const data = sheet.getDataRange().getValues();
    
    // Deactivate all terms first
    for (let i = 1; i < data.length; i++) {
      sheet.getRange(i + 1, 5).setValue(false);
    }
    
    // Activate specified term
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === termName) {
        sheet.getRange(i + 1, 5).setValue(true);
        logAction('TERM_ACTIVATED', session.email, `Activated term: ${termName}`);
        
        return {
          success: true,
          message: `Term "${termName}" is now active`
        };
      }
    }
    
    throw new Error('Term not found');
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to set active term: ${error.message}`);
    return {
      success: false,
      message: 'Failed to set active term: ' + error.message
    };
  }
}

/**
 * Gets all organizational terms
 * @returns {Array} Array of term objects
 */
function getAllTerms() {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.TERMS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return [];
    }
    
    const headers = data[0];
    const terms = [];
    
    for (let i = 1; i < data.length; i++) {
      const term = {};
      headers.forEach((header, index) => {
        term[header] = data[i][index];
      });
      terms.push(term);
    }
    
    return terms;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get terms: ${error.message}`);
    return [];
  }
}

/**
 * Gets statistics for a specific term
 * @param {string} termName - Term name
 * @returns {Object} Term statistics
 */
function getTermStatistics(termName) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const individualMembers = getMembersByTerm(SHEETS.INDIVIDUAL, termName);
    const familyMembers = getMembersByTerm(SHEETS.FAMILY, termName);
    
    const stats = {
      termName: termName,
      totalMembers: individualMembers.length + familyMembers.length,
      individualMembers: individualMembers.length,
      familyMembers: familyMembers.length,
      pendingApprovals: 0,
      approvedMembers: 0,
      rejectedMembers: 0,
      totalRevenue: 0
    };
    
    [...individualMembers, ...familyMembers].forEach(member => {
      if (member.Status === MEMBER_STATUS.PENDING) stats.pendingApprovals++;
      if (member.Status === MEMBER_STATUS.APPROVED) stats.approvedMembers++;
      if (member.Status === MEMBER_STATUS.REJECTED) stats.rejectedMembers++;
      
      const amountPaid = parseFloat(member.AmountPaid) || 0;
      if (member.Status === MEMBER_STATUS.APPROVED) {
        stats.totalRevenue += amountPaid;
      }
    });
    
    return stats;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get term statistics: ${error.message}`);
    return null;
  }
}
