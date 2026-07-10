/**
 * @fileoverview Authentication Module
 * Handles admin authentication, sessions, and authorization
 */

// ==================== AUTHENTICATION ====================

/**
 * Authenticates an admin user
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Object} Authentication result
 */
function adminLogin(email, password) {
  try {
    const sheet = getSheet(SHEETS.ADMINS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      // Check email, password, and active status
      if (data[i][0] === email && data[i][1] === password && data[i][6] === true) {
        const session = {
          email: data[i][0],
          role: data[i][2],
          fullName: data[i][4],
          authenticated: true,
          loginTime: new Date().getTime()
        };

        // Update last login timestamp
        sheet.getRange(i + 1, 9).setValue(new Date());

        // Save session to cache
        saveSession(session);

        // Log successful login
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
    Logger.log(`Login error: ${error.message}`);
    return {
      success: false,
      message: 'Login failed: ' + error.message
    };
  }
}

/**
 * Saves admin session to cache
 * @param {Object} session - Session object
 */
function saveSession(session) {
  const cache = CacheService.getUserCache();
  cache.put('adminSession', JSON.stringify(session), CONFIG.CACHE_EXPIRATION_SECONDS);
}

/**
 * Retrieves current admin session from cache
 * @returns {Object|null} Session object or null
 */
function getSession() {
  try {
    const cache = CacheService.getUserCache();
    const sessionData = cache.get('adminSession');
    
    if (sessionData) {
      return JSON.parse(sessionData);
    }
  } catch (error) {
    Logger.log(`Session retrieval error: ${error.message}`);
  }
  
  return null;
}

/**
 * Logs out current admin user
 * @returns {Object} Logout result
 */
function logout() {
  const session = getSession();
  
  if (session) {
    logAction('ADMIN_LOGOUT', session.email, 'User logged out');
  }
  
  const cache = CacheService.getUserCache();
  cache.remove('adminSession');
  
  return { success: true };
}

/**
 * Checks if current user is authenticated
 * @returns {Object} Authentication status
 */
function checkAuth() {
  const session = getSession();
  
  return {
    authenticated: session && session.authenticated,
    session: session
  };
}

/**
 * Validates if user has required role
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {boolean} True if authorized
 */
function hasRole(allowedRoles) {
  const session = getSession();
  
  if (!session || !session.authenticated) {
    return false;
  }
  
  return allowedRoles.includes(session.role);
}

/**
 * Creates a new admin user
 * @param {Object} adminData - Admin data object
 * @returns {Object} Creation result
 */
function createAdmin(adminData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    // Check if admin already exists
    const sheet = getSheet(SHEETS.ADMINS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === adminData.email) {
        return {
          success: false,
          message: 'Admin with this email already exists'
        };
      }
    }

    const rowData = [
      adminData.email,
      adminData.password,
      adminData.role,
      adminData.designation || '',
      adminData.fullName || adminData.email,
      adminData.term || getActiveTerm(),
      adminData.active !== undefined ? adminData.active : true,
      new Date(),
      ''
    ];

    sheet.appendRow(rowData);
    logAction('ADMIN_CREATED', session.email, `Created admin: ${adminData.email}`);

    return {
      success: true,
      message: 'Admin created successfully'
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to create admin: ${error.message}`);
    return {
      success: false,
      message: 'Failed to create admin: ' + error.message
    };
  }
}

/**
 * Gets all admin users
 * @returns {Array} Array of admin objects
 */
function getAllAdmins() {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.ADMINS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    const headers = data[0];
    const admins = [];

    for (let i = 1; i < data.length; i++) {
      const admin = {};
      headers.forEach((header, index) => {
        admin[header] = data[i][index];
      });
      admins.push(admin);
    }

    return admins;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get admins: ${error.message}`);
    return [];
  }
}

/**
 * Updates admin user information
 * @param {string} email - Admin email
 * @param {Object} updateData - Data to update
 * @returns {Object} Update result
 */
function updateAdmin(email, updateData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.ADMINS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        if (updateData.role) sheet.getRange(i + 1, 3).setValue(updateData.role);
        if (updateData.designation) sheet.getRange(i + 1, 4).setValue(updateData.designation);
        if (updateData.fullName) sheet.getRange(i + 1, 5).setValue(updateData.fullName);
        if (updateData.active !== undefined) sheet.getRange(i + 1, 7).setValue(updateData.active);
        if (updateData.term) sheet.getRange(i + 1, 6).setValue(updateData.term);

        logAction('ADMIN_UPDATED', session.email, `Updated admin: ${email}`);

        return {
          success: true,
          message: 'Admin updated successfully'
        };
      }
    }

    return {
      success: false,
      message: 'Admin not found'
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to update admin: ${error.message}`);
    return {
      success: false,
      message: 'Failed to update admin: ' + error.message
    };
  }
}

/**
 * Deletes an admin user
 * @param {string} email - Admin email to delete
 * @returns {Object} Deletion result
 */
function deleteAdmin(email) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.ADMINS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        sheet.deleteRow(i + 1);
        logAction('ADMIN_DELETED', session.email, `Deleted admin: ${email}`);

        return {
          success: true,
          message: 'Admin deleted successfully'
        };
      }
    }

    return {
      success: false,
      message: 'Admin not found'
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to delete admin: ${error.message}`);
    return {
      success: false,
      message: 'Failed to delete admin: ' + error.message
    };
  }
}

/**
 * Changes admin password
 * @param {string} email - Admin email
 * @param {string} newPassword - New password
 * @returns {Object} Change result
 */
function changeAdminPassword(email, newPassword) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.ADMINS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        sheet.getRange(i + 1, 2).setValue(newPassword);
        logAction('PASSWORD_CHANGED', session.email, `Password changed for: ${email}`);

        return {
          success: true,
          message: 'Password changed successfully'
        };
      }
    }

    return {
      success: false,
      message: 'Admin not found'
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to change password: ${error.message}`);
    return {
      success: false,
      message: 'Failed to change password: ' + error.message
    };
  }
}

/**
 * Gets admins filtered by term
 * @param {string} termName - Term name
 * @returns {Array} Array of admin objects
 */
function getAdminsByTerm(termName) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(SHEETS.ADMINS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    const headers = data[0];
    const termIndex = headers.indexOf('Term');
    const admins = [];

    for (let i = 1; i < data.length; i++) {
      if (termIndex === -1 || data[i][termIndex] === termName) {
        const admin = {};
        headers.forEach((header, index) => {
          admin[header] = data[i][index];
        });
        admins.push(admin);
      }
    }

    return admins;
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to get admins by term: ${error.message}`);
    return [];
  }
}
