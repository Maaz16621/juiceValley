import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import { auth } from "../../../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import brand from "assets/images/logo-ct.png";
import bgImage from "assets/images/vr-bg.jpg";

function SignIn() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSignIn = () => {
    setLoading(true);
    setError("");
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setLoading(false);
        navigate("/dashboard");
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <CoverLayout image={bgImage}>
      <ArgonBox textAlign="center" mb={3}>
        <ArgonBox component="img" src={brand} alt="Juice Valley Logo" width="4rem" mb={2} />
        <ArgonTypography variant="h4" fontWeight="bold">
          Welcome back
        </ArgonTypography>
        <ArgonTypography variant="body2" color="text">
          Enter your email and password to sign in
        </ArgonTypography>
      </ArgonBox>
      <ArgonBox component="form" role="form">
        <ArgonBox mb={2}>
          <ArgonInput
            type="email"
            placeholder="Email"
            size="large"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </ArgonBox>
        <ArgonBox mb={2}>
          <ArgonInput
            type="password"
            placeholder="Password"
            size="large"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ArgonBox>
        <ArgonBox display="flex" alignItems="center">
          <Switch checked={rememberMe} onChange={handleSetRememberMe} />
          <ArgonTypography
            variant="button"
            fontWeight="regular"
            onClick={handleSetRememberMe}
            sx={{ cursor: "pointer", userSelect: "none" }}
          >
            &nbsp;&nbsp;Remember me
          </ArgonTypography>
        </ArgonBox>
        {error && (
          <ArgonBox mt={2}>
            <ArgonTypography variant="body2" color="error">
              {error}
            </ArgonTypography>
          </ArgonBox>
        )}
        <ArgonBox mt={4} mb={1}>
          <ArgonButton
            variant="gradient"
            color="info"
            size="large"
            fullWidth
            onClick={handleSignIn}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </ArgonButton>
        </ArgonBox>
      </ArgonBox>
    </CoverLayout>
  );
}

export default SignIn;