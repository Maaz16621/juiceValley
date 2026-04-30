import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
  Switch,
  FormControlLabel,
  Autocomplete,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import ArgonBox from "components/ArgonBox";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../../firebase";

function ProductForm({ open, onClose, onSave, product }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState(null);
  const [isDiscontinued, setIsDiscontinued] = useState(false);
  const [energyValue, setEnergyValue] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(firestore, "categories"));
      const categoriesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesData);
      if (product && product.categoryId) {
        setCategory(categoriesData.find((c) => c.id === product.categoryId));
      }
    };
    fetchCategories();
  }, [product]);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price || "");
      setImageUrl(product.imageUrl || "");
      setIsDiscontinued(product.isDiscontinued || false);
      setEnergyValue(product.energyValue || "");
      
      // Handle conversion from string if necessary
      if (Array.isArray(product.ingredients)) {
        setIngredients(product.ingredients);
      } else if (typeof product.ingredients === "string" && product.ingredients.length > 0) {
        setIngredients(product.ingredients.split(",").map(i => i.trim()));
      } else {
        setIngredients([]);
      }
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setCategory(null);
      setIsDiscontinued(false);
      setEnergyValue("");
      setIngredients([]);
    }
  }, [product]);

  const handleSave = () => {
    onSave({
      name,
      description,
      price,
      image,
      categoryId: category ? category.id : null,
      isDiscontinued,
      energyValue,
      ingredients,
    });
    onClose();
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  const updateIngredient = (index, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setIngredients(updatedIngredients);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
      <DialogContent>
        <ArgonBox component="form" role="form" pt={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold">Name</ArgonTypography>
                <ArgonInput
                  placeholder="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                />
              </ArgonBox>
            </Grid>
            <Grid item xs={12}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold">Description</ArgonTypography>
                <ArgonInput
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />
              </ArgonBox>
            </Grid>
            <Grid item xs={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold">Price (Optional)</ArgonTypography>
                <ArgonInput
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  fullWidth
                />
              </ArgonBox>
            </Grid>
            <Grid item xs={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold">Category</ArgonTypography>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  value={category}
                  onChange={(event, newValue) => {
                    setCategory(newValue);
                  }}
                  renderInput={(params) => (
                    <ArgonInput
                      {...params}
                      placeholder="Category"
                      fullWidth
                    />
                  )}
                />
              </ArgonBox>
            </Grid>
            <Grid item xs={12}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold">Energy Value (e.g., 250 kcal)</ArgonTypography>
                <ArgonInput
                  placeholder="Energy Value"
                  value={energyValue}
                  onChange={(e) => setEnergyValue(e.target.value)}
                  fullWidth
                />
              </ArgonBox>
            </Grid>
            
            <Grid item xs={12}>
              <ArgonTypography variant="caption" fontWeight="bold">Ingredients</ArgonTypography>
              <ArgonBox display="flex" gap={1} mb={1}>
                <ArgonInput
                  placeholder="Add Ingredient"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  fullWidth
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                />
                <ArgonButton onClick={addIngredient} color="info" size="small">
                  Add
                </ArgonButton>
              </ArgonBox>
              
              <ArgonBox sx={{ border: "1px solid #ddd", borderRadius: "8px" }}>
                <List size="small" disablePadding>
                  {ingredients.map((ingredient, index) => (
                    <ListItem key={index} divider={index !== ingredients.length - 1}>
                      <ArgonInput
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ 
                          "& .MuiInputBase-root": { border: "none", boxShadow: "none" }, 
                          "& .MuiInputBase-input": { padding: "8px 0" } 
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => removeIngredient(index)} size="small">
                          <Icon color="error">delete</Icon>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {ingredients.length === 0 && (
                    <ListItem>
                      <ListItemText 
                        primary={<ArgonTypography variant="caption" color="text">No ingredients added yet.</ArgonTypography>} 
                      />
                    </ListItem>
                  )}
                </List>
              </ArgonBox>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDiscontinued}
                    onChange={(e) => setIsDiscontinued(e.target.checked)}
                  />
                }
                label="Discontinued"
              />
            </Grid>
            <Grid item xs={12}>
              <ArgonBox display="flex" alignItems="center" gap={2} mt={1}>
                <ArgonButton component="label" variant="outlined" color="info" size="small">
                  <Icon>upload</Icon>&nbsp; Upload Image
                  <input type="file" hidden onChange={handleImageChange} />
                </ArgonButton>
                {imageUrl && (
                  <ArgonBox
                    component="img"
                    src={imageUrl}
                    alt="Preview"
                    width="60px"
                    height="60px"
                    sx={{ objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }}
                  />
                )}
              </ArgonBox>
            </Grid>
          </Grid>
        </ArgonBox>
      </DialogContent>
      <DialogActions>
        <ArgonButton onClick={onClose} color="secondary">
          Cancel
        </ArgonButton>
        <ArgonButton onClick={handleSave} color="info" variant="gradient">
          Save
        </ArgonButton>
      </DialogActions>
    </Dialog>
  );
}

ProductForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  product: PropTypes.object,
};

export default ProductForm;