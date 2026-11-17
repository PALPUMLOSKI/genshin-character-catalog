import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

/**
 * Persistance Layer (DATA) component responsible for downoloading and buffering
 * character portrait images on the local file system to minimize network requests.
 */
export class LocalImageCacheRepository {
    #cacheDir;

    /**
     * Initializes storage in the user's home directory (e.g. ~/genshin-character-catalog/images)
     * following OS storage best practices.
     * @param {string} [customDir] - Optional custom directory path.
     */
    constructor(customDir) {
        this.#cacheDir =
        customDir || path.join(os.homedir(), '.genshin-character-catalog', 'cache', 'images');
    }

    get cacheDir() {
        return this.#cacheDir;
    }

    /**
     * Ensures the local cache directory exists on disk.
     * @returns {Promise<void>}
     */
    async #ensureCacheDirectory() {
        await fs.mkdir(this.#cacheDir, { recursive: true });
    }

    /**
     * Builds a deterministic local file path for a character image.
     * @param {string} characterId
     * @param {string} imageType - e.g., 'portrait or 'icon'.
     * @returns {string}
     */
    #getLocalFilePath(characterId, imageType) {
        const safeId = characterId.toLowerCase().replace(/[^a-z0-9-]/g, '_');
        return path.join(this.#cacheDir, `${safeId}-${imageType}.png`);
    }

    /**
     * Checks wether the image is already buffered on the local disk.
     * @param {string} characterId
     * @param {string} [imageType='portrait']
     * @returns {Promise<boolean>}
     */
    async hasCachedImage(characterId, imageType = 'portrait') {
        const filePath = this.#getLocalFilePath(characterId, imageType);
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Retrieves the local file path of a buffered image.
     * Downoloads and saves the file if it is not yet present in local storage.
     * @param {string} characterId
     * @param {string} remoteUrl
     * @param {string} [imageType='portrait']
     * @returns {Promise<{ filePath: string, source: 'DISK_CACHE' | 'NETWORK_DOWNLOAD' | 'LOCAL_FALLBACK' }>}
     */
    async getOrDownloadImage(characterId, remoteUrl, imageType = 'portrait') {
        await this.#ensureCacheDirectory();
        const filePath = this.#getLocalFilePath(characterId, imageType);

        // 1. Return buffered local file immediately if it exist
        if (await this.hasCachedImage(characterId, imageType)) {
            return {
                filePath,
                source: 'DISK_CACHE'
            };
        }

        // 2. Otherwise, attempt to fetch binary image data from remote server
        try {
            const response = await fetch(remoteUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await fs.writeFile(filePath, buffer);

            return {
                filePath,
                source: 'NETWORK_DOWNLOAD'
            };
        } catch {
            // 3. Fallback: write a valid minimal PNG placeholder to disk if remote server is down (e.g., HTTP 521)
            const fallbackPngBase64 =
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
            await fs.writeFile(filePath, Buffer.from(fallbackPngBase64, 'base64'));

            return {
                filePath,
                source: 'LOCAL_FALLBACK'
            };
        }
    }

    /**
     * Clears all locally buffered image files.
     * @returns {Promise<void>}
     */
    async clearCache() {
        await fs.rm(this.#cacheDir, { recursive: true, force: true });
    }
}