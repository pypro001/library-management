import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import * as Yup from "yup";
import "./Login.css";

interface FormValues {
  email: string;
  password: string;
}

const Login = () => {
  const { user, setUser } = useContext(UserContext);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("This is a required field"),
      password: Yup.string()
        .min(6, "Must be at least 6 characters")
        .required("This is a required field")
    }),
    onSubmit: async (values:FormValues) => {
      formik.setSubmitting(true);

      const currentUser = {
        username: values.email,
        email: values.email,
        password: values.password
      };

      try {
        const response:Response = await fetch("/api/users/login", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(currentUser)
        });

        formik.setSubmitting(false);
        const data = await response.json();
        setUser({ ...currentUser, token: data.token });
      } catch (error) {
        console.log(`Line 52: ${error}`);
      }
    }
  });

  return (
    <div className="login-form-container">
      <form onSubmit={(event) => {event.preventDefault(); formik.handleSubmit(event);}} method="post">
        <fieldset>
          <legend>User login form</legend>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            className="email"
            placeholder="Email"
            required
            {...formik.getFieldProps("email")}
          />
          {formik.touched.email && formik.values.email ? (
            <small className="text-danger">{formik.errors.email}</small>
          ) : null}
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            className="password"
            placeholder="Password"
            required
            {...formik.getFieldProps("password")}
          />
          {formik.touched.password && formik.values.password ? (
            <small className="text-danger">{formik.errors.password}</small>
          ) : null}
        </fieldset>
        <input type="submit" value="Login" className="btn btn-primary btn-lg" />
        <p className="register-cta">Don't have an account yet? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
};

export default Login;