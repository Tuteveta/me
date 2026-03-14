import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';

// DICT M&E Dashboard – Backend entry point
// Wires together Cognito auth (auth/resource.ts) and
// AppSync GraphQL data (data/resource.ts) for the Amplify Gen2 deployment.

defineBackend({
  auth,
  data,
});
