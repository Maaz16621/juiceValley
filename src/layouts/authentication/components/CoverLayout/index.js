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

import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import ArgonBox from "components/ArgonBox";
import PageLayout from "examples/LayoutContainers/PageLayout";

function CoverLayout({ color, image, children }) {
  return (
    <PageLayout>
      <Grid
        container
        justifyContent="center"
        sx={{
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <Grid item xs={11} sm={8} md={6} lg={5} xl={4}>
          <ArgonBox
            display="flex"
            flexDirection="column"
            justifyContent="center"
            minHeight="100vh"
            py={3}
            px={3}
          >
            <ArgonBox
              display={{ xs: "none", md: "block" }}
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100vh"
              sx={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
              }}
            />
            <ArgonBox
              bgColor={color}
              variant="gradient"
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100vh"
              opacity={0.6}
            />
            <ArgonBox
              bgColor="white"
              borderRadius="lg"
              shadow="lg"
              p={3}
              position="relative"
              zIndex={1}
            >
              {children}
            </ArgonBox>
          </ArgonBox>
        </Grid>
      </Grid>
    </PageLayout>
  );
}

CoverLayout.defaultProps = {
  color: "info",
};

CoverLayout.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
    "light",
  ]),
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default CoverLayout;
