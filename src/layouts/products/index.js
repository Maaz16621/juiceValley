import { useState, useEffect } from "react";
import {
  Card,
  Icon,
  Menu,
  MenuItem,
  CircularProgress,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
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
import ProductForm from "./components/ProductForm";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(firestore, "products"));
    const productsData = await Promise.all(
      querySnapshot.docs.map(async (productDoc) => {
        const data = productDoc.data();
        let categoryName = "N/A";
        if (data.categoryId) {
          const categoryDocRef = doc(firestore, "categories", data.categoryId);
          const categoryDoc = await getDoc(categoryDocRef);
          if (categoryDoc.exists()) {
            categoryName = categoryDoc.data().name;
          }
        }
        return {
          id: productDoc.id,
          ...data,
          categoryName,
        };
      })
    );
    setProducts(productsData);
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
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const handleEdit = () => {
    setSelectedProduct(currentRow);
    setFormOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (currentRow.imageUrl) {
      const imageRef = ref(storage, currentRow.imageUrl);
      await deleteObject(imageRef);
    }
    await deleteDoc(doc(firestore, "products", currentRow.id));
    fetchProducts();
    handleMenuClose();
  };

  const handleSave = async (productData) => {
    let imageUrl = selectedProduct ? selectedProduct.imageUrl : "";
    if (productData.image) {
      const imageName = `${Date.now()}_${productData.image.name}`;
      const imageRef = ref(storage, `products/${imageName}`);
      await uploadBytes(imageRef, productData.image);
      imageUrl = await getDownloadURL(imageRef);
    }

    const dataToSave = {
      name: productData.name,
      description: productData.description,
      price: Number(productData.price),
      categoryId: productData.categoryId,
      isDiscontinued: productData.isDiscontinued,
      energyValue: productData.energyValue,
      ingredients: productData.ingredients,
      imageUrl,
    };

    if (selectedProduct) {
      const productDoc = doc(firestore, "products", selectedProduct.id);
      await updateDoc(productDoc, dataToSave);
    } else {
      await addDoc(collection(firestore, "products"), dataToSave);
    }
    fetchProducts();
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
      field: "categoryName",
      headerName: "Category",
      flex: 1,
    },
    {
      field: "price",
      headerName: "Price",
      type: "number",
    },
    {
      field: "isDiscontinued",
      headerName: "Status",
      renderCell: (params) => (
        <Chip
          label={params.value ? "Discontinued" : "Active"}
          color={params.value ? "error" : "success"}
          size="small"
        />
      ),
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
              <ArgonTypography variant="h6">Products</ArgonTypography>
              <ArgonButton
                variant="gradient"
                color="info"
                onClick={handleAdd}
              >
                <Icon>add</Icon>&nbsp; Add Product
              </ArgonButton>
            </ArgonBox>
            <ArgonBox sx={{ height: 600, width: "100%", p: 2 }}>
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
                  rows={products}
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
        <ProductForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          product={selectedProduct}
        />
      )}
      <Footer />
    </DashboardLayout>
  );
}

export default Products;
