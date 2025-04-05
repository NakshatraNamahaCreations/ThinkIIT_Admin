import React, { use, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  IconButton,
} from "@mui/material";
import TestHeader from "./components/TestHeader";
import ChapterAndTopic from "./components/ChapterAndTopic";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoQuestionUI from "./components/AutoQuestionUI";
import AddIcon from "@mui/icons-material/Add";

const TestSelection = () => {
  const [questionType, setQuestionType] = useState("SCQ");
  const [positiveMarking, setPositiveMarking] = useState("");
  const [negativeMarking, setNegativeMarking] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectionType, setSelectionType] = useState("Manual");
  const [addNew, setAddNew] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(1); // default to first section
const [sectionData, setSectionData] = useState({
  1: { subjectSelections: [], classSelections: [""] },
  2: { subjectSelections: [], classSelections: [""] },
});


  // State for multiple class dropdowns
  const [subjectSelections, setSubjectSelections] = useState([""]);
  const [classSelections, setClassSelections] = useState([""]);

  const handleAddDropdown = () => {
    // setClassSelections([...classSelections, ""]);
    // setSubjectSelections([...subjectSelections, ""]);
    const handleAddSubject = () => {
      const updated = { ...sectionData };
      updated[activeSectionId].subjectSelections.push("");
      setSectionData(updated);
    };
setAddNew(false);
  };

  const handleSubjectChange = (index, value) => {
    const updatedSelections = [...subjectSelections];
    updatedSelections[index] = value;
    setSubjectSelections(updatedSelections);
  };

  const handleClassChange = (index, value) => {
    const updatedClass = [...classSelections];
    updatedClass[index] = value;
    setClassSelections(updatedClass);
  };
  const handleRemoveDropdown = (index) => {
    // setClassSelections(classSelections.filter((_, i) => i !== index));
    setSubjectSelections(subjectSelections.filter((_, i) => i !== index));
  };

  return (
    <>
      <TestHeader />

      {/* QUESTION TYPE, MARKING FIELDS */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mt: 2,
          flexWrap: "wrap",
          px: 2,
          justifyContent: "space-between",
        }}
      >
        <Box>
          <TextField
            select
            label="Question Type"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            size="small"
          >
            <MenuItem value="SCQ">SCQ</MenuItem>
            <MenuItem value="MCQ">MCQ</MenuItem>
            <MenuItem value="NTQ">NTQ</MenuItem>
            <MenuItem value="CMP">CMP</MenuItem>
          </TextField>

          <TextField
            label="Positive Marking"
            type="number"
            value={positiveMarking}
            onChange={(e) => setPositiveMarking(e.target.value)}
            size="small"
          />

          <TextField
            label="Negative Marking"
            type="number"
            value={negativeMarking}
            onChange={(e) => setNegativeMarking(e.target.value)}
            size="small"
          />
        </Box>
        <Button variant="contained">Next</Button>
      </Box>

      {/* Subject SELECTION SECTION */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mt: 3,
          px: 2,
          flexWrap: "wrap",
          borderBottom: "1px solid #ccc",
          pb: 2,
        }}
      >
        {subjectSelections.map((subject, index) => (
          <Button
            key={index}
            variant="contained"
            sx={{ backgroundColor: "#1976d2", fontWeight: "bold" }}
            endIcon={
              <IconButton
                onClick={() => handleRemoveDropdown(index)}
                sx={{ color: "white", padding: 0 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            }
          >
            {subject}
          </Button>
        ))}

        {addNew ? (
          <TextField
            select
            label="Add Subject"
            value=""
            onChange={() => handleAddDropdown(index, e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="Maths">Maths</MenuItem>
            <MenuItem value="Physics">Physics</MenuItem>
            <MenuItem value="Chemistry">Chemistry</MenuItem>
            <MenuItem value="Botany">Botany</MenuItem>
            <MenuItem value="Zoology">Zoology</MenuItem>
          </TextField>
        ) : (
          <IconButton
            onClick={() => setAddNew(true)}
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
        {/* Dropdown for adding new subject */}
      </Box>

      {/* SEARCH and SELECTION TYPE SECTION */}
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginTop: "1rem",
          px: 2,
        }}
      >
        {classSelections.map((classSelected, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <TextField
              select
              label={`Select Class`}
              value={classSelected}
              onChange={(e) => handleClassChange(index, e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="class 10">Class 10</MenuItem>
              <MenuItem value="class 11">Class 11</MenuItem>
              <MenuItem value="class 12">Class 12</MenuItem>
            </TextField>
          </Box>
        ))}
        <TextField
          placeholder="Search..."
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Button variant="contained" sx={{ backgroundColor: "#1976d2" }}>
          Search
        </Button>

        <Typography sx={{ fontWeight: 500 }}>Question Selection:</Typography>

        <RadioGroup
          row
          value={selectionType}
          onChange={(e) => setSelectionType(e.target.value)}
        >
          <FormControlLabel
            value="Manual"
            control={<Radio size="small" />}
            label="Manual"
          />
          <FormControlLabel
            value="Auto"
            control={<Radio size="small" />}
            label="Auto"
          />
        </RadioGroup>
      </Box>

      {selectionType === "Manual" && <ChapterAndTopic />}
      {selectionType === "Auto" && <AutoQuestionUI />}
    </>
  );
};

export default TestSelection;
