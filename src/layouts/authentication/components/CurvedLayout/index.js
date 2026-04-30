/**
=========================================================
* Argon Dashboard 2 MUI - v3.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-material-ui
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Argon Dashboard 2 MUI example components
import PageLayout from "examples/LayoutContainers/PageLayout";

// Images
import waves from "assets/images/shapes/waves-white.svg";

function CurvedLayout({ color, title, description, children }) {
  return (
    <PageLayout background="white">
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8} md={5} lg={4} xl={3}>
          <ArgonBox
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <ArgonBox
              bgColor={color}
              variant="gradient"
              width="100%"
              height="30%"
              position="absolute"
              top={0}
              left={0}
              sx={{
                borderBottomLeftRadius: ({ borders: { borderRadius } }) => borderRadius.lg,
                borderBottomRightRadius: ({ borders: { borderRadius } }) => borderRadius.lg,
                backgroundImage: ({ functions: { linearGradient }, palette: { gradients, transparent } }) =>
                  gradients[color]
                    ? `${linearGradient(
                        gradients[color].main,
                        gradients[color].state
                      )}, url(${waves})`
                    : `${linearGradient(transparent.main, transparent.main)}, url(${waves})`,
                backgroundSize: "cover",
              }}
            />
            <ArgonBox
              px={3}
              textAlign="center"
              width="100%"
              position="relative"
              zIndex={1}
              py={3}
            >
              <ArgonBox mb={1}>
                <ArgonTypography variant="h4" fontWeight="bold" color="white">
                  {title}
                </ArgonTypography>
              </ArgonBox>
              <ArgonTypography variant="body2" fontWeight="regular" color="white">
                {description}
              </ArgonTypography>
            </ArgonBox>
            <ArgonBox p={3} width="100%">
              {children}
            </ArgonBox>
          </ArgonBox>
        </Grid>
      </Grid>
    </PageLayout>
  );
}

// Setting default values for the props of CurvedLayout
CurvedLayout.defaultProps = {
  color: "info",
  title: "",
  description: "",
};

// Typechecking props for the CurvedLayout
CurvedLayout.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default CurvedLayout;
