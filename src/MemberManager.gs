/**
 * @fileoverview Member Registration Module
 * Handles individual and family member registration
 */

// ==================== MEMBER REGISTRATION ====================

/**
 * Submits an individual membership application
 * @param {Object} formData - Form data object with member details
 * @returns {Object} Submission result with enrollment number
 */
function submitIndividual(formData) {
  try {
    const sheet = getSheet(SHEETS.INDIVIDUAL);
    const enrollmentNo = generateEnrollmentNo(SHEETS.INDIVIDUAL);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      throw new Error('Required fields missing: name, email, or phone');
    }

    // Handle photo upload if provided
    let photoURL = '';
    if (formData.photoFile) {
      photoURL = uploadPhoto(formData.photoFile, enrollmentNo);
    }

    const rowData = [
      new Date(),                                    // Timestamp
      enrollmentNo,                                  // Enrollment Number
      MEMBER_STATUS.PENDING,                         // Status
      formData.name,                                 // Name
      formData.fatherName || '',                     // Father's Name
      formData.motherName || '',                     // Mother's Name
      formData.gender || '',                         // Gender
      formData.dob || '',                            // Date of Birth
      formData.maritalStatus || '',                  // Marital Status
      formData.email,                                // Email
      formData.phone,                                // Phone
      formData.course || '',                         // Course
      formData.institution || '',                    // Institution
      formData.localGuardian || '',                  // Local Guardian
      formData.officeAddress || '',                  // Office Address
      formData.residentialAddress || '',             // Residential Address
      formData.permanentAddress || '',               // Permanent Address
      photoURL,                                      // Photo URL
      0,                                             // Amount Paid (initial)
      '',                                            // Payment Mode
      '',                                            // Receipt No
      '',                                            // Approved By
      '',                                            // Approved Date
      '',                                            // Notes
      getActiveTerm()                                // Term
    ];

    sheet.appendRow(rowData);

    // Send confirmation email to member
    sendConfirmationEmail(formData.email, formData.name, enrollmentNo, SHEETS.INDIVIDUAL);

    // Log the registration action
    logAction('MEMBER_REGISTRATION', 'System', `New individual member: ${enrollmentNo} - ${formData.name}`);

    return {
      success: true,
      enrollmentNo: enrollmentNo,
      message: 'Application submitted successfully! You will receive a confirmation email shortly.'
    };
  } catch (error) {
    Logger.log(`Individual registration error: ${error.message}`);
    logAction('ERROR', 'System', `Individual registration failed: ${error.message}`);
    
    return {
      success: false,
      message: 'Failed to submit application: ' + error.message
    };
  }
}

/**
 * Submits a family membership application
 * @param {Object} formData - Form data object with member and relative details
 * @returns {Object} Submission result with enrollment number
 */
