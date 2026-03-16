import { defineFunction } from '@aws-amplify/backend'

export const adminUserFn = defineFunction({
  name: 'admin-user',
  entry: './handler.ts',
  timeoutSeconds: 30,
})
