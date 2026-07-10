/**
 * @fileoverview Photo Upload Module
 * Handles member photo uploads to Google Drive
 */

// ==================== PHOTO UPLOAD ====================

/**
 * Uploads a member photo to Google Drive
 * @param {string} photoData - Base64 encoded image data (data:image/jpeg;base64,...)
 * @param {string} enrollmentNo - Enrollment number for filename
 * @returns {string} Public URL of uploaded photo, or empty string on failure
 */
function uploadPhoto(photoData, enrollmentNo) {
  try {
    // Get or create the photo folder
    const folderId = CONFIG.DRIVE_FOLDER_ID || createPhotoFolder();
    const folder = DriveApp.getFolderById(folderId);

    // Parse base64 image data
    // Format: data:image/jpeg;base64,/9j/4AAQ...
    const parts = photoData.split(',');
    if (parts.length !== 2) {
      throw new Error('Invalid photo data format');
    }
    
    const [metadata] = parts;
    const base64Data = parts[1];
    
    // Extract MIME type from metadata
    const mimeTypeMatch = metadata.match(/:(.*?);/);
    if (!mimeTypeMatch) {
      throw new Error('Invalid photo MIME type');
    }
    
    const mimeType = mimeTypeMatch[1];
    
    // Validate image type
    if (!CONFIG.SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
      throw new Error(`Unsupported image type: ${mimeType}. Allowed: ${CONFIG.SUPPORTED_IMAGE_TYPES.join(', ')}`);
    }

    // Decode and create file
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data), 
      mimeType, 
      `${enrollmentNo}.jpg`
    );

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    logAction('PHOTO_UPLOADED', 'System', `Photo uploaded for ${enrollmentNo}`);

    return file.getUrl();
  } catch (error) {
    Logger.log(`Photo upload error for ${enrollmentNo}: ${error.message}`);
    logAction('ERROR', 'System', `Photo upload failed for ${enrollmentNo}: ${error.message}`);
    return '';
  }
}

/**
 * Creates a Google Drive folder for storing member photos
 * @returns {string} Created folder ID
 */
function createPhotoFolder() {
  const folderName = `KSO_Member_Photos_${getActiveTerm()}`;
  const folder = DriveApp.createFolder(folderName);
  const folderId = folder.getId();
  
  // Store folder ID in script properties for future use
  PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', folderId);
  
  logAction('FOLDER_CREATED', 'System', `Created photo folder: ${folderName} (${folderId})`);
  
  return folderId;
}

/**
 * Validates photo file size and type before upload
 * @param {string} photoData - Base64 encoded image data
 * @returns {Object} Validation result with success and message
 */
function validatePhoto(photoData) {
  try {
    if (!photoData) {
      return {
        valid: false,
        message: 'No photo data provided'
      };
    }

    // Check MIME type
    const parts = photoData.split(',');
    if (parts.length !== 2) {
      return {
        valid: false,
        message: 'Invalid photo format'
      };
    }

    const metadata = parts[0];
    const mimeTypeMatch = metadata.match(/:(.*?);/);
    
    if (!mimeTypeMatch) {
      return {
        valid: false,
        message: 'Could not determine photo type'
      };
    }

    const mimeType = mimeTypeMatch[1];
    
    if (!CONFIG.SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
      return {
        valid: false,
        message: `Unsupported image type. Please upload JPG or PNG.`
      };
    }

    // Check file size (base64 is ~33% larger than binary)
    const base64Data = parts[1];
    const estimatedSizeKB = Math.round((base64Data.length * 3 / 4) / 1024);
    
    if (estimatedSizeKB > CONFIG.MAX_PHOTO_SIZE_KB) {
      return {
        valid: false,
        message: `Photo too large. Maximum size is ${CONFIG.MAX_PHOTO_SIZE_KB / 1024}MB`
      };
    }

    return {
      valid: true,
      message: 'Photo validation passed',
      mimeType: mimeType,
      estimatedSizeKB: estimatedSizeKB
    };
  } catch (error) {
    return {
      valid: false,
      message: `Validation error: ${error.message}`
    };
  }
}

/**
 * Deletes a member photo from Drive
 * @param {string} photoUrl - URL of photo to delete
 * @returns {Object} Deletion result
 */
function deletePhoto(photoUrl) {
  try {
    const session = getSession();
    if (!session || !session.authenticated) {
      throw new Error('Unauthorized');
    }

    // Extract file ID from URL
    const fileIdMatch = photoUrl.match(/\/d\/(.*?)\//);
    if (!fileIdMatch) {
      throw new Error('Invalid photo URL');
    }

    const fileId = fileIdMatch[1];
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);

    logAction('PHOTO_DELETED', session.email, `Deleted photo: ${photoUrl}`);

    return {
      success: true,
      message: 'Photo deleted successfully'
    };
  } catch (error) {
    logAction('ERROR', session?.email || 'System', `Failed to delete photo: ${error.message}`);
    return {
      success: false,
      message: 'Failed to delete photo: ' + error.message
    };
  }
}

/**
 * Gets the current photo folder information
 * @returns {Object} Folder information
 */
function getPhotoFolderInfo() {
  try {
    const folderId = CONFIG.DRIVE_FOLDER_ID;
    
    if (!folderId) {
      return {
        exists: false,
        message: 'No photo folder configured'
      };
    }

    const folder = DriveApp.getFolderById(folderId);
    
    return {
      exists: true,
      folderId: folderId,
      folderName: folder.getName(),
      folderUrl: folder.getUrl(),
      fileCount: folder.getFiles().hasNext() ? 'Multiple' : '0'
    };
  } catch (error) {
    return {
      exists: false,
      message: `Error accessing folder: ${error.message}`
    };
  }
}
