import React, { useState, useRef } from "react";
import { Box, Tabs, Tab, IconButton, Button, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const TestHeader = ({ activeSectionId, setActiveSectionId }) => {
  const [allSections, setAllSections] = useState([
    { id: 1, sectionName: "Section 1" },
    { id: 2, sectionName: "Section 2" },
  ]);
  const [activeSections, setActiveSections] = useState([1, 2]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addingNew, setAddingNew] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const containerRef = useRef(null);

  const handleTabChange = (event, newIndex) => {
    setActiveIndex(newIndex);
    setActiveSectionId(activeSections[newIndex]);
  };
  const confirmAddSection = () => {
    const name = newSectionName.trim();
    if (!name) return;

    const newId = Date.now();
    const newSection = { id: newId, sectionName: name };
    const updatedSections = [...allSections, newSection];
    const updatedActive = [...activeSections, newId];

    setAllSections(updatedSections);
    setActiveSections(updatedActive);
    setActiveIndex(updatedActive.length - 1);
    setNewSectionName("");
    setAddingNew(false);

    setTimeout(() => {
      containerRef.current?.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleToggleSection = (id) => {
    let updated;

    if (activeSections.includes(id)) {
      updated = activeSections.filter((sectionId) => sectionId !== id);
      setActiveSections(updated);
      if (activeIndex >= updated.length) {
        setActiveIndex(updated.length - 1);
      }
    } else {
      updated = [...activeSections, id];
      const sorted = updated.sort((a, b) => {
        const indexA = allSections.findIndex((s) => s.id === a);
        const indexB = allSections.findIndex((s) => s.id === b);
        return indexA - indexB;
      });
      setActiveSections(sorted);
      setActiveIndex(sorted.indexOf(id));
    }

    setTimeout(() => {
      containerRef.current?.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleSaveDraft = () => {
    const activeData = allSections.filter((sec) =>
      activeSections.includes(sec.id)
    );
    console.log("Saving Draft with sections:", activeData);
  };

  const handleSummary = () => {
    console.log("Summary:", activeSections[activeIndex]);
  };

  const handlePreview = () => {
    console.log("Previewing:", activeSections[activeIndex]);
  };

  const activeSectionsData = allSections.filter((s) =>
    activeSections.includes(s.id)
  );
  const inactiveSectionsData = allSections.filter(
    (s) => !activeSections.includes(s.id)
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        px: 2,
        py: 1,
        borderBottom: "1px solid black",
        backgroundColor: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 10,
        width: "100%",
        gap: 2,
      }}
    >
      {/* LEFT SIDE: Tabs + Inactive */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "nowrap",
          overflowX: "auto",
          gap: 1,
          flex: 1,
        }}
      >
        {/* Active Tabs */}
        <Box sx={{ display: "flex", alignItems: "center" }} ref={containerRef}>
          <Tabs
            value={activeIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              justifyContent: "center",
            }}
            TabIndicatorProps={{ style: { display: "none" } }}
          >
            {activeSectionsData.map((section) => {
              const tabIndex = activeSections.indexOf(section.id);
              const isActive = activeIndex === tabIndex;

              return (
                <Tab
                  key={section.id}
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {section.sectionName}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSection(section.id);
                        }}
                        sx={{ ml: 1, color: "red" }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  value={tabIndex}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    borderRadius: "4px",
                    mx: 0.5,
                    minHeight: "32px",
                    height: "36px",
                    zIndex: 11111,
                    backgroundColor: isActive ? "#1976d2" : "#e3e7eb",
                    color: `${isActive ? "#fff" : "#333"} !important`,
                    "&:hover": {
                      backgroundColor: isActive ? "#1565c0" : "#f5f5f5",
                    },
                  }}
                />
              );
            })}
          </Tabs>

          {addingNew ? (
            <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
              <TextField
                size="small"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Section Name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAddSection();
                }}
              />
              <IconButton onClick={confirmAddSection} sx={{ ml: 1 }}>
                <CheckIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  setAddingNew(false);
                  setNewSectionName("");
                }}
                sx={{ ml: 1, color: "red" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <IconButton
              onClick={() => setAddingNew(true)}
              sx={{
                border: "1px solid #ccc",
                ml: 1,
                height: "36px",
                width: "36px",
                borderRadius: "4px",
                alignSelf: "center",
                backgroundColor: "green",
                mt: "2px",
                "&:hover": {
                  backgroundColor: "green", 
                  color: "white", 
                },
              }}
            >
              <AddIcon fontSize="small" style={{ color: "white" }} />
            </IconButton>
          )}
        </Box>

        {/* Inactive Sections */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {inactiveSectionsData.map((section) => (
            <Box
              key={section.id}
              sx={{
                border: "1px dashed #aaa",
                borderRadius: "4px",
                px: 1.5,
                py: 0.5,
                display: "flex",
                alignItems: "center",
                color: "#888",
              }}
            >
              {section.sectionName}
              <IconButton
                size="small"
                onClick={() => handleToggleSection(section.id)}
                sx={{ ml: 1, color: "green" }}
              >
                <AddCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>

      {/* RIGHT SIDE: Buttons */}
      <Box sx={{ display: "flex", gap: 1, whiteSpace: "nowrap" }}>
        <Button variant="contained" onClick={handleSaveDraft}>
          Save Draft
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#FFA500" }}
          onClick={handleSummary}
        >
          Summary
        </Button>
        <Button variant="contained" color="warning" onClick={handlePreview}>
          Preview
        </Button>
      </Box>
    </Box>
  );
};

export default TestHeader;
