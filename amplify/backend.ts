import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';

// DICT M&E Dashboard – Backend entry point
// Wires together Cognito auth, AppSync GraphQL data, and S3 storage.

defineBackend({
  auth,
  data,
  storage,
});
