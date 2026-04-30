import { useState, useEffect } from "react";
import {
  Card,
  Grid,
  Switch,
} from "@mui/material";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import Header from "layouts/profile/components/Header";
import { auth } from "../../firebase";
import { onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import CircularProgress from "@mui/material/CircularProgress";

function Overview() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || "");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = () => {
    setLoadingProfile(true);
    setError("");
    setSuccess("");
    updateProfile(auth.currentUser, {
      displayName: name,
    })
      .then(() => {
        setLoadingProfile(false);
        setSuccess("Profile updated successfully.");
      })
      .catch((err) => {
        setError(err.message);
        setLoadingProfile(false);
      });
  };

  const handleChangePassword = () => {
    setLoadingPassword(true);
    setError("");
    setSuccess("");

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    reauthenticateWithCredential(auth.currentUser, credential).then(() => {
      updatePassword(auth.currentUser, newPassword)
      .then(() => {
        setLoadingPassword(false);
        setSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
      })
      .catch((err) => {
        setError(err.message);
        setLoadingPassword(false);
      });
    }).catch((err) => {
      setError("Incorrect current password.");
      setLoadingPassword(false);
    });
  };

  return (
    <DashboardLayout>
      <Header />
      <ArgonBox mt={5} mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <ArgonBox p={3}>
                <ArgonTypography variant="h5">Profile Information</ArgonTypography>
                <ArgonBox component="form" role="form" mt={2}>
                  <ArgonBox mb={2}>
                    <ArgonInput
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </ArgonBox>
                  <ArgonBox mb={2}>
                    <ArgonInput
                      type="email"
                      placeholder="Email"
                      value={user ? user.email : ""}
                      disabled
                    />
                  </ArgonBox>
                  {error && (
                    <ArgonBox mt={2}>
                      <ArgonTypography variant="body2" color="error">
                        {error}
                      </ArgonTypography>
                    </ArgonBox>
                  )}
                  {success && (
                    <ArgonBox mt={2}>
                      <ArgonTypography variant="body2" color="success">
                        {success}
                      </ArgonTypography>
                    </ArgonBox>
                  )}
                  <ArgonBox mt={4} mb={1}>
                    <ArgonButton
                      variant="gradient"
                      color="info"
                      onClick={handleUpdateProfile}
                      disabled={loadingProfile}
                    >
                      {loadingProfile ? <CircularProgress size={24} color="inherit" /> : "Update Profile"}
                    </ArgonButton>
                  </ArgonBox>
                </ArgonBox>
              </ArgonBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <ArgonBox p={3}>
                <ArgonTypography variant="h5">Change Password</ArgonTypography>
                <ArgonBox component="form" role="form" mt={2}>
                  <ArgonBox mb={2}>
                    <ArgonInput
                      type="password"
                      placeholder="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </ArgonBox>
                  <ArgonBox mb={2}>
                    <ArgonInput
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </ArgonBox>
                  <ArgonBox mt={4} mb={1}>
                    <ArgonButton
                      variant="gradient"
                      color="info"
                      onClick={handleChangePassword}
                      disabled={loadingPassword}
                    >
                      {loadingPassword ? <CircularProgress size={24} color="inherit" /> : "Change Password"}
                    </ArgonButton>
                  </ArgonBox>
                </ArgonBox>
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
