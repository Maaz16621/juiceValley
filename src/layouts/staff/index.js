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

function Staff() {
  const [staff, setStaff] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handleEditOpen = (staffMember) => {
    setEditingStaff(staffMember);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditingStaff(null);
    setEditOpen(false);
    setError("");
  };

  const openDeleteModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedStaff(null);
    setDeleteModalOpen(false);
  };

  const openDeactivateModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setDeactivateModalOpen(true);
  };

  const closeDeactivateModal = () => {
    setSelectedStaff(null);
    setDeactivateModalOpen(false);
  };

  const fetchStaff = async () => {
    const querySnapshot = await getDocs(collection(firestore, "staff"));
    const staffList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStaff(staffList);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async () => {
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
      await addDoc(collection(firestore, "staff"), {
        uid: user.uid,
        name: name,
        email: email,
        role: "staff",
        status: "active",
        createdAt: new Date()
      });
      fetchStaff();
      handleClose();
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleUpdateStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const staffRef = doc(firestore, "staff", editingStaff.id);
      await updateDoc(staffRef, {
        name: editingStaff.name,
      });
      fetchStaff();
      handleEditClose();
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const staffRef = doc(firestore, "staff", selectedStaff.id);
      await updateDoc(staffRef, {
        status: selectedStaff.status === "active" ? "inactive" : "active",
      });
      fetchStaff();
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
      await deleteUser({ uid: selectedStaff.uid, collection: 'staff' });
      fetchStaff();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting staff:", error);
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

  const rows = staff.map(member => ({
    name: [member.name, member.email],
    status: (
      <ArgonTypography variant="caption" color={member.status === 'active' ? "success" : "error"} fontWeight="medium">
        {member.status}
      </ArgonTypography>
    ),
    employed: member.createdAt.toDate().toLocaleDateString(),
    action: (
      <ArgonBox>
        <ArgonButton variant="text" color="info" onClick={() => handleEditOpen(member)}>
          Edit
        </ArgonButton>
        <ArgonButton variant="text" color="secondary" onClick={() => openDeactivateModal(member)}>
          {member.status === 'active' ? 'Deactivate' : 'Activate'}
        </ArgonButton>
        <ArgonButton variant="text" color="error" onClick={() => openDeleteModal(member)}>
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
            Add New Staff
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
                onClick={handleAddStaff}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="white" /> : "Add Staff"}
              </ArgonButton>
            </ArgonBox>
          </ArgonBox>
        </ArgonBox>
      </Modal>
      {editingStaff && (
        <Modal
          open={editOpen}
          onClose={handleEditClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <ArgonBox sx={style}>
            <ArgonTypography id="modal-modal-title" variant="h6" component="h2">
              Edit Staff
            </ArgonTypography>
            <ArgonBox component="form" role="form" mt={2}>
              <ArgonBox mb={2}>
                <ArgonInput
                  type="text"
                  placeholder="Name"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
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
                  onClick={handleUpdateStaff}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} color="white" /> : "Update Staff"}
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
            Are you sure you want to {selectedStaff?.status === 'active' ? 'deactivate' : 'activate'} this staff member?
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
            Are you sure you want to delete this staff member? This action cannot be undone.
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
              <ArgonTypography variant="h6">Staff</ArgonTypography>
              <ArgonButton variant="gradient" color="info" onClick={handleOpen}>
                Add Staff
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

export default Staff;