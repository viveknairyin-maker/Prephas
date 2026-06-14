import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { signInWithEmailAndPassword, signInWithPopup, auth, googleProvider, db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from "firebase/auth";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const getAuthError = (code) => {
    const errors = {
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/user-not-found": "No account found with this email.",
      "auth/email-already-in-use": "This email is already registered. Try logging in.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please wait a few minutes.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/invalid-credential": "Incorrect email or password.",
    };
    return errors[code] || "Something went wrong. Please try again.";
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email above first, then click Forgot Password.");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError("");
    } catch (err) {
      setError(getAuthError(err.code));
    } finally {
      setResetLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      setError(getAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || 'Anonymous User',
          email: user.email,
          createdAt: new Date().toISOString(),
          plan: 'free',
          downloadCount: 0
        });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(`Google Sign-In failed: ${err.message} (${err.code || 'unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center px-margin-mobile md:px-margin-desktop py-20 relative">
      <Helmet>
        <title>Login | PREPHAS Resume Builder</title>
        <meta name="description" content="Build ATS-friendly resumes with PREPHAS. Free AI resume builder, ATS score checker, job match analysis, resume templates, and instant PDF export." />
        <link rel="canonical" href="https://prephas.online/login" />
      </Helmet>
      <div className="absolute inset-0 grid-bg pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md bg-white border border-primary p-8 md:p-12 block-shadow">
        <div className="mb-8 text-center">
          <Link className="flex justify-center" to="/">
            <img src="/logo.png" alt="PREPHAS Logo" className="h-12 w-auto object-contain" />
          </Link>
          <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-label-sm text-label-sm uppercase text-primary">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md text-body-md"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-sm text-label-sm uppercase text-primary">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md text-body-md"
              placeholder="••••••••"
            />
            
            <div style={{ textAlign: "right", marginTop: 6 }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 12,
                  color: "#555",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {resetLoading ? "Sending..." : "Forgot password?"}
              </button>
            </div>

            {resetSent && (
              <div style={{
                border: "1px solid #000",
                padding: "10px 14px",
                fontSize: 13,
                marginTop: 10,
                background: "#f9f9f9"
              }}>
                ✓ Password reset email sent. Check your inbox.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-4 font-label-sm uppercase tracking-widest hover:opacity-90 transition-opacity active:translate-y-0.5"
          >
            {loading ? 'Please wait...' : 'Sign In'}
          </button>
        </form>

        {error && (
          <div style={{
            border: "1px solid #000",
            padding: "10px 14px",
            fontSize: 13,
            color: "#c00",
            marginTop: 12,
            background: "#fff8f8"
          }}>
            {error}
          </div>
        )}

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-outline-variant"></div>
          <span className="relative bg-white px-4 font-label-sm text-label-sm text-secondary uppercase">OR</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border border-primary bg-white text-primary py-4 font-label-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center gap-3 active:translate-y-0.5"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.568 0-6.46-2.892-6.46-6.46s2.892-6.46 6.46-6.46c1.65 0 3.129.624 4.269 1.745l3.228-3.228C19.347 2.115 16.035 1 12.24 1 5.76 1 .5 6.26.5 12.74S5.76 24.48 12.24 24.48c6.643 0 11.233-4.667 11.233-11.44 0-.756-.09-1.48-.256-2.176h-10.98z"/>
          </svg>
          Sign In with Google
        </button>

        <p className="mt-8 text-center font-body-md text-body-md text-secondary">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-bold underline hover:opacity-75">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
