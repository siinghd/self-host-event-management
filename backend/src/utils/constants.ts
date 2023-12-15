const MAX_QUERY_LIMIT = 100;
const MIN_QUERY_LIMIT = 1;

// role-specific data
const ROLE_MAP: any = {
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

const USER_ROLES = {
  user: 'user',
  admin: 'admin',
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
  USER_ROLES,
  RESTRICTED_UPDATE_USER_PROPERTIES_BASED_ON_ROLE,
};
