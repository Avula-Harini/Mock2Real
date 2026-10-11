import { useState } from "react";
import "./Login.css";

function Login({ onSignupClick, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    alert("Login interface is working! Authentication will be added later.");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Mock<span>2</span>Real</h1>
        <h2>Welcome Back!</h2>
        <p>Continue your journey towards interview success.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <div className="login-password-wrapper">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="login-show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="login-forgot">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              alert("Password recovery will be added later.");
            }}>
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-submit">
            Log In
          </button>
        </form>

        <p className="login-signup-text">
          Don't have an account?{" "}
          <a href="#" onClick={(e) => {
            e.preventDefault();
            onSignupClick();
          }}>
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;