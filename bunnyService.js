/**
 * BunnyCDN Storage Helper Service (bunnyService.js)
 * Dedicated uploader for GEO Brand Monitor white-label PDF reports and brand media
 * Storage Zone: aqua_aura_storage
 */

import dotenv from 'dotenv';
dotenv.config();

export const BUNNY_STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME || 'aqua_aura_storage';
export const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || '';
export const BUNNY_STORAGE_REGION = process.env.BUNNY_STORAGE_REGION || 'storage';

/**
 * Resolve the BunnyCDN Storage Base Host based on region
 */
function getStorageHostname(region) {
  if (!region || region === 'storage' || region === 'de') {
    return 'storage.bunnycdn.com';
  }
  // Standard regional endpoints (e.g. ny, la, sg, syd, uk)
  return `${region}.storage.bunnycdn.com`;
}

/**
 * Upload a file (buffer or string) to BunnyCDN Storage
 * @param {string} fileName - Destination path (e.g., 'reports/client_q4_audit.pdf')
 * @param {Buffer|Uint8Array|string} fileContent - Binary buffer or string content
 * @param {string} [mimeType='application/octet-stream'] - MIME type
 * @returns {Promise<{success: boolean, url: string, fileName: string, size?: number, message?: string}>}
 */
export async function uploadToBunnyCDN(fileName, fileContent, mimeType = 'application/octet-stream') {
  const cleanPath = fileName.startsWith('/') ? fileName.slice(1) : fileName;
  const hostname = getStorageHostname(BUNNY_STORAGE_REGION);
  const uploadUrl = `https://${hostname}/${BUNNY_STORAGE_ZONE_NAME}/${cleanPath}`;
  const cdnPublicUrl = `https://${BUNNY_STORAGE_ZONE_NAME}.b-cdn.net/${cleanPath}`;

  // If no API key configured, return simulated successful upload for local testing
  if (!BUNNY_STORAGE_API_KEY) {
    console.warn(`[BUNNYCDN NOTICE] BUNNY_STORAGE_API_KEY is not defined. Simulating upload for: ${cleanPath}`);
    return {
      success: true,
      simulated: true,
      url: cdnPublicUrl,
      fileName: cleanPath,
      message: 'Simulated upload (Set BUNNY_STORAGE_API_KEY in .env to activate live storage)',
    };
  }

  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        AccessKey: BUNNY_STORAGE_API_KEY,
        'Content-Type': mimeType,
      },
      body: fileContent,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BunnyCDN upload failed with status ${response.status}: ${errorText}`);
    }

    console.log(`[BUNNYCDN SUCCESS] File uploaded successfully to ${uploadUrl}`);
    return {
      success: true,
      simulated: false,
      url: cdnPublicUrl,
      fileName: cleanPath,
    };
  } catch (err) {
    console.error('[BUNNYCDN ERROR]', err.message);
    throw err;
  }
}

/**
 * Delete a file from BunnyCDN Storage
 */
export async function deleteFromBunnyCDN(fileName) {
  const cleanPath = fileName.startsWith('/') ? fileName.slice(1) : fileName;
  const hostname = getStorageHostname(BUNNY_STORAGE_REGION);
  const deleteUrl = `https://${hostname}/${BUNNY_STORAGE_ZONE_NAME}/${cleanPath}`;

  if (!BUNNY_STORAGE_API_KEY) {
    return { success: true, simulated: true };
  }

  const response = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      AccessKey: BUNNY_STORAGE_API_KEY,
    },
  });

  return { success: response.ok, status: response.status };
}

/**
 * Get public CDN URL for a file in aqua_aura_storage
 */
export function getBunnyFileUrl(fileName) {
  const cleanPath = fileName.startsWith('/') ? fileName.slice(1) : fileName;
  return `https://${BUNNY_STORAGE_ZONE_NAME}.b-cdn.net/${cleanPath}`;
}

export default {
  BUNNY_STORAGE_ZONE_NAME,
  BUNNY_STORAGE_API_KEY,
  BUNNY_STORAGE_REGION,
  uploadToBunnyCDN,
  deleteFromBunnyCDN,
  getBunnyFileUrl,
};
