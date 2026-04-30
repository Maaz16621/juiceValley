import { useState, useEffect } from "react";
import {
  Card,
  Icon,
  Menu,
  MenuItem,
  CircularProgress,
  Chip,
  IconButton
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
import { firestore } from "../../firebase";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import DiscountForm from "./components/DiscountForm";
import { toast } from "react-hot-toast";

function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, "discounts"));
      const discountsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDiscounts(discountsData);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      toast.error("Failed to load discounts");
    } finally {
      setLoading(false);
    }
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
    setSelectedDiscount(null);
    setFormOpen(true);
  };

  const handleEdit = () => {
    setSelectedDiscount(currentRow);
    setFormOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(firestore, "discounts", currentRow.id));
      toast.success("Discount deleted successfully");
      fetchDiscounts();
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast.error("Failed to delete discount");
    }
    handleMenuClose();
  };

  const handleSave = async (discountData) => {
    try {
      const dataToSave = {
        code: discountData.code,
        type: discountData.type,
        value: Number(discountData.value),
        startDate: discountData.startDate,
        endDate: discountData.endDate,
        usageLimit: discountData.usageLimit ? Number(discountData.usageLimit) : null,
        applicableProducts: discountData.applicableProducts,
        updatedAt: new Date().toISOString(),
      };

      if (selectedDiscount) {
        const discountDoc = doc(firestore, "discounts", selectedDiscount.id);
        await updateDoc(discountDoc, dataToSave);
        toast.success("Discount updated successfully");
      } else {
        await addDoc(collection(firestore, "discounts"), {
          ...dataToSave,
          createdAt: new Date().toISOString(),
        });
        toast.success("Discount created successfully");
      }
      fetchDiscounts();
    } catch (error) {
      console.error("Error saving discount:", error);
      toast.error("Failed to save discount");
    }
  };

  const columns = [
    {
      field: "code",
      headerName: "Code",
      flex: 1,
      renderCell: (params) => (
        <ArgonTypography variant="button" fontWeight="medium">
          {params.value}
        </ArgonTypography>
      ),
    },
    {
      field: "value",
      headerName: "Value",
      flex: 1,
      renderCell: (params) => (
        <ArgonTypography variant="caption" color="text">
          {params.row.type === 'percentage' ? `${params.value}%` : `$${params.value}`}
        </ArgonTypography>
      ),
    },
    {
      field: "dates",
      headerName: "Validity",
      flex: 1.5,
      renderCell: (params) => {
        const start = params.row.startDate || "N/A";
        const end = params.row.endDate || "Ongoing";
        return (
          <ArgonBox display="flex" flexDirection="column">
             <ArgonTypography variant="caption" color="text">Start: {start}</ArgonTypography>
             <ArgonTypography variant="caption" color="text">End: {end}</ArgonTypography>
          </ArgonBox>
        );
      }
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
          const now = new Date();
          const start = new Date(params.row.startDate);
          const end = params.row.endDate ? new Date(params.row.endDate) : null;
          let status = "Active";
          let color = "success";

          if (now < start) {
              status = "Scheduled";
              color = "info";
          } else if (end && now > end) {
              status = "Expired";
              color = "error";
          }

          return <Chip label={status} color={color} size="small" />;
      }
    },
    {
      field: "products",
      headerName: "Products",
      flex: 1,
      renderCell: (params) => {
          const count = params.row.applicableProducts ? params.row.applicableProducts.length : 0;
          return <ArgonTypography variant="caption" color="text">{count === 0 ? "All Products" : `${count} Products`}</ArgonTypography>
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={(event) => handleMenuOpen(event, params.row)}
            size="small"
          >
            <Icon>more_vert</Icon>
          </IconButton>
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
              <ArgonTypography variant="h6">Discount Manager</ArgonTypography>
              <ArgonButton variant="gradient" color="primary" onClick={handleAdd}>
                <Icon>add</Icon>&nbsp; Add Discount
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
                  rows={discounts}
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
        <DiscountForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          discount={selectedDiscount}
        />
      )}
      <Footer />
    </DashboardLayout>
  );
}

export default Discounts;
