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

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import { MenuItem, Select, InputLabel, FormControl, Switch, CircularProgress } from "@mui/material";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";

// Argon Dashboard 2 MUI example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { toast } from "react-hot-toast";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../firebase";

import { State, City } from "country-state-city";

function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    businessName: "",
    currency: "USD",
    address: "",
    phone: "",
    email: "",
    facebook: "",
    instagram: "",
    twitter: "",
    description: "",
    taxRate: 0,
    minOrder: 0,
    openingHours: {
      monday: { start: "09:00", end: "18:00", isOpen: true },
      tuesday: { start: "09:00", end: "18:00", isOpen: true },
      wednesday: { start: "09:00", end: "18:00", isOpen: true },
      thursday: { start: "09:00", end: "18:00", isOpen: true },
      friday: { start: "09:00", end: "18:00", isOpen: true },
      saturday: { start: "10:00", end: "16:00", isOpen: true },
      sunday: { start: "", end: "", isOpen: false },
    }
  });

  const [offDate, setOffDate] = useState("");
  const [offDatesList, setOffDatesList] = useState([]);

  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [areaName, setAreaName] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [statesList] = useState(State.getStatesOfCountry("US"));
  const [citiesList, setCitiesList] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(firestore, "settings", "business");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const loadedSettings = data.general || {};
          
          // Ensure openingHours has the correct structure (migration for legacy data)
          const defaultOpeningHours = settings.openingHours;
          let mergedOpeningHours = { ...defaultOpeningHours };
          
          if (loadedSettings.openingHours) {
              Object.keys(defaultOpeningHours).forEach(day => {
                  const val = loadedSettings.openingHours[day];
                  if (typeof val === 'string') {
                      // Legacy format: "09:00 - 18:00" or "Closed"
                      if (val.toLowerCase() === 'closed') {
                          mergedOpeningHours[day] = { start: "", end: "", isOpen: false };
                      } else {
                          const parts = val.split(' - ');
                          if (parts.length === 2) {
                              mergedOpeningHours[day] = { start: parts[0], end: parts[1], isOpen: true };
                          } else {
                              mergedOpeningHours[day] = defaultOpeningHours[day];
                          }
                      }
                  } else if (typeof val === 'object') {
                      // New format
                      mergedOpeningHours[day] = { ...defaultOpeningHours[day], ...val };
                  }
              });
          }

          setSettings({ ...settings, ...loadedSettings, openingHours: mergedOpeningHours });
          setOffDatesList(data.offDates || []);
          setDeliveryLocations(data.deliveryLocations || []);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleStateChange = (stateCode) => {
    setSelectedState(stateCode);
    setSelectedCity("");
    if (stateCode) {
      setCitiesList(City.getCitiesOfState("US", stateCode));
    } else {
      setCitiesList([]);
    }
  };

  const handleAddLocation = async () => {
    if (!selectedState || !selectedCity) {
      toast.error("Please select both state and city");
      return;
    }

    const stateObj = statesList.find((s) => s.isoCode === selectedState);
    const newLocation = {
      stateCode: selectedState,
      stateName: stateObj.name,
      cityName: selectedCity,
      areaName: areaName || "All City",
      branchPhone: branchPhone,
      branchEmail: branchEmail,
      id: `${selectedState}-${selectedCity}-${areaName || "main"}`,
    };

    if (deliveryLocations.find((loc) => loc.id === newLocation.id)) {
      toast.error("This specific area is already added");
      return;
    }

    const updatedLocations = [...deliveryLocations, newLocation];
    setDeliveryLocations(updatedLocations);
    
    // Auto-save to Firestore to prevent data loss
    try {
      const docRef = doc(firestore, "settings", "business");
      await setDoc(docRef, {
        general: settings,
        offDates: offDatesList,
        deliveryLocations: updatedLocations,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast.success("Delivery area added and saved");
    } catch (error) {
      console.error("Error auto-saving location:", error);
      toast.error("Area added locally but failed to save to server");
    }

    setAreaName("");
    setBranchPhone("");
    setBranchEmail("");
  };

  const handleRemoveLocation = async (id) => {
    const updatedLocations = deliveryLocations.filter((loc) => loc.id !== id);
    setDeliveryLocations(updatedLocations);

    try {
      const docRef = doc(firestore, "settings", "business");
      await setDoc(docRef, {
        general: settings,
        offDates: offDatesList,
        deliveryLocations: updatedLocations,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast.error("Location removed and saved");
    } catch (error) {
      console.error("Error auto-saving removal:", error);
      toast.error("Removed locally but failed to sync with server");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOffDate = () => {
    if (offDate && !offDatesList.includes(offDate)) {
      setOffDatesList([...offDatesList, offDate]);
      setOffDate("");
      toast.success("Off date added");
    } else if (!offDate) {
      toast.error("Please select a date");
    } else {
      toast.error("Date already in the list");
    }
  };

  const handleRemoveOffDate = (dateToRemove) => {
    setOffDatesList(offDatesList.filter((date) => date !== dateToRemove));
    toast.error("Off date removed");
  };

  const handleSave = async () => {
    // Validate Opening Hours
    for (const day in settings.openingHours) {
        const { start, end, isOpen } = settings.openingHours[day];
        if (isOpen && start && end && end <= start) {
            toast.error(`Invalid hours for ${day}: End time must be after start time.`);
            return;
        }
        if (isOpen && (!start || !end)) {
             toast.error(`Please set both start and end times for ${day}.`);
             return;
        }
    }

    setSaving(true);
    try {
      const docRef = doc(firestore, "settings", "business");
      await setDoc(docRef, {
        general: settings,
        offDates: offDatesList,
        deliveryLocations: deliveryLocations,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <ArgonBox py={3} display="flex" justifyContent="center">
           <ArgonTypography>Loading settings...</ArgonTypography>
        </ArgonBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3} direction="column">
              {/* General Settings */}
              <Grid item xs={12}>
                <Card>
                  <ArgonBox p={3}>
                    <ArgonTypography variant="h5" fontWeight="medium">
                      General Settings
                    </ArgonTypography>
                    <ArgonBox mt={1} mb={2}>
                      <ArgonTypography variant="body2" color="text">
                        Manage your business details and currency.
                      </ArgonTypography>
                    </ArgonBox>

                    <ArgonBox component="form" role="form">
                      <ArgonBox mb={2}>
                        <ArgonBox mb={1} ml={0.5}>
                          <ArgonTypography component="label" variant="caption" fontWeight="bold">
                            Business Name
                          </ArgonTypography>
                        </ArgonBox>
                        <ArgonInput
                          type="text"
                          placeholder="Juice Valley"
                          name="businessName"
                          value={settings.businessName}
                          onChange={handleChange}
                        />
                      </ArgonBox>
                      
                      <ArgonBox mb={2}>
                        <ArgonBox mb={1} ml={0.5}>
                          <ArgonTypography component="label" variant="caption" fontWeight="bold">
                            Currency
                          </ArgonTypography>
                        </ArgonBox>
                        <FormControl fullWidth>
                          <Select
                            value={settings.currency}
                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                            sx={{ height: "40px" }}
                          >
                            <MenuItem value="USD">USD ($)</MenuItem>
                            <MenuItem value="EUR">EUR (€)</MenuItem>
                            <MenuItem value="GBP">GBP (£)</MenuItem>
                            <MenuItem value="INR">INR (₹)</MenuItem>
                            <MenuItem value="AED">AED (dh)</MenuItem>
                          </Select>
                        </FormControl>
                      </ArgonBox>

                      <ArgonBox mb={2}>
                        <ArgonBox mb={1} ml={0.5}>
                          <ArgonTypography component="label" variant="caption" fontWeight="bold">
                            Contact Email
                          </ArgonTypography>
                        </ArgonBox>
                        <ArgonInput
                          type="email"
                          placeholder="contact@juicevalley.com"
                          name="email"
                          value={settings.email}
                          onChange={handleChange}
                        />
                      </ArgonBox>

                      <ArgonBox mb={2}>
                        <ArgonBox mb={1} ml={0.5}>
                          <ArgonTypography component="label" variant="caption" fontWeight="bold">
                            Phone Number
                          </ArgonTypography>
                        </ArgonBox>
                        <ArgonInput
                          type="tel"
                          placeholder="+1 234 567 890"
                          name="phone"
                          value={settings.phone}
                          onChange={handleChange}
                        />
                      </ArgonBox>

                      <ArgonBox mb={2}>
                        <ArgonBox mb={1} ml={0.5}>
                          <ArgonTypography component="label" variant="caption" fontWeight="bold">
                            Address
                          </ArgonTypography>
                        </ArgonBox>
                        <ArgonInput
                          multiline
                          rows={3}
                          placeholder="123 Juice St, Fruit City"
                          name="address"
                          value={settings.address}
                          onChange={handleChange}
                        />
                      </ArgonBox>

                      <ArgonBox mb={2}>
                        <ArgonBox mb={1} ml={0.5}>
                          <ArgonTypography component="label" variant="caption" fontWeight="bold">
                            Business Description (for Webflow)
                          </ArgonTypography>
                        </ArgonBox>
                        <ArgonInput
                          multiline
                          rows={4}
                          placeholder="Describe your juice business..."
                          name="description"
                          value={settings.description}
                          onChange={handleChange}
                        />
                      </ArgonBox>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <ArgonBox mb={2}>
                            <ArgonBox mb={1} ml={0.5}>
                              <ArgonTypography component="label" variant="caption" fontWeight="bold">
                                Tax Rate (%)
                              </ArgonTypography>
                            </ArgonBox>
                            <ArgonInput
                              type="number"
                              placeholder="5"
                              name="taxRate"
                              value={settings.taxRate}
                              onChange={handleChange}
                            />
                          </ArgonBox>
                        </Grid>
                        <Grid item xs={6}>
                          <ArgonBox mb={2}>
                            <ArgonBox mb={1} ml={0.5}>
                              <ArgonTypography component="label" variant="caption" fontWeight="bold">
                                Min. Order Amount
                              </ArgonTypography>
                            </ArgonBox>
                            <ArgonInput
                              type="number"
                              placeholder="20"
                              name="minOrder"
                              value={settings.minOrder}
                              onChange={handleChange}
                            />
                          </ArgonBox>
                        </Grid>
                      </Grid>
                    </ArgonBox>
                  </ArgonBox>
                </Card>
              </Grid>

              {/* Opening Hours */}
              <Grid item xs={12}>
                <Card>
                  <ArgonBox p={3}>
                    <ArgonBox display="flex" justifyContent="space-between" alignItems="center">
                      <ArgonTypography variant="h5" fontWeight="medium">
                        Opening Hours
                      </ArgonTypography>
                      <ArgonButton 
                        size="small" 
                        color="info" 
                        variant="text"
                        onClick={() => {
                          const monday = settings.openingHours.monday;
                          if (!monday.isOpen) {
                             toast.error("Monday is closed. Cannot copy.");
                             return;
                          }
                          setSettings(prev => {
                            const newHours = { ...prev.openingHours };
                            Object.keys(newHours).forEach(day => {
                              if (day !== 'monday' && newHours[day].isOpen) {
                                newHours[day] = {
                                  ...newHours[day],
                                  start: monday.start,
                                  end: monday.end
                                };
                              }
                            });
                            return { ...prev, openingHours: newHours };
                          });
                          toast.success("Monday's hours applied to all open days");
                        }}
                      >
                        Copy Monday to all open
                      </ArgonButton>
                    </ArgonBox>
                    <ArgonBox mt={1} mb={2}>
                      <ArgonTypography variant="body2" color="text">
                        Set your weekly business hours. Toggle to close on specific days.
                      </ArgonTypography>
                    </ArgonBox>

                    {Object.keys(settings.openingHours).map((day) => {
                       const currentDay = settings.openingHours[day];
                       return (
                        <ArgonBox key={day} mb={1} display="flex" alignItems="center">
                          <ArgonBox width="20%">
                            <ArgonTypography variant="caption" fontWeight="bold" sx={{ textTransform: "capitalize" }}>
                              {day}
                            </ArgonTypography>
                          </ArgonBox>
                          
                          <ArgonBox width="20%" display="flex" alignItems="center">
                             <Switch 
                                checked={currentDay.isOpen}
                                onChange={(e) => {
                                   const isOpening = e.target.checked;
                                   let newDayState = { ...currentDay, isOpen: isOpening };
                                   
                                   // Auto-fill times if opening and times are empty
                                   if (isOpening && (!newDayState.start || !newDayState.end)) {
                                       const monday = settings.openingHours.monday;
                                       if (monday.start && monday.end) {
                                           newDayState.start = monday.start;
                                           newDayState.end = monday.end;
                                       } else {
                                           newDayState.start = "09:00";
                                           newDayState.end = "18:00";
                                       }
                                   }

                                   setSettings(prev => ({
                                      ...prev,
                                      openingHours: {
                                         ...prev.openingHours,
                                         [day]: newDayState
                                      }
                                   }));
                                }}
                             />
                             <ArgonTypography variant="caption" ml={1}>
                               {currentDay.isOpen ? "Open" : "Closed"}
                             </ArgonTypography>
                          </ArgonBox>

                          <ArgonBox width="60%" display="flex" alignItems="center" visibility={currentDay.isOpen ? "visible" : "hidden"}>
                            <ArgonInput
                              type="time"
                              size="small"
                              value={currentDay.start}
                              onChange={(e) => {
                                setSettings(prev => ({
                                  ...prev,
                                  openingHours: {
                                    ...prev.openingHours,
                                    [day]: { ...currentDay, start: e.target.value }
                                  }
                                }));
                              }}
                            />
                            <ArgonBox px={1}>
                              <ArgonTypography variant="caption">to</ArgonTypography>
                            </ArgonBox>
                             <ArgonInput
                              type="time"
                              size="small"
                              value={currentDay.end}
                              error={currentDay.end && currentDay.start && currentDay.end <= currentDay.start}
                              onChange={(e) => {
                                setSettings(prev => ({
                                  ...prev,
                                  openingHours: {
                                    ...prev.openingHours,
                                    [day]: { ...currentDay, end: e.target.value }
                                  }
                                }));
                              }}
                            />
                          </ArgonBox>
                        </ArgonBox>
                      );
                    })}
                  </ArgonBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3} direction="column">
              {/* Off Dates & Availability */}
              <Grid item xs={12}>
                <Card>
                    <ArgonBox p={3}>
                    <ArgonTypography variant="h5" fontWeight="medium">
                        Off Dates / Holidays
                    </ArgonTypography>
                    <ArgonBox mt={1} mb={2}>
                        <ArgonTypography variant="body2" color="text">
                        Select dates when orders cannot be placed.
                        </ArgonTypography>
                    </ArgonBox>
                    
                    <ArgonBox display="flex" alignItems="center" mb={2}>
                        <ArgonInput 
                            type="date" 
                            value={offDate} 
                            onChange={(e) => setOffDate(e.target.value)} 
                        />
                        <ArgonBox ml={2}>
                            <ArgonButton variant="gradient" color="info" onClick={handleAddOffDate}>
                            Add
                            </ArgonButton>
                        </ArgonBox>
                    </ArgonBox>

                    <ArgonBox>
                        {offDatesList.length > 0 ? (
                            offDatesList.map((date, index) => (
                                <ArgonBox key={index} display="flex" justifyContent="space-between" alignItems="center" py={1} borderBottom={index !== offDatesList.length - 1 ? "1px solid #eee" : "none"}>
                                    <ArgonTypography variant="body2">{date}</ArgonTypography>
                                    <Icon 
                                        color="error" 
                                        sx={{ cursor: "pointer" }} 
                                        onClick={() => handleRemoveOffDate(date)}
                                    >
                                        delete
                                    </Icon>
                                </ArgonBox>
                            ))
                        ) : (
                            <ArgonTypography variant="caption" color="text">No off dates added yet.</ArgonTypography>
                        )}
                    </ArgonBox>
                    </ArgonBox>
                </Card>
              </Grid>

              {/* Social Media */}
              <Grid item xs={12}>
                  <Card>
                    <ArgonBox p={3}>
                        <ArgonTypography variant="h5" fontWeight="medium">
                            Social Media
                        </ArgonTypography>
                         <ArgonBox mt={1} mb={2}>
                            <ArgonTypography variant="body2" color="text">
                                Links to be displayed on the website.
                            </ArgonTypography>
                        </ArgonBox>

                        <ArgonBox mb={2}>
                            <ArgonBox mb={1} ml={0.5}>
                                <ArgonTypography component="label" variant="caption" fontWeight="bold">
                                    Facebook URL
                                </ArgonTypography>
                            </ArgonBox>
                            <ArgonInput
                                type="url"
                                placeholder="https://facebook.com/..."
                                name="facebook"
                                value={settings.facebook}
                                onChange={handleChange}
                            />
                        </ArgonBox>
                        <ArgonBox mb={2}>
                            <ArgonBox mb={1} ml={0.5}>
                                <ArgonTypography component="label" variant="caption" fontWeight="bold">
                                    Instagram URL
                                </ArgonTypography>
                            </ArgonBox>
                            <ArgonInput
                                type="url"
                                placeholder="https://instagram.com/..."
                                name="instagram"
                                value={settings.instagram}
                                onChange={handleChange}
                            />
                        </ArgonBox>
                         <ArgonBox mb={2}>
                            <ArgonBox mb={1} ml={0.5}>
                                <ArgonTypography component="label" variant="caption" fontWeight="bold">
                                    Twitter / X URL
                                </ArgonTypography>
                            </ArgonBox>
                            <ArgonInput
                                type="url"
                                placeholder="https://twitter.com/..."
                                name="twitter"
                                value={settings.twitter}
                                onChange={handleChange}
                            />
                        </ArgonBox>
                    </ArgonBox>
                  </Card>
              </Grid>

              {/* Delivery Locations */}
              <Grid item xs={12}>
                <Card>
                  <ArgonBox p={3}>
                    <ArgonTypography variant="h5" fontWeight="medium">
                      Delivery Locations
                    </ArgonTypography>
                    <ArgonBox mt={1} mb={2}>
                      <ArgonTypography variant="body2" color="text">
                        Add states, cities, and specific delivery zones/branches.
                      </ArgonTypography>
                    </ArgonBox>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <ArgonBox mb={2}>
                          <ArgonBox mb={1} ml={0.5}>
                            <ArgonTypography component="label" variant="caption" fontWeight="bold">
                              State
                            </ArgonTypography>
                          </ArgonBox>
                          <FormControl fullWidth>
                            <Select
                              value={selectedState}
                              onChange={(e) => handleStateChange(e.target.value)}
                              displayEmpty
                              sx={{ height: "40px" }}
                            >
                              <MenuItem value="" disabled>Select State</MenuItem>
                              {statesList.map((state) => (
                                <MenuItem key={state.isoCode} value={state.isoCode}>
                                  {state.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </ArgonBox>
                      </Grid>
                      <Grid item xs={6}>
                        <ArgonBox mb={2}>
                          <ArgonBox mb={1} ml={0.5}>
                            <ArgonTypography component="label" variant="caption" fontWeight="bold">
                              City
                            </ArgonTypography>
                          </ArgonBox>
                          <FormControl fullWidth disabled={!selectedState}>
                            <Select
                              value={selectedCity}
                              onChange={(e) => setSelectedCity(e.target.value)}
                              displayEmpty
                              sx={{ height: "40px" }}
                            >
                              <MenuItem value="" disabled>Select City</MenuItem>
                              {citiesList.map((city, index) => (
                                <MenuItem key={`${city.name}-${index}`} value={city.name}>
                                  {city.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </ArgonBox>
                      </Grid>
                    </Grid>

                    <ArgonBox mb={2}>
                      <ArgonBox mb={1} ml={0.5}>
                        <ArgonTypography component="label" variant="caption" fontWeight="bold">
                          Area Name / Delivery Zone (Optional)
                        </ArgonTypography>
                      </ArgonBox>
                      <ArgonInput
                        placeholder="e.g. Downtown, North Side"
                        value={areaName}
                        onChange={(e) => setAreaName(e.target.value)}
                      />
                    </ArgonBox>

                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                             <ArgonBox mb={2}>
                                <ArgonBox mb={1} ml={0.5}>
                                    <ArgonTypography component="label" variant="caption" fontWeight="bold">
                                        Branch Phone
                                    </ArgonTypography>
                                </ArgonBox>
                                <ArgonInput
                                    placeholder="+1..."
                                    value={branchPhone}
                                    onChange={(e) => setBranchPhone(e.target.value)}
                                />
                            </ArgonBox>
                        </Grid>
                        <Grid item xs={6}>
                            <ArgonBox mb={2}>
                                <ArgonBox mb={1} ml={0.5}>
                                    <ArgonTypography component="label" variant="caption" fontWeight="bold">
                                        Branch Email
                                    </ArgonTypography>
                                </ArgonBox>
                                <ArgonInput
                                    type="email"
                                    placeholder="branch@..."
                                    value={branchEmail}
                                    onChange={(e) => setBranchEmail(e.target.value)}
                                />
                            </ArgonBox>
                        </Grid>
                    </Grid>

                    <ArgonBox mb={2}>
                      <ArgonButton
                        variant="gradient"
                        color="info"
                        fullWidth
                        onClick={handleAddLocation}
                      >
                        Add Delivery Area
                      </ArgonButton>
                    </ArgonBox>

                    <Divider />

                    <ArgonBox mt={2}>
                      <ArgonTypography variant="h6" fontWeight="medium" mb={1}>
                        Enabled Areas & Branches
                      </ArgonTypography>
                      {deliveryLocations.length > 0 ? (
                        deliveryLocations.map((loc) => (
                          <ArgonBox
                            key={loc.id}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            py={1.5}
                            borderBottom="1px solid #eee"
                          >
                            <ArgonBox>
                              <ArgonTypography variant="body2" fontWeight="bold">
                                {loc.cityName} - {loc.areaName}
                              </ArgonTypography>
                              <ArgonTypography variant="caption" color="text" display="block">
                                {loc.stateName}
                              </ArgonTypography>
                              {(loc.branchPhone || loc.branchEmail) && (
                                <ArgonTypography variant="caption" color="info">
                                    {loc.branchPhone} {loc.branchPhone && loc.branchEmail ? "|" : ""} {loc.branchEmail}
                                </ArgonTypography>
                              )}
                            </ArgonBox>
                            <Icon
                              color="error"
                              sx={{ cursor: "pointer" }}
                              onClick={() => handleRemoveLocation(loc.id)}
                            >
                              delete
                            </Icon>
                          </ArgonBox>
                        ))
                      ) : (
                        <ArgonTypography variant="caption" color="text">
                          No delivery areas added yet.
                        </ArgonTypography>
                      )}
                    </ArgonBox>
                  </ArgonBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <ArgonBox mt={3} mb={3} display="flex" justifyContent="flex-end">
            <ArgonButton 
                variant="gradient" 
                color="success" 
                size="large" 
                onClick={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <CircularProgress size={20} color="inherit" />
                ) : (
                    "Save Settings"
                )}
            </ArgonButton>
        </ArgonBox>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Settings;
