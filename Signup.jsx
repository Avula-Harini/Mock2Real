import { useState } from "react";
import "./Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="signup-page">
      <form className="signup-card" onSubmit={(e) => e.preventDefault()}>
        <h1>Join Mock2Real</h1>
        <p>Start your journey towards interview confidence.</p>

        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Create Account</button>

        <p className="signin-text">
          Already have an account? <a href="#login">Log in</a>
        </p>
      </form>
    </div>
  );
}

export default Signup;