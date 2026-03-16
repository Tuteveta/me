import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';
import { adminUserFn } from './functions/admin-user/resource.js';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

// DICT M&E Dashboard – Backend entry point
const backend = defineBackend({
  auth,
  data,
  storage,
  adminUserFn,
});

// Grant the Lambda function Cognito admin permissions so it can
// create, delete, and update user attributes in the User Pool.
backend.adminUserFn.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminSetUserPassword',
      'cognito-idp:AdminDeleteUser',
      'cognito-idp:AdminUpdateUserAttributes',
    ],
    resources: [backend.auth.resources.userPool.userPoolArn],
  })
);

// Pass the User Pool ID to the Lambda via the CloudFormation resource
// (IFunction doesn't expose addEnvironment; use the cfn escape hatch instead)
backend.adminUserFn.resources.cfnResources.cfnFunction.addPropertyOverride(
  'Environment.Variables.USER_POOL_ID',
  backend.auth.resources.userPool.userPoolId
);
