import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Tabs, Tab, Button, AppBar } from "@mui/material";
import testServices from "../../../services/testService";
import apiServices from "../../../services/apiServices";  // Assuming this is where your GetQuestionsByTestId function resides

const ViewModal = ({ open, onClose, testId }) => {
  const [testDetails, setTestDetails] = useState(null);
  const [sections, setSections] = useState([]); // Store sections to iterate over
  const [selectedSectionId, setSelectedSectionId] = useState(null); // Store the selected section ID
  const [questions, setQuestions] = useState([]); // Store questions for the selected section
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    if (testId && open) {
      fetchTestDetails(testId);
    }
  }, [testId, open]);

  // Fetch Test Details
  const fetchTestDetails = async (testId) => {
    try {
      setLoading(true); // Set loading state to true while fetching
      const response = await testServices.getTestById(testId);

      if (response.success && response.data) {
        setTestDetails(response.data); // Store the test details
        setSections(response.data.sections); // Store all sections
        if (response.data.sections.length > 0) {
          setSelectedSectionId(response.data.sections[0]._id); // Set the default selected section
        }
      } else {
        console.error("Failed to fetch test details");
      }
      setLoading(false); // Set loading state to false after fetching
    } catch (error) {
      console.error("Error fetching test details", error);
      setLoading(false); // Set loading state to false in case of an error
    }
  };

  // Fetch questions for a section using GetQuestionsByTestId API
  const fetchQuestionsForSection = async (sectionId) => {
    try {
      setLoading(true); // Set loading state to true while fetching questions
      const response = await apiServices.GetQuestionsByTestId(testId, sectionId);

      if (response.success) {
        setQuestions(response.data); // Store questions for the selected section
        console.log("Questions for section:", response.data);
      } else {
        console.error("Failed to fetch questions for section");
      }
      setLoading(false); // Set loading state to false after fetching questions
    } catch (error) {
      console.error("Error fetching questions for section", error);
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    const selectedSection = sections[newValue];
    setSelectedSectionId(selectedSection._id); // Update the selected section ID
    fetchQuestionsForSection(selectedSection._id); // Fetch questions for the selected section
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="view-modal-title">
      <Box sx={{ width: 600, margin: "auto", padding: 3, bgcolor: "white", boxShadow: 24 }}>
        <Typography variant="h6" component="h2" id="view-modal-title">
          Test Details
        </Typography>
 <>
        <Tabs>
            <Tab></Tab>
        </Tabs>

            {/* Display questions for the selected section */}
            <Typography variant="body1" component="p" sx={{ marginTop: 2 }}>
              <strong>Questions for {sections.find((section) => section._id === selectedSectionId)?.subject}:</strong>
            </Typography>
            {questions.length > 0 ? (
              <ul>
                {questions?.map((question) => (
                  <li key={question._id}>
                    <Typography variant="body2">{question.text}</Typography>
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2" component="p">
                No questions available for this section.
              </Typography>
            )}

          </>
     
      </Box>
    </Modal>
  );
};

export default ViewModal;
