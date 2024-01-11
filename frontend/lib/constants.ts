type InputFields = {
  name: "name" | "surname" | "email" | "password" | "confirmPassword" | "phone";
  type?: "password" | "text";
  placeholderText?: string;
}[];

export const SignInFields: InputFields = [
  {
    name: "email",
    placeholderText: "Enter your email",
  },
  {
    name: "password",
    type: "password",
    placeholderText: "Enter your password",
  },
];

export const SignUpFields: InputFields = [
  {
    name: "name",
    placeholderText: "Your name",
  },
  {
    name: "surname",
    placeholderText: "Your surname",
  },
  {
    name: "email",
    placeholderText: "Your email",
  },
  {
    name: "password",
    type: "password",
    placeholderText: "Enter a password",
  },
  {
    name: "confirmPassword",
    type: "password",
    placeholderText: "Confirm password",
  },
  {
    name: "phone",
    placeholderText: "Enter your phone number",
  },
];
