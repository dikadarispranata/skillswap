// src/services/cloudinaryService.js
// Upload foto ke Cloudinary menggunakan unsigned preset (gratis, tanpa backend)

const CLOUD_NAME   = 'dsdms7s0n'
const UPLOAD_PRESET = 'skillswap_avatars'
const UPLOAD_URL   = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

/**
 * Upload gambar ke Cloudinary
 * @param {File} file - File gambar
 * @param {string} uid - User ID (untuk public_id unik)
 * @param {(pct: number) => void} onProgress - Callback progress 0–100
 * @returns {Promise<string>} Secure URL gambar
 */
export function uploadToCloudinary(file, uid, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    // Tidak pakai public_id custom — biarkan Cloudinary generate
    // folder sudah diset di preset Cloudinary (skillswap/avatars)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        resolve(data.secure_url)
      } else {
        // Log detail error dari Cloudinary untuk debugging
        try {
          const err = JSON.parse(xhr.responseText)
          reject(new Error(err.error?.message || `Upload gagal: ${xhr.status}`))
        } catch {
          reject(new Error(`Upload gagal: ${xhr.status}`))
        }
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error saat upload')))

    xhr.open('POST', UPLOAD_URL)
    xhr.send(formData)
  })
}