function submitFamily(formData) {
  try {
    const sheet = getSheet(SHEETS.FAMILY);
    const enrollmentNo = generateEnrollmentNo(SHEETS.FAMILY);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      throw new Error('Required fields missing: name, email, or phone');
    }

    // Handle photo upload if provided
    let photoURL = '';
    if (formData.photoFile) {
      photoURL = uploadPhoto(formData.photoFile, enrollmentNo);
    }

    const rowData = [
      new Date(),                                    // Timestamp
      enrollmentNo,                                  // Enrollment Number
      MEMBER_STATUS.PENDING,                         // Status
      formData.name,                                 // Name
      formData.fatherName || '',                     // Father's Name
      formData.motherName || '',                     // Mother's Name
      formData.gender || '',                         // Gender
      formData.dob || '',                            // Date of Birth
      formData.maritalStatus || '',                  // Marital Status
      formData.email,                                // Email
      formData.phone,                                // Phone
      formData.course || '',                         // Course
      formData.institution || '',                    // Institution
      formData.localGuardian || '',                  // Local Guardian
      formData.officeAddress || '',                  // Office Address
      formData.residentialAddress || '',             // Residential Address
      formData.permanentAddress || '',               // Permanent Address
      photoURL,                                      // Photo URL
      0,                                             // Amount Paid (initial)
      '',                                            // Payment Mode
      '',                                            // Receipt No
      '',                                            // Approved By
      '',                                            // Approved Date
      '',                                            // Notes
      getActiveTerm(),                               // Term
      formData.relative1Name || '',                  // Relative 1 Name
      formData.relative1Relation || '',              // Relative 1 Relation
      formData.relative2Name || '',                  // Relative 2 Name
      formData.relative2Relation || '',              // Relative 2 Relation
      formData.relative3Name || '',                  // Relative 3 Name
      formData.relative3Relation || '',              // Relative 3 Relation
      formData.relative4Name || '',                  // Relative 4 Name
      formData.relative4Relation || ''               // Relative 4 Relation
    ];

    sheet.appendRow(rowData);

    // Send confirmation email to member
    sendConfirmationEmail(formData.email, formData.name, enrollmentNo, SHEETS.FAMILY);

    // Log the registration action
    logAction('MEMBER_REGISTRATION', 'System', `New family member: ${enrollmentNo} - ${formData.name}`);

    return {
      success: true,
      enrollmentNo: enrollmentNo,
      message: 'Family application submitted successfully! You will receive a confirmation email shortly.'
    };
  } catch (error) {
    Logger.log(`Family registration error: ${error.message}`);
    logAction('ERROR', 'System', `Family registration failed: ${error.message}`);
    
    return {
      success: false,
      message: 'Failed to submit application: ' + error.message
    };
  }
}

/**
 * Approves a pending member application
 * @param {string} enrollmentNo - Enrollment number to approve
 * @param {string} notes - Optional approval notes
 * @returns {Object} Approval result
 */
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

    // Update status to Approved
    sheet.getRange(rowIndex, 3).setValue(MEMBER_STATUS.APPROVED);
    sheet.getRange(rowIndex, 22).setValue(session.email); // ApprovedBy
    sheet.getRange(rowIndex, 23).setValue(new Date());   // ApprovedDate
    
    if (notes) {
      sheet.getRange(rowIndex, 24).setValue(notes); // Notes
    }

    // Send approval email
    sendApprovalEmail(member.Email, member.Name, enrollmentNo, member.type);

    logAction('MEMBER_APPROVED', session.email, `Approved member: ${enrollmentNo}`);

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

/**
 * Rejects a pending member application
 * @param {string} enrollmentNo - Enrollment number to reject
 * @param {string} reason - Rejection reason
 * @returns {Object} Rejection result
 */
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

    // Update status to Rejected
    sheet.getRange(rowIndex, 3).setValue(MEMBER_STATUS.REJECTED);
    sheet.getRange(rowIndex, 22).setValue(session.email); // ApprovedBy
    sheet.getRange(rowIndex, 23).setValue(new Date());   // ApprovedDate
    sheet.getRange(rowIndex, 24).setValue(reason);       // Notes

    // Send rejection email
    sendRejectionEmail(member.Email, member.Name, enrollmentNo, reason);

    logAction('MEMBER_REJECTED', session.email, `Rejected member: ${enrollmentNo} - Reason: ${reason}`);

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

/**
 * Gets a member by enrollment number from either Individual or Family sheet
 * @param {string} enrollmentNo - Enrollment number to search
 * @returns {Object|null} Member object with type and rowIndex, or null
 */
function getMemberByEnrollment(enrollmentNo) {
  try {
    // Search in Individual sheet first
    let sheet = getSheet(SHEETS.INDIVIDUAL);
    let data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === enrollmentNo) {
        const member = { type: SHEETS.INDIVIDUAL, rowIndex: i + 1 };
        data[0].forEach((header, index) => {
          member[header] = data[i][index];
        });
        return member;
      }
    }

    // Search in Family sheet
    sheet = getSheet(SHEETS.FAMILY);
    data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === enrollmentNo) {
        const member = { type: SHEETS.FAMILY, rowIndex: i + 1 };
        data[0].forEach((header, index) => {
          member[header] = data[i][index];
        });
        return member;
      }
    }

    return null;
  } catch (error) {
    Logger.log(`Error finding member: ${error.message}`);
    return null;
  }
}
