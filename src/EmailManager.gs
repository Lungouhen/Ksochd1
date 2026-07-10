/**
 * @fileoverview Email Notification Module
 * Handles all email communications to members
 */

// ==================== EMAIL NOTIFICATIONS ====================

/**
 * Sends registration confirmation email to new member
 * @param {string} email - Member email address
 * @param {string} name - Member name
 * @param {string} enrollmentNo - Generated enrollment number
 * @param {string} type - Membership type (Individual/Family)
 */
function sendConfirmationEmail(email, name, enrollmentNo, type) {
  try {
    const subject = `${CONFIG.ORGANIZATION} - Application Received`;
    const body = `
Dear ${name},

Thank you for applying to ${CONFIG.ORGANIZATION}!

Your ${type} membership application has been received successfully.

📋 APPLICATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━
Enrollment Number: ${enrollmentNo}
Application Type: ${type} Membership
Submission Date: ${new Date().toLocaleString()}

✅ NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━
1. Your application is currently under review
2. You will receive an approval/rejection email within 3-5 business days
3. Once approved, you can proceed with the membership fee payment
4. After payment, your membership will be fully activated

📞 NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━
If you have any questions, please contact us at admin@ksocandigarh.org

Best regards,
${CONFIG.ORGANIZATION} Team
    `.trim();

    MailApp.sendEmail(email, subject, body);
    logAction('EMAIL_SENT', 'System', `Confirmation email sent to ${email}`);
  } catch (error) {
    Logger.log(`Failed to send confirmation email to ${email}: ${error.message}`);
    logAction('ERROR', 'System', `Failed to send confirmation email: ${error.message}`);
  }
}

/**
 * Sends approval notification email to member
 * @param {string} email - Member email address
 * @param {string} name - Member name
 * @param {string} enrollmentNo - Enrollment number
 * @param {string} type - Membership type (Individual/Family)
 */
function sendApprovalEmail(email, name, enrollmentNo, type) {
  try {
    const fee = type === SHEETS.INDIVIDUAL ? CONFIG.INDIVIDUAL_FEE : CONFIG.FAMILY_FEE;
    
    const subject = `${CONFIG.ORGANIZATION} - Application Approved`;
    const body = `
Dear ${name},

Congratulations! 🎉

Your ${type} membership application has been APPROVED!

✅ APPROVAL DETAILS
━━━━━━━━━━━━━━━━━━━━━━
Enrollment Number: ${enrollmentNo}
Membership Type: ${type}
Approval Date: ${new Date().toLocaleString()}

💰 PAYMENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━
Membership Fee: ₹${fee}

Payment Methods Accepted:
• Cash (at office)
• UPI
• Bank Transfer
• Cheque

Please complete your payment to activate your membership benefits.

🎁 MEMBER BENEFITS
━━━━━━━━━━━━━━━━━━━━━━
• Access to all organizational events
• Networking opportunities
• Career development resources
• Community support
• And much more!

📞 CONTACT US
━━━━━━━━━━━━━━━━━━━━━━
For payment queries: finance@ksocandigarh.org
General inquiries: admin@ksocandigarh.org

Welcome to the family! 🤝

Best regards,
${CONFIG.ORGANIZATION} Team
    `.trim();

    MailApp.sendEmail(email, subject, body);
    logAction('EMAIL_SENT', 'System', `Approval email sent to ${email}`);
  } catch (error) {
    Logger.log(`Failed to send approval email to ${email}: ${error.message}`);
    logAction('ERROR', 'System', `Failed to send approval email: ${error.message}`);
  }
}

/**
 * Sends rejection notification email to member
 * @param {string} email - Member email address
 * @param {string} name - Member name
 * @param {string} enrollmentNo - Enrollment number
 * @param {string} reason - Rejection reason
 */
function sendRejectionEmail(email, name, enrollmentNo, reason) {
  try {
    const subject = `${CONFIG.ORGANIZATION} - Application Status`;
    const body = `
Dear ${name},

Thank you for your interest in ${CONFIG.ORGANIZATION}.

After careful review, we regret to inform you that your membership application could not be approved at this time.

📋 APPLICATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━
Enrollment Number: ${enrollmentNo}
Application Type: Membership
Decision Date: ${new Date().toLocaleString()}

❌ REASON FOR REJECTION
━━━━━━━━━━━━━━━━━━━━━━
${reason || 'Not specified'}

🔄 WHAT'S NEXT?
━━━━━━━━━━━━━━━━━━━━━━
You are welcome to reapply in the next membership cycle or contact us if you believe this decision was made in error.

📞 CONTACT US
━━━━━━━━━━━━━━━━━━━━━━
For clarification: admin@ksocandigarh.org

We appreciate your understanding.

Best regards,
${CONFIG.ORGANIZATION} Team
    `.trim();

    MailApp.sendEmail(email, subject, body);
    logAction('EMAIL_SENT', 'System', `Rejection email sent to ${email}`);
  } catch (error) {
    Logger.log(`Failed to send rejection email to ${email}: ${error.message}`);
    logAction('ERROR', 'System', `Failed to send rejection email: ${error.message}`);
  }
}

