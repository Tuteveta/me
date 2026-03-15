import '@/lib/amplify'
import { uploadData, getUrl } from 'aws-amplify/storage'

/**
 * Upload a File to S3 under the given key.
 * Returns the key (stored in DynamoDB as the attachment URL).
 */
export async function uploadFile(file: File, key: string): Promise<string> {
  await uploadData({
    key,
    data: file,
    options: { contentType: file.type },
  }).result
  return key
}

/**
 * Sanitise a filename for safe use as an S3 key segment.
 */
export function sanitiseFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

/**
 * Generate a pre-signed URL for an S3 key so any authenticated user
 * in the approval chain can open/download the file.
 * Expires in 1 hour.
 */
export async function getSignedUrl(key: string): Promise<string> {
  const { url } = await getUrl({ key, options: { expiresIn: 3600 } })
  return url.toString()
}
