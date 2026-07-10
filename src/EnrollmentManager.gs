/**
 * @fileoverview Enrollment Number Generation Module
 * Handles auto-generation of unique enrollment numbers
 */

// ==================== ENROLLMENT NUMBER GENERATION ====================

/**
 * Generates a unique enrollment number for new members
 * Format: KSOI2027-0001 (Individual) or KSOF2027-0001 (Family)
 * 
 * @param {string} type - Member type ('Individual' or 'Family')
 * @returns {string} Generated enrollment number
 */
function generateEnrollmentNo(type) {
  const prefix = type === SHEETS.INDIVIDUAL ? 'KSOI' : 'KSOF';
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

/**
 * Validates an enrollment number format
 * @param {string} enrollmentNo - Enrollment number to validate
 * @returns {boolean} True if valid format
 */
function isValidEnrollmentNo(enrollmentNo) {
  const pattern = /^(KSOI|KSOF)\d{4}-\d{4}$/;
  return pattern.test(enrollmentNo);
}

/**
 * Parses an enrollment number into its components
 * @param {string} enrollmentNo - Enrollment number to parse
 * @returns {Object|null} Parsed components or null if invalid
 */
function parseEnrollmentNo(enrollmentNo) {
  if (!isValidEnrollmentNo(enrollmentNo)) {
    return null;
  }
  
  const match = enrollmentNo.match(/^(KSOI|KSOF)(\d{4})-(\d{4})$/);
  
  return {
    type: match[1] === 'KSOI' ? SHEETS.INDIVIDUAL : SHEETS.FAMILY,
    year: parseInt(match[2]),
    sequence: parseInt(match[3]),
    full: enrollmentNo
  };
}

/**
 * Gets the next expected enrollment number without creating it
 * @param {string} type - Member type ('Individual' or 'Family')
 * @returns {string} Next enrollment number
 */
function getNextEnrollmentNo(type) {
  return generateEnrollmentNo(type);
}

/**
 * Counts total members by type for current term
 * @param {string} type - Member type ('Individual' or 'Family')
 * @returns {number} Count of members
 */
function countMembersByType(type) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const sheet = getSheet(type);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return 0;
    }

    const currentYear = getActiveTermYear();
    const prefix = type === SHEETS.INDIVIDUAL ? 'KSOI' : 'KSOF';
    let count = 0;

    for (let i = 1; i < data.length; i++) {
      const enrollmentNo = data[i][1];
      if (enrollmentNo && enrollmentNo.startsWith(prefix + currentYear)) {
        count++;
      }
    }

    return count;
  } catch (error) {
    Logger.log(`Error counting members: ${error.message}`);
    return 0;
  }
}
