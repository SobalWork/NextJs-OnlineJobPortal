"use client";
import LoginAuth from "@/hocs/LoginAuth";
import composeHOCs from "@/hocs/composeHOCs";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MyApi from "@/api/MyApi";
import { useDispatch } from "react-redux";
import { setAuthData } from "@/redux/features/auth/authSlice";

// Define the types for the form values
interface FormValues {
  name: string;
  email: string;
  password: string;
  role: string;
}

function RegisterPage() {
  const [userType, setUserType] = useState("admin");
  const [registrationError, setRegistrationError] = useState<string>("");
  const router = useRouter();
  const dispatch = useDispatch();

  const roleOptions = [
    { value: "employer", label: "Employer" },
    { value: "job seeker", label: "Job Seeker" },
  ];

  const initialValues: FormValues = {
    name: "",
    email: "",
    password: "",
    role: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required("Name is required"),
    email: Yup.string()
      .trim()
      .email("Invalid email")
      .required("Email is required")
      .transform((value) => value.toLowerCase()),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    role: Yup.string().trim().required("Role is required"),
  });

  const registrationHandler = async (values: FormValues) => {
    localStorage.clear();
    try {
      const endPoint =
        values.role === "employer"
          ? "/employer/register"
          : values.role === "job seeker"
          ? "/job-seeker/register"
          : "/admin/register";

      const response = await MyApi.post(endPoint, values, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Registration response:", response.data);
      const { token, role, email, id } = response.data;

      const loggedInUser = {
        id,
        email,
      };
      localStorage.setItem("login_token", token);
      localStorage.setItem("user_role", role);
      localStorage.setItem("logged_in", JSON.stringify(loggedInUser));

      // save role in redux store
      dispatch(
        setAuthData({
          token,
          role,
          isLoggedIn: true,
        })
      );

      router.push("/");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        "An unknown error occurred";
      setRegistrationError(errorMessage);
      console.error("Register error:", errorMessage);
    }
  };

  return (
    <div className="register-page">
      <div className="register-wrapper">
        <h1>Register </h1>
        {registrationError && <p className="error">{registrationError}</p>}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={registrationHandler}
        >
          {({ isSubmitting }) => (
            <Form>
              <div>
                <Field type="text" id="name" name="name" placeholder="Name" />
                <ErrorMessage name="name" component="div" />
              </div>
              <div className="my-3">
                <Field
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                />
                <ErrorMessage name="email" component="div" />
              </div>
              <div>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                />
                <ErrorMessage name="password" component="div" />
              </div>
              <div className="my-3">
                <Field as="select" id="role" name="role">
                  <option value="" label="Select role" />
                  {roleOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    >
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="role" component="div" />
              </div>
              <button type="submit" disabled={isSubmitting}>
                Register
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default composeHOCs(LoginAuth)(RegisterPage);
