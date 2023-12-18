import { createRequestSchema } from '../../middlewares/zodValidate';
import { z } from 'zod';

export const signupSchema = createRequestSchema(
  z.object({
    name: z.string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    }),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    surname: z.string({
      required_error: 'Surname is required',
      invalid_type_error: 'Surname must be a string',
    }),
    phoneNumber: z.string({
      required_error: 'Phone number is required',
      invalid_type_error: 'Phone number must be a string',
    }),
    deviceId: z.string({
      required_error: 'Device ID is required',
      invalid_type_error: 'Device ID must be a string',
    }),
  })
);
export const loginSchema = createRequestSchema(
  z.object({
    email: z.string().email('Invalid email format'),
    password: z.string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    }),
    deviceId: z.string({
      required_error: 'Device ID is required',
      invalid_type_error: 'Device ID must be a string',
    }),
  })
);
export const logoutSchema = createRequestSchema(
  z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required',
      invalid_type_error: 'Refresh token must be a string',
    }),
    deviceId: z.string({
      required_error: 'Device ID is required',
      invalid_type_error: 'Device ID must be a string',
    }),
  })
);
export const updateUserDetailsSchema = createRequestSchema(
  z.object({
    name: z
      .string()
      .optional()
      .or(
        z.string({
          required_error: 'Name is required',
          invalid_type_error: 'Name must be a string',
        })
      ),
    surname: z
      .string()
      .optional()
      .or(
        z.string({
          required_error: 'Surname is required',
          invalid_type_error: 'Surname must be a string',
        })
      ),
    // Add more fields as necessary
  })
);
export const inviteUserSchema = createRequestSchema(
  z.object({
    name: z.string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    }),
    surname: z.string({
      required_error: 'Surname is required',
      invalid_type_error: 'Surname must be a string',
    }),
    email: z.string().email('Invalid email format'),
    phoneNumber: z.string({
      required_error: 'Phone number is required',
      invalid_type_error: 'Phone number must be a string',
    }),
    role: z.enum(['admin', 'user', 'otherRoles'], {
      required_error: 'Role is required',
      invalid_type_error:
        "Role must be one of 'admin', 'user', or 'otherRoles'",
    }),
    // Add more fields as necessary
  })
);
