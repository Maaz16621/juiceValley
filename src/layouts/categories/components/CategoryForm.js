import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
} from "@mui/material";
import ArgonBox from "components/ArgonBox";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";

function CategoryForm({ open, onClose, onSave, category }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
      setImageUrl(category.imageUrl || "");
    } else {
      setName("");
      setDescription("");
      setImageUrl("");
    }
  }, [category]);

  const handleSave = () => {
    onSave({ name, description, image });
    onClose();
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
      <DialogContent>
        <ArgonBox component="form" role="form" p={1}>
          <ArgonBox mb={2}>
            <ArgonInput
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonInput
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonButton component="label" variant="outlined" color="info">
              <Icon>upload</Icon>&nbsp; Upload Image
              <input type="file" hidden onChange={handleImageChange} />
            </ArgonButton>
            {imageUrl && (
              <ArgonBox mt={2}>
                <ArgonTypography variant="caption">Image Preview:</ArgonTypography>
                <ArgonBox
                  component="img"
                  src={imageUrl}
                  alt="Preview"
                  width="100px"
                  height="100px"
                  sx={{ objectFit: "cover", borderRadius: "8px", mt: 1 }}
                />
              </ArgonBox>
            )}
          </ArgonBox>
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

CategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  category: PropTypes.object,
};

export default CategoryForm;