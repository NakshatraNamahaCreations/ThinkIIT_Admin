import React, { useState } from "react";
import { Box, Typography, TextField, Paper, Button } from "@mui/material";

const AutoQuestionUI = ({ chapters, sectionData, activeSectionId }) => {
  // State to hold the number of questions for each topic under each chapter
  const [questions, setQuestions] = useState(
    chapters.reduce((acc, chapter) => {
      acc[chapter.chapterName] = chapter.topics.reduce((topicAcc, topic) => {
        topicAcc[topic.topicName] = 0; // Initialize with 0 questions per topic
        return topicAcc;
      }, {});
      return acc;
    }, {})
  );

  // Handle change in the number of questions for a particular topic
  const handleQuestionChange = (chapterName, topicName, value) => {
    const numberOfQuestions = parseInt(value, 10) || 0;

    // Prepare the updated topic data with the number of questions
    const updatedTopicData = {
      topicName: topicName,
      numberOfQuestions: numberOfQuestions,
    };

    // Update the section data with the new topics
    const updatedSection = {
      ...sectionData[activeSectionId],
      topic: sectionData[activeSectionId].topic.map((topic) => {
        if (topic.topicName === topicName) {
          return updatedTopicData;
        }
        return topic;
      }),
    };

    // If the topic doesn't exist in the topic array, add it
    if (!updatedSection.topic.some((topic) => topic.topicName === topicName)) {
      updatedSection.topic.push(updatedTopicData);
    }

  
    const updatedData = {
      ...sectionData,
      [activeSectionId]: updatedSection,
    };

    sessionStorage.setItem("sectionMarkingData", JSON.stringify(updatedData));
    setQuestions(updatedData); 
  };

  // Check if all topics in all chapters have questions assigned (validation)
  const isValid = Object.values(questions).every((chapterTopics) =>
    Object.values(chapterTopics).every((value) => value > 0)
  );

  return (
    <Box
      sx={{
        backgroundColor: "#e0f0ff",
        padding: 2,
        borderRadius: 2,
        marginTop: 3,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          padding: 3,
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Question Assignment for Chapters and Topics
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {chapters.map((chapter) => (
            <Box key={chapter.chapterName} sx={{ marginBottom: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {chapter.chapterName}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)", // Mobile: 1 column
                    sm: "repeat(2, 1fr)", // Tablet: 2 columns
                    md: "repeat(3, 1fr)", // Desktop: 3 columns
                  },
                  gap: 2,
                }}
              >
                {chapter.topics.map((topic) => (
                  <Box
                    key={topic.topicName}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid #ddd",
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                    }}
                  >
                    <Typography>{topic.topicName}</Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={questions[chapter.chapterName]?.[topic.topicName]}
                      onChange={(e) =>
                        handleQuestionChange(
                          chapter.chapterName,
                          topic.topicName,
                          e.target.value
                        )
                      }
                      sx={{ width: "60px" }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!isValid} // Disable if validation fails
            onClick={() => alert("Questions saved!")}
          >
            Save Questions
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AutoQuestionUI;
