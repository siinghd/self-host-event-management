"use client";
import { getDeviceFingerprint } from "@/hooks/getDeviceFingerprint";
import CardWrapper from "@/components/auth/CardWrapper";
import { SignInFields, SignUpFields } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  type SignUpValues,
  SignUpSchema,
} from "@/lib/validations/signUpSchema";
import {
  type SignInValues,
  SignInSchema,
} from "@/lib/validations/signInSchema";
import { Form } from "@/components/ui/form";
import CustomInput from "@/components/ui/custom-input";
import { toProperCase } from "@/lib/utils";

interface LoginProps {
  type?: "signin" | "signup";
}

type FormValues = SignUpValues | SignInValues;
type SubmitValues = FormValues & { deviceId?: string };

const SignIn = ({ type = "signin" }: LoginProps) => {
  const fingerprint = getDeviceFingerprint();

  const title = type === "signin" ? "Sign In" : "Sign Up";
  const description =
    type === "signin" ? "Sign in to your account" : "Create a new account";
  const fields = type === "signin" ? SignInFields : SignUpFields;
  const footerContent =
    type === "signin" ? (
      <>
        <span>Dont have an account?</span>
        <Link href="/signup" className="ml-1">
          Signup
        </Link>
      </>
    ) : null;

  const signUpForm = useForm<FormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signInForm = useForm<FormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpSubmit = (data: SubmitValues) => {
    data.deviceId = fingerprint?.visitorId;
    console.log(data);
  };

  const signInSubmit = (data: SubmitValues) => {
    data.deviceId = fingerprint?.visitorId;
    console.log(data);
  };

  return (
    <CardWrapper
      title={title}
      description={description}
      footerContent={footerContent}
    >
      {type === "signin" ? (
        <Form {...signInForm}>
          <form onSubmit={signInForm.handleSubmit(signInSubmit)}>
            <div className="grid gap-5">
              {fields.map((field) => (
                <CustomInput
                  key={field.name}
                  control={signInForm.control}
                  name={field.name}
                  type={field.type}
                  label={toProperCase(field.name)}
                  placeholderText={field.placeholderText}
                />
              ))}
            </div>
            <button type="submit">Submit</button>
          </form>
        </Form>
      ) : (
        <Form {...signUpForm}>
          <form onSubmit={signUpForm.handleSubmit(signUpSubmit)}>
            <div className="grid gap-5">
              {fields.map((field) => (
                <CustomInput
                  key={field.name}
                  control={signUpForm.control}
                  name={field.name}
                  type={field.type}
                  label={toProperCase(field.name)}
                  placeholderText={field.placeholderText}
                />
              ))}
            </div>
            <button type="submit">Submit</button>
          </form>
        </Form>
      )}
    </CardWrapper>
  );
};

export default SignIn;
