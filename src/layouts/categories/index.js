import { useState, useEffect } from "react";
import {
  Card,
  Icon,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { firestore, storage } from "../../firebase";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonAvatar from "components/ArgonAvatar";
import CategoryForm from "./components/CategoryForm";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(firestore, "categories"));
    const categoriesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(categoriesData);
    setLoading(false);
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentRow(null);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleEdit = () => {
    setSelectedCategory(currentRow);
    setFormOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (currentRow.imageUrl) {
      const imageRef = ref(storage, currentRow.imageUrl);
      await deleteObject(imageRef);
    }
    await deleteDoc(doc(firestore, "categories", currentRow.id));
    fetchCategories();
    handleMenuClose();
  };

  const handleSave = async (categoryData) => {
    let imageUrl = selectedCategory ? selectedCategory.imageUrl : "";
    if (categoryData.image) {
      const imageName = `${Date.now()}_${categoryData.image.name}`;
      const imageRef = ref(storage, `categories/${imageName}`);
      await uploadBytes(imageRef, categoryData.image);
      imageUrl = await getDownloadURL(imageRef);
    }

    const dataToSave = {
      name: categoryData.name,
      description: categoryData.description,
      imageUrl,
    };

    if (selectedCategory) {
      const categoryDoc = doc(firestore, "categories", selectedCategory.id);
      await updateDoc(categoryDoc, dataToSave);
    } else {
      await addDoc(collection(firestore, "categories"), dataToSave);
    }
    fetchCategories();
  };

  const columns = [
    {
      field: "imageUrl",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <ArgonAvatar src={params.value} alt={params.row.name} size="sm" />
      ),
      sortable: false,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: (params) => (
        <>
          <ArgonButton
            onClick={(event) => handleMenuOpen(event, params.row)}
            size="small"
            iconOnly
          >
            <Icon>more_vert</Icon>
          </ArgonButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && currentRow?.id === params.row.id}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <ArgonBox mb={3}>
          <Card>
            <ArgonBox
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={3}
            >
              <ArgonTypography variant="h6">Categories</ArgonTypography>
              <ArgonButton variant="gradient" color="info" onClick={handleAdd}>
                <Icon>add</Icon>&nbsp; Add Category
              </ArgonButton>
            </ArgonBox>
            <ArgonBox sx={{ height: 600, width: "100%" }}>
              {loading ? (
                <ArgonBox
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <CircularProgress />
                </ArgonBox>
              ) : (
                <DataGrid
                  rows={categories}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  disableSelectionOnClick
                  sx={{
                    "& .MuiDataGrid-cell": {
                      padding: "0 1rem",
                    },
                    "& .MuiDataGrid-columnHeader": {
                      padding: "0 1rem",
                    },
                  }}
                />
              )}
            </ArgonBox>
          </Card>
        </ArgonBox>
      </ArgonBox>
      {formOpen && (
        <CategoryForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          category={selectedCategory}
        />
      )}
      <Footer />
    </DashboardLayout>
  );
}

export default Categories;