/**
 * Sends payment receipt email to member
 * @param {string} email - Member email address
 * @param {string} name - Member name
 * @param {string} enrollmentNo - Enrollment number
 * @param {number} amount - Payment amount
 * @param {string} receiptNo - Receipt number
 * @param {string} type - Membership type (Individual/Family)
 */
function sendReceiptEmail(email, name, enrollmentNo, amount, receiptNo, type) {
  try {
    const subject = `${CONFIG.ORGANIZATION} - Payment Receipt (${receiptNo})`;
    const body = `
Dear ${name},

This is to confirm that we have received your membership fee payment.

💳 PAYMENT RECEIPT
━━━━━━━━━━━━━━━━━━━━━━
Receipt Number: ${receiptNo}
Enrollment Number: ${enrollmentNo}
Member Name: ${name}
Amount Paid: ₹${amount}
Payment Date: ${new Date().toLocaleString()}
Membership Type: ${type}

✅ MEMBERSHIP STATUS
━━━━━━━━━━━━━━━━━━━━━━
Your membership is now FULLY ACTIVE!

You can now enjoy all member benefits including:
• Event participation
• Access to member resources
• Networking opportunities
• Career support services

📧 DIGITAL RECEIPT
━━━━━━━━━━━━━━━━━━━━━━
This email serves as your official payment receipt. Please save it for your records.

📞 NEED ASSISTANCE?
━━━━━━━━━━━━━━━━━━━━━━
Contact: finance@ksocandigarh.org

Thank you for being a valued member! 🎉

Best regards,
${CONFIG.ORGANIZATION} Team
    `.trim();

    MailApp.sendEmail(email, subject, body);
    logAction('EMAIL_SENT', 'System', `Receipt email sent to ${email}`);
  } catch (error) {
    Logger.log(`Failed to send receipt email to ${email}: ${error.message}`);
    logAction('ERROR', 'System', `Failed to send receipt email: ${error.message}`);
  }
}

/**
 * Sends bulk email to multiple recipients
 * @param {Object} emailData - Email data object
 * @returns {Object} Send result
 */
function sendBulkEmail(emailData) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    const { recipients, subject, body } = emailData;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('Invalid recipients list');
    }

    let successCount = 0;
    let failureCount = 0;
    const failures = [];

    recipients.forEach(email => {
      try {
        MailApp.sendEmail(email, subject, body);
        successCount++;
      } catch (error) {
        failureCount++;
        failures.push({ email, error: error.message });
      }
    });

    logAction('BULK_EMAIL_SENT', session.email, 
      `Sent to ${successCount} recipients, ${failureCount} failed`);

    return {
      success: true,
      successCount: successCount,
      failureCount: failureCount,
      failures: failures
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Bulk email failed: ${error.message}`);
    return {
      success: false,
      message: 'Failed to send bulk email: ' + error.message
    };
  }
}

/**
 * Sends event reminder email
 * @param {Array} recipients - List of recipient emails
 * @param {Object} eventData - Event details
 */
function sendEventReminder(recipients, eventData) {
  try {
    const subject = `📅 Event Reminder: ${eventData.eventName}`;
    const body = `
Dear Member,

This is a friendly reminder about our upcoming event!

📋 EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━
Event: ${eventData.eventName}
Date: ${eventData.eventDate}
Time: ${eventData.eventTime || 'TBA'}
Location: ${eventData.location}
Organizer: ${eventData.organizer}

📝 DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━
${eventData.description || 'No description available'}

We look forward to seeing you there!

Best regards,
${CONFIG.ORGANIZATION} Team
    `.trim();

    recipients.forEach(email => {
      try {
        MailApp.sendEmail(email, subject, body);
      } catch (error) {
        Logger.log(`Failed to send event reminder to ${email}: ${error.message}`);
      }
    });

    logAction('EVENT_REMINDER_SENT', 'System', `Reminders sent for event: ${eventData.eventName}`);
  } catch (error) {
    Logger.log(`Failed to send event reminders: ${error.message}`);
    logAction('ERROR', 'System', `Failed to send event reminders: ${error.message}`);
  }
}

/**
 * Sends birthday wishes email
 * @param {string} email - Member email
 * @param {string} name - Member name
 */
function sendBirthdayWishes(email, name) {
  try {
    const subject = `🎂 Happy Birthday from ${CONFIG.ORGANIZATION}!`;
    const body = `
Dear ${name},

🎉 HAPPY BIRTHDAY! 🎂

On behalf of ${CONFIG.ORGANIZATION}, we wish you a wonderful birthday filled with joy, happiness, and success!

May this year bring you:
✨ New opportunities
📚 Academic excellence
🤝 Lasting friendships
🏆 Great achievements

Enjoy your special day!

Warm wishes,
${CONFIG.ORGANIZATION} Team
    `.trim();

    MailApp.sendEmail(email, subject, body);
    logAction('BIRTHDAY_EMAIL_SENT', 'System', `Birthday wishes sent to ${name}`);
  } catch (error) {
    Logger.log(`Failed to send birthday email to ${email}: ${error.message}`);
  }
}
