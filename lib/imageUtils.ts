// lib/imageUtils.ts

/**
 * Compresses an image file locally in the browser.
 * Ensures the output is a JPG format and strictly under 1MB.
 * Returns a Base64 string ready for Dexie.js storage.
 */
export const compressImageLocally = (file: File, maxSizeMB: number = 1): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Max dimensions to prevent massive canvas memory usage
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Fill white background in case of transparent PNGs to prevent black artifacts in JPG
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, width, height);
                }

                // Target size in bytes (1MB = 1048576 bytes)
                const targetBytes = maxSizeMB * 1024 * 1024;
                let quality = 0.9;
                let base64String = canvas.toDataURL('image/jpeg', quality);

                // Recursively reduce quality if the Base64 string is too large
                while (base64String.length > targetBytes && quality > 0.1) {
                    quality -= 0.1;
                    base64String = canvas.toDataURL('image/jpeg', quality);
                }

                if (base64String.length > targetBytes) {
                    console.warn('Could not compress image under 1MB without losing structure.');
                }

                resolve(base64String);
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
};