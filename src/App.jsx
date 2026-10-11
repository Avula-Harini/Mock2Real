import { useState } from "react";
import "./App.css";
import Signup from "./Signup.jsx";
import Login from "./Login.jsx";
function App() {
  const [showSignup, setShowSignup] = useState(false);
const [showLogin, setShowLogin] = useState(false);

  if (showSignup) {
  return (
  <Signup
   onLoginClick={() => {
    setShowSignup(false);
    setShowLogin(true);
  }} 
  />
);
}

if (showLogin) {
  return ( 
  <Login
   onSignupClick={() => {
    setShowLogin(false);
    setShowSignup(true);
  }} 
  />
);
}
  return (
    <div className="app">
      <nav className="navbar">
        <a href="#" className="logo">
          Mock<span>2</span>Real
        </a>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
         <button
  className="login-btn"
  onClick={() => {
    setShowSignup(false);
    setShowLogin(true);
  }}
>
  Log in
</button>
          <button
            className="nav-cta"
            onClick={() => {
  setShowLogin(false);
  setShowSignup(true);
}}
          >
            Get Started →
          </button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="badge">
            <span className="status-dot"></span>
            YOUR NEXT INTERVIEW STARTS HERE
          </div>

          <h1>
            <span className="first-heading">Practice with purpose.</span>
            <br />
            <span>Perform with confidence.</span>
          </h1>

          <p>
            Turn interview anxiety into confidence with realistic mock
            interviews, personalized AI feedback, and actionable insights
            to help you become interview-ready.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
            onClick={() => {
  setShowLogin(false);
  setShowSignup(true);
}}
            >
              Start practicing →
            </button>

            <a href="#features" className="secondary-btn">
              Explore Features
            </a>
          </div>

          <small>No pressure. Just practice, feedback, and progress.</small>
        </section>

        <section id="features" className="features">
          <h2>Everything you need to ace your interview</h2>
          <div className="feature-grid">
            <article>
              <h3>AI Mock Interviews</h3>
              <p>Practice with realistic interview questions.</p>
            </article>

            <article>
              <h3>Personalized Feedback</h3>
              <p>Understand your strengths and areas to improve.</p>
            </article>

            <article>
              <h3>Track Your Progress</h3>
              <p>Build confidence with every practice session.</p>
            </article>
          </div>
        </section>

        <section id="how-it-works" className="closing-section">
          <h2>Your next opportunity is worth preparing for.</h2>
          <p>Start practicing today and take your next step with confidence.</p>
          <button
            className="primary-btn"
            onClick={() => setShowSignup(true)}
          >
            Get Started →
          </button>
        </section>

        <footer id="about">
          <p>© 2026 Mock2Real. Practice today. Perform tomorrow.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;