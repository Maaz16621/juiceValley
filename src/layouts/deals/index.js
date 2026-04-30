import { useState, useEffect } from "react";
import {
  Card,
  Icon,
  Menu,
  MenuItem,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Autocomplete
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

function Deals() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dealPrice, setDealPrice] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchDeals();
  }, []);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(firestore, "products"));
    const productsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(productsData);
  };

  const fetchDeals = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(firestore, "deals"));
    const dealsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDeals(dealsData);
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
    setSelectedDeal(null);
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = () => {
    const deal = currentRow;
    setSelectedDeal(deal);
    setTitle(deal.title);
    setDescription(deal.description);
    setDealPrice(deal.dealPrice);
    
    const dealProducts = deal.productIds.map((id, index) => {
      const product = products.find(p => p.id === id);
      return product ? { ...product, quantity: deal.productQuantities?.[index] || 1 } : null;
    }).filter(Boolean);
    setSelectedProducts(dealProducts);
    
    setImagePreview(deal.imageUrl);
    setStartDate(deal.startDate);
    setEndDate(deal.endDate);
    setModalOpen(true);
    handleMenuClose();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDealPrice("");
    setSelectedProducts([]);
    setImageFile(null);
    setImagePreview("");
    setStartDate("");
    setEndDate("");
  };

  const handleDelete = async () => {
    if (currentRow.imageUrl) {
      const imageRef = ref(storage, currentRow.imageUrl);
      try {
        await deleteObject(imageRef);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
    await deleteDoc(doc(firestore, "deals", currentRow.id));
    fetchDeals();
    handleMenuClose();
  };

  const calculateActualPrice = () => {
    return selectedProducts.reduce((total, product) => {
      const quantity = product?.quantity || 1;
      return total + (product ? Number(product.price) * quantity : 0);
    }, 0);
  };

  const handleProductQuantityChange = (productId, newQuantity) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, quantity: Math.max(1, newQuantity) } : p
    ));
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let imageUrl = selectedDeal ? selectedDeal.imageUrl : "";

    if (imageFile) {
      const imageName = `deals/${Date.now()}_${imageFile.name}`;
      const imageRef = ref(storage, imageName);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    const actualPrice = calculateActualPrice();
    const productIds = selectedProducts.map(p => p.id);
    const productQuantities = selectedProducts.map(p => p.quantity || 1);

    const dealData = {
      title,
      description,
      productIds,
      productQuantities,
      actualPrice,
      dealPrice: Number(dealPrice),
      imageUrl,
      startDate,
      endDate,
      updatedAt: new Date(),
    };

    if (selectedDeal) {
      const dealRef = doc(firestore, "deals", selectedDeal.id);
      await updateDoc(dealRef, dealData);
    } else {
      dealData.createdAt = new Date();
      await addDoc(collection(firestore, "deals"), dealData);
    }

    setSaving(false);
    setModalOpen(false);
    fetchDeals();
  };

  const columns = [
    {
      field: "imageUrl",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <ArgonAvatar src={params.value} alt={params.row.title} size="sm" />
      ),
      sortable: false,
    },
    { field: "title", headerName: "Title", flex: 1 },
    {
      field: "dealPrice",
      headerName: "Price",
      type: "number",
      renderCell: (params) => (
        <ArgonBox display="flex" flexDirection="column">
          <ArgonTypography variant="button" fontWeight="medium">
            {params.value}
          </ArgonTypography>
          <ArgonTypography
            variant="caption"
            color="text"
            sx={{ textDecoration: "line-through" }}
          >
            {params.row.actualPrice}
          </ArgonTypography>
        </ArgonBox>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const today = new Date().toISOString().split("T")[0];
        const isActive =
          params.row.startDate <= today && params.row.endDate >= today;
        return (
          <Chip
            label={isActive ? "Active" : "Expired"}
            color={isActive ? "success" : "error"}
            size="small"
          />
        );
      },
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
              <ArgonTypography variant="h6">Deal Manager</ArgonTypography>
              <ArgonButton variant="gradient" color="info" onClick={handleAdd}>
                <Icon>add</Icon>&nbsp; Add Deal
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
                  rows={deals}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  disableSelectionOnClick
                  rowHeight={80}
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

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedDeal ? "Edit Deal" : "Add New Deal"}</DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                placeholder="Deal Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                placeholder="Description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                   <TextField
                    placeholder="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    placeholder="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={products}
                getOptionLabel={(option) => option.name}
                value={selectedProducts}
                onChange={(event, newValue) => {
                  const newProducts = newValue.map(product => {
                    const existing = selectedProducts.find(p => p.id === product.id);
                    return existing ? existing : { ...product, quantity: 1 };
                  });
                  setSelectedProducts(newProducts);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Search Products..."
                    size="small"
                    sx={{ mb: 2 }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip key={option.id} variant="outlined" label={option.name} size="small" {...getTagProps({ index })} />
                  ))
                }
                sx={{ mb: 2 }}
              />

              {selectedProducts.length > 0 && (
                <ArgonBox sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  <ArgonTypography variant="button" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>
                    Selected Products
                  </ArgonTypography>
                  {selectedProducts.map((product) => (
                    <ArgonBox 
                      key={product.id} 
                      display="flex" 
                      justifyContent="space-between" 
                      alignItems="center" 
                      sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}
                    >
                      <ArgonBox flex={1}>
                        <ArgonTypography variant="button" sx={{ display: 'block' }}>
                          {product.name}
                        </ArgonTypography>
                        <ArgonTypography variant="caption" color="text">
                          ${product.price} each
                        </ArgonTypography>
                      </ArgonBox>
                      <ArgonBox display="flex" alignItems="center" gap={1}>
                        <TextField
                          type="number"
                          inputProps={{ min: 1 }}
                          value={product.quantity || 1}
                          onChange={(e) => handleProductQuantityChange(product.id, parseInt(e.target.value))}
                          size="small"
                          variant="outlined"
                          sx={{ width: 60 }}
                        />
                        <ArgonTypography variant="button" fontWeight="bold" sx={{ minWidth: 50 }}>
                          ${(Number(product.price) * (product.quantity || 1)).toFixed(2)}
                        </ArgonTypography>
                        <ArgonButton
                          color="error"
                          size="small"
                          iconOnly
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <Icon>close</Icon>
                        </ArgonButton>
                      </ArgonBox>
                    </ArgonBox>
                  ))}
                </ArgonBox>
              )}
              
              <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2} p={1.5} sx={{ bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <ArgonTypography variant="button" fontWeight="bold">Actual Value:</ArgonTypography>
                <ArgonTypography variant="h6" color="success">${calculateActualPrice()}</ArgonTypography>
              </ArgonBox>

              <TextField
                type="number"
                placeholder="Deal Price"
                value={dealPrice}
                onChange={(e) => setDealPrice(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <ArgonBox mt={1}>
                <input
                  accept="image/*"
                  type="file"
                  id="deal-image-upload"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <label htmlFor="deal-image-upload">
                  <ArgonButton variant="outlined" component="span" color="info" fullWidth size="small">
                    Upload Image
                  </ArgonButton>
                </label>
                {imagePreview && (
                    <ArgonBox mt={1} textAlign="center">
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '8px', objectFit: 'contain' }} />
                    </ArgonBox>
                )}
              </ArgonBox>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <ArgonButton onClick={() => setModalOpen(false)} color="secondary">
            Cancel
          </ArgonButton>
          <ArgonButton onClick={handleSave} color="info" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Save Deal"}
          </ArgonButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default Deals;