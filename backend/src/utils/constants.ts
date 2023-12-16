const MAX_QUERY_LIMIT = 100;
const MIN_QUERY_LIMIT = 1;

interface RoleConfiguration {
  required: string[];
  allowed: string[];
  handler: () => void;
}

const ROLE_MAP: Record<string, RoleConfiguration> = {
  user: {
    required: ['x'],
    allowed: ['x'],
    handler: () => {},
  },
  admin: {
    required: ['x'],
    allowed: ['x'],
    handler: () => {},
  },
};


const RESTRICTED_UPDATE_USER_PROPERTIES_BASED_ON_ROLE = {
  admin: [
    'uid',
    'invitationToken',
    'tokens',
    'forgotPasswordToken',
    'forgotPasswordExpiry',
  ],
  user: [
    'uid',
    'invitationToken',
    'tokens',
    'forgotPasswordToken',
    'forgotPasswordExpiry',
  ],
};
export {
  MAX_QUERY_LIMIT,
  MIN_QUERY_LIMIT,
  ROLE_MAP,
  RESTRICTED_UPDATE_USER_PROPERTIES_BASED_ON_ROLE,
};
