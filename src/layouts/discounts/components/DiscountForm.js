import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Autocomplete,
  TextField,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../../firebase";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";

function DiscountForm({ open, onClose, onSave, discount }) {
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    applicableProducts: [], // Array of product IDs
  });

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code || "",
        type: discount.type || "percentage",
        value: discount.value || "",
        startDate: discount.startDate || "",
        endDate: discount.endDate || "",
        usageLimit: discount.usageLimit || "",
        applicableProducts: discount.applicableProducts || [],
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        code: "",
        type: "percentage",
        value: "",
        startDate: today,
        endDate: "",
        usageLimit: "",
        applicableProducts: [],
      });
    }
  }, [discount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{discount ? "Edit Discount" : "Add Discount"}</DialogTitle>
      <DialogContent>
        <ArgonBox component="form" role="form" p={1} mt={1}>
          <ArgonBox mb={2}>
            <ArgonTypography component="label" variant="caption" fontWeight="bold">
              Discount Code
            </ArgonTypography>
            <ArgonInput
              placeholder="e.g. SUMMER2024"
              name="code"
              value={formData.code}
              onChange={handleChange}
              fullWidth
            />
          </ArgonBox>

          <ArgonBox mb={2} display="flex" gap={2}>
            <ArgonBox width="50%">
              <ArgonTypography component="label" variant="caption" fontWeight="bold">
                Type
              </ArgonTypography>
              <FormControl fullWidth size="small">
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  sx={{ height: "40px" }}
                >
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </ArgonBox>
            <ArgonBox width="50%">
              <ArgonTypography component="label" variant="caption" fontWeight="bold">
                Value
              </ArgonTypography>
              <ArgonInput
                placeholder={formData.type === "percentage" ? "20" : "5.00"}
                name="value"
                type="number"
                value={formData.value}
                onChange={handleChange}
                fullWidth
              />
            </ArgonBox>
          </ArgonBox>

          <ArgonBox mb={2} display="flex" gap={2}>
            <ArgonBox width="50%">
              <ArgonTypography component="label" variant="caption" fontWeight="bold">
                Start Date
              </ArgonTypography>
              <ArgonInput
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                fullWidth
              />
            </ArgonBox>
            <ArgonBox width="50%">
              <ArgonTypography component="label" variant="caption" fontWeight="bold">
                End Date
              </ArgonTypography>
              <ArgonInput
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                fullWidth
              />
            </ArgonBox>
          </ArgonBox>

          <ArgonBox mb={2}>
            <ArgonTypography component="label" variant="caption" fontWeight="bold">
              Usage Limit
            </ArgonTypography>
            <ArgonInput
              placeholder="Leave empty for unlimited"
              name="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={handleChange}
              fullWidth
            />
          </ArgonBox>

          <ArgonBox mb={2}>
            <ArgonTypography component="label" variant="caption" fontWeight="bold">
              Applicable Products
            </ArgonTypography>
            <Autocomplete
              multiple
              options={products}
              getOptionLabel={(option) => option.name}
              value={products.filter((p) => formData.applicableProducts.includes(p.id))}
              onChange={(event, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  applicableProducts: newValue.map((item) => item.id),
                }));
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Select products" 
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                        padding: "3px 9px"
                    }
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </ArgonBox>
        </ArgonBox>
      </DialogContent>
      <DialogActions>
        <ArgonButton onClick={onClose} color="secondary">
          Cancel
        </ArgonButton>
        <ArgonButton onClick={handleSubmit} color="info" variant="gradient">
          Save
        </ArgonButton>
      </DialogActions>
    </Dialog>
  );
}

DiscountForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  discount: PropTypes.shape({
    id: PropTypes.string,
    code: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    usageLimit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    applicableProducts: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default DiscountForm;
