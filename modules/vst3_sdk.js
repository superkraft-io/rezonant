// VST3 SDK Downloader and Extractor Module
// 
// Requires the 'adm-zip' package: npm install adm-zip
// 
// To run directly: node vst3_sdk_setup.js
// To use as a module: const { downloadAndExtractVST3SDK } = require('./vst3_sdk_setup');
//
const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const AdmZip = require('adm-zip');

// --- Configuration ---
// This URL (from search results) is set up by Steinberg to always redirect 
// to the latest SDK ZIP file.
const VST3_SDK_URL = 'https://www.steinberg.net/vst3sdk'; 
var SDK_DEST_DIR = path.join('IPlug2_SK', 'Dependencies', 'IPlug', 'VST3_SDK');
const TEMP_ZIP_PATH = path.join(process.cwd(), 'vst3_sdk_temp.zip');
// --- End Configuration ---



function extractSpecificFolder(zipFilePath, zipFolderPath, destDirPath) {
    return new Promise((resolve, reject) => {
        try {
            // Ensure the zip folder path ends with a separator for accurate matching
            if (!zipFolderPath.endsWith(path.sep) && !zipFolderPath.endsWith('/')) {
                zipFolderPath += '/';
            }

            console.log(`\nAttempting to extract folder: ${zipFolderPath}`);
            console.log(`To destination: ${destDirPath}`);

            const zip = new AdmZip(zipFilePath);
            const zipEntries = zip.getEntries();
            let filesExtractedCount = 0;

            // Ensure the destination directory exists
            fs.mkdirSync(destDirPath, { recursive: true });

            zipEntries.forEach(zipEntry => {
                const entryName = zipEntry.entryName;

                // 1. Check if the entry is inside the target folder and is a file (not a directory entry)
                if (entryName.startsWith(zipFolderPath) && !zipEntry.isDirectory) {
                    
                    // 2. Calculate the path *relative* to the folder we are extracting
                    // Example: If zipFolderPath is 'SDK/base/' and entryName is 'SDK/base/files/config.h', 
                    // relativePath becomes 'files/config.h'
                    const relativePath = entryName.substring(zipFolderPath.length);
                    
                    // 3. Construct the final output path on the disk
                    const diskPath = path.join(destDirPath, relativePath);

                    // 4. Ensure the necessary subdirectories exist in the destination
                    fs.mkdirSync(path.dirname(diskPath), { recursive: true });

                    // 5. Extract the file content
                    // The 'extractEntryTo' method is used here with maintainEntryPath=false 
                    // because we are manually handling the destination path above.
                    zip.extractEntryTo(
                        entryName,      // The file path inside the ZIP
                        path.dirname(diskPath), // The directory on disk
                        false,          // Do NOT preserve internal path structure (we defined it manually)
                        true            // Overwrite existing files
                    );
                    filesExtractedCount++;
                }
            });

            if (filesExtractedCount === 0) {
                 console.warn(`\n⚠️ Warning: No files found or extracted from '${zipFolderPath}'. Check the path casing.`);
            } else {
                console.log(`\n✅ Successfully extracted ${filesExtractedCount} files.`);
            }
            resolve();
        } catch (error) {
            console.error(`\n❌ Extraction failed: ${error.message}`);
            reject(error);
        }
    });
}

/**
 * Utility function to handle HTTP redirects (e.g., 302 Found) to find the final ZIP URL.
 * @param {string} url The initial URL to check.
 * @param {number} maxRedirects Maximum number of redirects to follow.
 * @returns {Promise<string>} The final, non-redirected URL.
 */
function resolveRedirect(url, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        let redirects = 0;
        const request = (currentUrl) => {
            if (redirects >= maxRedirects) {
                return reject(new Error("Too many redirects"));
            }

            const client = currentUrl.startsWith('https') ? https : require('http');
            const req = client.get(currentUrl, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    redirects++;
                    // Use URL constructor to handle relative redirects safely
                    const nextUrl = new URL(res.headers.location, currentUrl).href; 
                    request(nextUrl); // Follow redirect
                } else if (res.statusCode === 200) {
                    resolve(currentUrl); // Found the final URL
                } else {
                    reject(new Error(`Request failed with status code: ${res.statusCode}`));
                }
            }).on('error', reject);
            req.end();
        };
        request(url);
    });
}

