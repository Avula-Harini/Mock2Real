import "./Signup.css";

function Signup({ onLogicalClick }) {
  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1>Mock2Real</h1>
        <h2>Create Your Account</h2>
        <p>Start preparing for your next interview.</p>

        <form onSubmit={(e) => {
          e.preventDefault();
          alert("Signup demo submitted!");
        }}>
          <input
            type="text"
            placeholder="Full Name"
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            required
          />

          <input
            type="password"
            placeholder="Create Password"
            required
          />
          <input
  type="password"
  placeholder="Confirm Password"
  required
/>

          <button type="submit">Create Account</button>
        </form>

        <p className="signin-text">
  Already have an account?{" "}
  <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    onLoginClick();
  }}
>
  Login
</a>
</p>
      </div>
    </div>
  );
}

export default Signup;