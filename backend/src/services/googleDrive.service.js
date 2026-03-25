const fs = require('fs');

const parseJsonMaybe = (value) => {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }
  // Assume it's a file path
  const content = fs.readFileSync(trimmed, 'utf-8');
  return JSON.parse(content);
};

const getDriveAuth = async () => {
  const jsonFromEnv = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON;
  const jsonPath = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON_PATH;

  const credentials = parseJsonMaybe(jsonFromEnv) || parseJsonMaybe(jsonPath);
  if (!credentials) return null;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return auth;
};

const uploadPdfPublic = async ({ fileName, pdfBuffer, folderId }) => {
  const auth = await getDriveAuth();
  if (!auth) throw new Error('Google Drive is not configured (service account JSON missing)');

  // Lazy-load: avoid crashing server boot if googleapis isn't installed.
  const { google } = require('googleapis');
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    mimeType: 'application/pdf',
  };
  if (folderId) fileMetadata.parents = [folderId];

  const media = {
    mimeType: 'application/pdf',
    body: pdfBuffer,
  };

  const created = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink, webContentLink',
  });

  const fileId = created.data.id;
  if (!fileId) throw new Error('Google Drive upload failed (missing file id)');

  // Make it public
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    receiptUrl: created.data.webViewLink || created.data.webContentLink,
  };
};

module.exports = { uploadPdfPublic };