/**
 * Utility function to download a file stream.
 * @param {string} url The file URL to download.
 * @param {string} destinationPath The local path to save the file.
 * @returns {Promise<void>}
 */
function downloadFile(url, destinationPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destinationPath);
        const request = https.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                // Delete file on error
                fs.unlink(destinationPath, () => {}); 
                return reject(new Error(`Download failed with status code ${response.statusCode}`));
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close(resolve);
            });
            file.on('error', (err) => {
                // Delete file on write error
                fs.unlink(destinationPath, () => {}); 
                reject(err);
            });
        }).on('error', (err) => {
            fs.unlink(destinationPath, () => {}); // Delete the file async
            reject(err);
        });
        request.end();
    });
}

/**
 * Main function to execute the download and extraction process.
 * This is the function exported by the module.
 */
async function downloadAndExtractVST3SDK(rootPath) {
    SDK_DEST_DIR = rootPath + '/' + SDK_DEST_DIR;

    console.log(`\n--- VST3 SDK Setup Script ---`);
    console.log(`Targeting extraction directory: ${SDK_DEST_DIR}`);

    // 1. Ensure the destination directory exists
    try {
        await fs.promises.mkdir(SDK_DEST_DIR, { recursive: true });
        console.log(`[STATUS] Ensured directory structure exists.`);
    } catch (error) {
        console.error(`[ERROR] Error creating directory: ${error.message}`);
        return;
    }

    // 2. Download the ZIP file (handling potential redirects)
    console.log(`[STATUS] Resolving download link for: ${VST3_SDK_URL}`);
    
    let finalUrl;
    try {
        finalUrl = await resolveRedirect(VST3_SDK_URL);
    } catch (e) {
        console.error(`[ERROR] Failed to resolve final download URL: ${e.message}`);
        return;
    }
    
    console.log(`[STATUS] Final download URL found: ${finalUrl}`);

    try {
        await downloadFile(finalUrl, TEMP_ZIP_PATH);
        console.log(`[STATUS] Download complete. File saved to: ${TEMP_ZIP_PATH}`);
    } catch (e) {
        console.error(`[ERROR] Download failed: ${e.message}`);
        return;
    }

    // 3. Extract the contents
    try {
        /*const zip = new AdmZip(TEMP_ZIP_PATH);
        const zipEntries = zip.getEntries();
        
        zip.extractAllToAsync(SDK_DEST_DIR, true, true);
        */

        await extractSpecificFolder(
            TEMP_ZIP_PATH, 
            'VST_SDK/vst3sdk/base', 
            SDK_DEST_DIR + '/base'
        );

        await extractSpecificFolder(
            TEMP_ZIP_PATH, 
            'VST_SDK/vst3sdk/pluginterfaces', 
            SDK_DEST_DIR + '/pluginterfaces'
        );

        await extractSpecificFolder(
            TEMP_ZIP_PATH, 
            'VST_SDK/vst3sdk/public.sdk/source', 
            SDK_DEST_DIR + '/public.sdk/source'
        );

        fs.rmdirSync(SDK_DEST_DIR + '/VST_SDK', { recursive: true, force: true });
    } catch (error) {
        console.error(`[ERROR] Error during extraction: ${error.message}`);
    } finally {
        // 4. Clean up the temporary ZIP file
        try {
            await fs.promises.unlink(TEMP_ZIP_PATH);
            console.log(`[STATUS] Cleaned up temporary file: ${TEMP_ZIP_PATH}`);
        } catch (e) {
            console.warn(`[WARNING] Could not delete temporary file: ${e.message}`);
        }
    }
    console.log(`--- Script Finished ---`);
}

// Export the main function as a module
module.exports = {
    downloadAndExtractVST3SDK
};