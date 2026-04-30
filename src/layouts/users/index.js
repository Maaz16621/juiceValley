import { Card, Grid, Modal, CircularProgress } from "@mui/material";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import ArgonButton from "components/ArgonButton";
import { useEffect, useState } from "react";
import { firestore, auth, functions } from "../../firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { createUserWithEmailAndPassword } from "firebase/auth";
import ArgonInput from "components/ArgonInput";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handleEditOpen = (user) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditingUser(null);
    setEditOpen(false);
    setError("");
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedUser(null);
    setDeleteModalOpen(false);
  };

  const openDeactivateModal = (user) => {
    setSelectedUser(user);
    setDeactivateModalOpen(true);
  };

  const closeDeactivateModal = () => {
    setSelectedUser(null);
    setDeactivateModalOpen(false);
  };

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(firestore, "users"));
    const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    setLoading(true);
    setError("");
    if (!name || !email || !password) {
      setError("Please fill all the fields.");
      setLoading(false);
      return;
    }
    try {
      // This is not ideal for an admin panel as it will sign in the new user.
      // A server-side implementation (e.g., Cloud Function) is recommended to create users.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await addDoc(collection(firestore, "users"), {
        uid: user.uid,
        name: name,
        email: email,
        role: "user",
        status: "active",
        createdAt: new Date()
      });
      fetchUsers();
      handleClose();
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleUpdateUser = async () => {
    setLoading(true);
    setError("");
    try {
      const userRef = doc(firestore, "users", editingUser.id);
      await updateDoc(userRef, {
        name: editingUser.name,
      });
      fetchUsers();
      handleEditClose();
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const userRef = doc(firestore, "users", selectedUser.id);
      await updateDoc(userRef, {
        status: selectedUser.status === "active" ? "inactive" : "active",
      });
      fetchUsers();
      closeDeactivateModal();
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const deleteUser = httpsCallable(functions, 'deleteUser');
      await deleteUser({ uid: selectedUser.uid, collection: 'users' });
      fetchUsers();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error.message);
    }
    setLoading(false);
  };

  const columns = [
    { name: "name", align: "left" },
    { name: "status", align: "center" },
    { name: "employed", align: "center" },
    { name: "action", align: "center" },
  ];

  const rows = users.map(user => ({
    name: [user.name, user.email],
    status: (
      <ArgonTypography variant="caption" color={user.status === 'active' ? "success" : "error"} fontWeight="medium">
        {user.status}
      </ArgonTypography>
    ),
    employed: user.createdAt.toDate().toLocaleDateString(),
    action: (
      <ArgonBox>
        <ArgonButton variant="text" color="info" onClick={() => handleEditOpen(user)}>
          Edit
        </ArgonButton>
        <ArgonButton variant="text" color="secondary" onClick={() => openDeactivateModal(user)}>
          {user.status === 'active' ? 'Deactivate' : 'Activate'}
        </ArgonButton>
        <ArgonButton variant="text" color="error" onClick={() => openDeleteModal(user)}>
          Delete
        </ArgonButton>
      </ArgonBox>
    ),
    hasBorder: true,
  }));

  return (
    <DashboardLayout>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ArgonBox sx={style}>
          <ArgonTypography id="modal-modal-title" variant="h6" component="h2">
            Add New User
          </ArgonTypography>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </ArgonBox>
            <ArgonBox mb={2}>
              <ArgonInput
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
                onClick={handleAddUser}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="white" /> : "Add User"}
              </ArgonButton>
            </ArgonBox>
          </ArgonBox>
        </ArgonBox>
      </Modal>
      {editingUser && (
        <Modal
          open={editOpen}
          onClose={handleEditClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <ArgonBox sx={style}>
            <ArgonTypography id="modal-modal-title" variant="h6" component="h2">
              Edit User
            </ArgonTypography>
            <ArgonBox component="form" role="form" mt={2}>
              <ArgonBox mb={2}>
                <ArgonInput
                  type="text"
                  placeholder="Name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
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
                  onClick={handleUpdateUser}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} color="white" /> : "Update User"}
                </ArgonButton>
              </ArgonBox>
            </ArgonBox>
          </ArgonBox>
        </Modal>
      )}
      <Modal
        open={deactivateModalOpen}
        onClose={closeDeactivateModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ArgonBox sx={style}>
          <ArgonTypography id="modal-modal-title" variant="h6" component="h2">
            Confirm Action
          </ArgonTypography>
          <ArgonTypography id="modal-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to {selectedUser?.status === 'active' ? 'deactivate' : 'activate'} this user?
          </ArgonTypography>
          <ArgonBox mt={4} mb={1} display="flex" justifyContent="flex-end">
            <ArgonButton color="secondary" onClick={closeDeactivateModal} sx={{ mr: 1 }}>
              Cancel
            </ArgonButton>
            <ArgonButton
              variant="gradient"
              color="info"
              onClick={handleToggleStatus}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="white" /> : "Confirm"}
            </ArgonButton>
          </ArgonBox>
        </ArgonBox>
      </Modal>
      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ArgonBox sx={style}>
          <ArgonTypography id="modal-modal-title" variant="h6" component="h2">
            Confirm Deletion
          </ArgonTypography>
          <ArgonTypography id="modal-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to delete this user? This action cannot be undone.
          </ArgonTypography>
          <ArgonBox mt={4} mb={1} display="flex" justifyContent="flex-end">
            <ArgonButton color="secondary" onClick={closeDeleteModal} sx={{ mr: 1 }}>
              Cancel
            </ArgonButton>
            <ArgonButton
              variant="gradient"
              color="error"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="white" /> : "Delete"}
            </ArgonButton>
          </ArgonBox>
        </ArgonBox>
      </Modal>
      <ArgonBox py={3}>
        <ArgonBox mb={3}>
          <Card>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <ArgonTypography variant="h6">Users</ArgonTypography>
              <ArgonButton variant="gradient" color="info" onClick={handleOpen}>
                Add User
              </ArgonButton>
            </ArgonBox>
            <ArgonBox
              sx={{
                "& .MuiTableRow-root:not(:last-child)": {
                  "& td": {
                    borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                      `${borderWidth[1]} solid ${borderColor}`,
                  },
                },
              }}
            >
              <Table columns={columns} rows={rows} />
            </ArgonBox>
          </Card>
        </ArgonBox>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Users;