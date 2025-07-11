import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import "../styles/Auth.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="glass-box">
        <div className="tabs">
          <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>Login</button>
          <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>Signup</button>
          <div className={`tab-indicator ${isLogin ? "left" : "right"}`}></div>
        </div>
        {isLogin ? <LoginForm /> : <SignupForm onSuccess={() => setIsLogin(true)} />}
      </div>
    </div>
  );
}

export default Auth;