import { defineAuth } from "@aws-amplify/backend";

// DICT M&E Dashboard – Auth configuration
// Custom attributes mirror the ManagedUser type in types/index.ts
// so that Cognito user attributes stay aligned with the dashboard's user model.

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    "custom:role": {
      dataType: "String",
      mutable: true,
    },
    "custom:division": {
      dataType: "String",
      mutable: true,
    },
  },
});
