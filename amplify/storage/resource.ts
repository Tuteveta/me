import { defineStorage } from '@aws-amplify/backend'

// DICT M&E Dashboard – S3 Storage
// All authenticated users (across the full approval chain) can read and write
// so that uploaded request attachments and acquittal documents are accessible
// to every role that handles the request.

export const storage = defineStorage({
  name: 'dictMEStorage',
  access: (allow) => ({
    'funding-requests/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'acquittals/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
})
