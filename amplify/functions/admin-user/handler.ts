import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const cognito = new CognitoIdentityProviderClient({})
const USER_POOL_ID = process.env.USER_POOL_ID ?? ''

type Event = {
  arguments: {
    action:   string
    email:    string
    name?:    string
    password?: string
    role?:    string
    division?: string
  }
}

export const handler = async (event: Event) => {
  const { action, email, name, password, role, division } = event.arguments

  try {
    /* ── Create user ─────────────────────────────────────────────────── */
    if (action === 'create') {
      if (!password) return { success: false, error: 'Password is required.' }

      // Create the Cognito account (suppress the welcome email)
      await cognito.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          { Name: 'email',            Value: email },
          { Name: 'email_verified',   Value: 'true' },
          { Name: 'name',             Value: name ?? email },
          { Name: 'custom:role',      Value: role ?? 'admin' },
          { Name: 'custom:division',  Value: division ?? '' },
        ],
      }))

      // Set a permanent password so the user doesn't have to change it on first login
      await cognito.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: password,
        Permanent: true,
      }))

      return { success: true, error: null }
    }

    /* ── Delete user ─────────────────────────────────────────────────── */
    if (action === 'delete') {
      await cognito.send(new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
      }))
      return { success: true, error: null }
    }

    /* ── Update role / division ──────────────────────────────────────── */
    if (action === 'updateAttributes') {
      const attrs: { Name: string; Value: string }[] = []
      if (role)     attrs.push({ Name: 'custom:role',     Value: role })
      if (division) attrs.push({ Name: 'custom:division', Value: division })
      if (attrs.length > 0) {
        await cognito.send(new AdminUpdateUserAttributesCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
          UserAttributes: attrs,
        }))
      }
      return { success: true, error: null }
    }

    return { success: false, error: `Unknown action: ${action}` }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    // UsernameExistsException — more helpful message
    if (msg.includes('UsernameExistsException') || msg.includes('already exists')) {
      return { success: false, error: 'A Cognito account with this email already exists.' }
    }
    // UserNotFoundException — on delete/update
    if (msg.includes('UserNotFoundException') || msg.includes('User does not exist')) {
      return { success: false, error: 'Cognito user not found. The DynamoDB record will still be removed.' }
    }
    return { success: false, error: msg }
  }
}
