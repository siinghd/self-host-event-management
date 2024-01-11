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
import { Form } from "@/components/ui/form";
import CustomInput from "@/components/ui/custom-input";
import { toProperCase } from "@/lib/utils";

interface LoginProps {
  type?: "signin" | "signup";
}

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

  const form = useForm<SignUpValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignUpValues & { deviceId?: string }) => {
    data.deviceId = fingerprint?.visitorId;
    console.log(data);
  };

  return (
    <CardWrapper
      title={title}
      description={description}
      footerContent={footerContent}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5">
            {fields.map((field) => (
              <CustomInput
                key={field.name}
                control={form.control}
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
    </CardWrapper>
  );
};

export default SignIn;
