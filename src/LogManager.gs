/**
 * @fileoverview Logging Module
 * Handles audit logging and activity tracking
 */

// ==================== LOGGING ====================

/**
 * Logs an action to the audit trail
 * @param {string} action - Action type (e.g., 'MEMBER_REGISTRATION', 'ADMIN_LOGIN')
 * @param {string} user - User who performed the action
 * @param {string} details - Detailed description of the action
 */
function logAction(action, user, details) {
  try {
    const sheet = getSheet(SHEETS.LOGS);
    
    const rowData = [
      new Date(),      // Timestamp
      action,          // Action
      user,            // User
      details,         // Details
      ''               // IPAddress (not available in Apps Script)
    ];
    
    sheet.appendRow(rowData);
  } catch (error) {
    Logger.log(`Failed to log action '${action}': ${error.message}`);
  }
}

/**
 * Gets recent log entries
 * @param {number} limit - Maximum number of entries to return
 * @returns {Array} Array of log entry objects
 */
function getRecentLogs(limit = 50) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.LOGS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    const headers = data[0];
    const logs = [];

    // Get most recent entries (reverse order)
    const startIndex = Math.max(1, data.length - limit);
    
    for (let i = startIndex; i < data.length; i++) {
      const log = {};
      headers.forEach((header, index) => {
        log[header] = data[i][index];
      });
      logs.push(log);
    }

    return logs.reverse(); // Most recent first
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get logs: ${error.message}`);
    return [];
  }
}

/**
 * Searches logs by action type
 * @param {string} actionType - Action type to search for
 * @returns {Array} Array of matching log entries
 */
function searchLogsByAction(actionType) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.LOGS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    const headers = data[0];
    const actionIndex = headers.indexOf('Action');
    const logs = [];

    if (actionIndex === -1) {
      return [];
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][actionIndex] && data[i][actionIndex].includes(actionType)) {
        const log = {};
        headers.forEach((header, index) => {
          log[header] = data[i][index];
        });
        logs.push(log);
      }
    }

    return logs;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to search logs: ${error.message}`);
    return [];
  }
}

/**
 * Gets logs filtered by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Array of log entries in date range
 */
function getLogsByDateRange(startDate, endDate) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.LOGS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    const headers = data[0];
    const timestampIndex = headers.indexOf('Timestamp');
    const logs = [];

    if (timestampIndex === -1) {
      return [];
    }

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    for (let i = 1; i < data.length; i++) {
      const timestamp = new Date(data[i][timestampIndex]).getTime();
      
      if (timestamp >= startMs && timestamp <= endMs) {
        const log = {};
        headers.forEach((header, index) => {
          log[header] = data[i][index];
        });
        logs.push(log);
      }
    }

    return logs;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get logs by date: ${error.message}`);
    return [];
  }
}

/**
 * Gets activity statistics
 * @returns {Object} Activity statistics object
 */
function getActivityStats() {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.LOGS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return {
        totalActions: 0,
        actionsByType: {},
        actionsByUser: {}
      };
    }

    const headers = data[0];
    const actionIndex = headers.indexOf('Action');
    const userIndex = headers.indexOf('User');

    const actionsByType = {};
    const actionsByUser = {};

    for (let i = 1; i < data.length; i++) {
      const action = data[i][actionIndex] || 'Unknown';
      const user = data[i][userIndex] || 'Unknown';

      actionsByType[action] = (actionsByType[action] || 0) + 1;
      actionsByUser[user] = (actionsByUser[user] || 0) + 1;
    }

    return {
      totalActions: data.length - 1,
      actionsByType: actionsByType,
      actionsByUser: actionsByUser,
      topActions: Object.entries(actionsByType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topUsers: Object.entries(actionsByUser)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get activity stats: ${error.message}`);
    return null;
  }
}

/**
 * Clears old log entries (admin only)
 * @param {number} daysToKeep - Number of days of logs to keep
 * @returns {Object} Clear result
 */
function clearOldLogs(daysToKeep = 90) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    // Only Admin role can clear logs
    if (session.role !== 'Admin') {
      throw new Error('Insufficient permissions');
    }

    const sheet = getSheet(SHEETS.LOGS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return {
        success: true,
        message: 'No logs to clear',
        clearedCount: 0
      };
    }

    const headers = data[0];
    const timestampIndex = headers.indexOf('Timestamp');
    
    if (timestampIndex === -1) {
      throw new Error('Timestamp column not found');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffMs = cutoffDate.getTime();

    let clearedCount = 0;
    const rowsToKeep = [headers];

    for (let i = 1; i < data.length; i++) {
      const timestamp = new Date(data[i][timestampIndex]).getTime();
      
      if (timestamp >= cutoffMs) {
        rowsToKeep.push(data[i]);
      } else {
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      // Clear sheet and rewrite with kept rows
      sheet.clearContents();
      sheet.getRange(1, 1, rowsToKeep.length, rowsToKeep[0].length).setValues(rowsToKeep);
      
      logAction('LOGS_CLEARED', session.email, `Cleared ${clearedCount} old log entries`);
    }

    return {
      success: true,
      message: `Cleared ${clearedCount} log entries older than ${daysToKeep} days`,
      clearedCount: clearedCount
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to clear logs: ${error.message}`);
    return {
      success: false,
      message: 'Failed to clear logs: ' + error.message
    };
  }
}
