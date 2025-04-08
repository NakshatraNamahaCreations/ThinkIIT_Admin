import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Paper, Button } from "@mui/material";

const AutoQuestionUI = ({ chapters, sectionData, activeSectionId }) => {
  console.log("the check 1", chapters);
  console.log("the chech 2", sectionData);
  console.log("the check 3", activeSectionId);

  const [questions, setQuestions] = useState(
    chapters.reduce((acc, chapter) => {
      acc[chapter.chapterName] = chapter.topics.reduce((topicAcc, topic) => {
        topicAcc[topic.topicName] = 0;
        return topicAcc;
      }, {});
      return acc;
    }, {})
  );
  useEffect(() => {
    const initial = chapters.reduce((acc, chapter) => {
      acc[chapter.chapterName] = chapter.topics.reduce((topicAcc, topic) => {
        const savedTopic = sectionData[activeSectionId]?.topic?.find(
          (t) => t.topicName === topic.topicName
        );
        topicAcc[topic.topicName] = savedTopic?.numberOfQuestions || 0;
        return topicAcc;
      }, {});
      return acc;
    }, {});
    setQuestions(initial);
  }, [chapters, sectionData, activeSectionId]);

  // Handle change in the number of questions for a particular topic
  // const handleQuestionChange = (chapterName, topicName, value) => {
  //   const numberOfQuestions = parseInt(value, 10) || 0;

  //   setQuestions((prev) => ({
  //     ...prev,
  //     [chapterName]: {
  //       ...prev[chapterName],
  //       [topicName]: numberOfQuestions,
  //     },
  //   }));

  //   const updatedTopicData = [];

  //   Object.entries({
  //     ...questions,
  //     [chapterName]: {
  //       ...(questions[chapterName] || {}),
  //       [topicName]: numberOfQuestions,
  //     },
  //   }).forEach(([chap, topics]) => {
  //     Object.entries(topics).forEach(([tName, qCount]) => {
  //       if (qCount > 0) {
  //         updatedTopicData.push({
  //           topicName: tName,
  //           numberOfQuestions: qCount,
  //         });
  //       }
  //     });
  //   });

  //   const updatedSection = {
  //     ...sectionData[activeSectionId],
  //     topic: updatedTopicData,
  //   };

  //   const updatedData = {
  //     ...sectionData,
  //     [activeSectionId]: updatedSection,
  //   };

  //   sessionStorage.setItem("sectionMarkingData", JSON.stringify(updatedData));
  // };

  const handleQuestionChange = (chapterName, rawTopic, value) => {
    const topicName =
      typeof rawTopic === "object" ? rawTopic.topicName : rawTopic;
    const numberOfQuestions = parseInt(value, 10) || 0;
  
    // Step 1: Update local UI state
    setQuestions((prev) => ({
      ...prev,
      [chapterName]: {
        ...(prev[chapterName] || {}),
        [topicName]: numberOfQuestions,
      },
    }));
  
    // Step 2: Rebuild full topic list
    const updatedQuestions = {
      ...questions,
      [chapterName]: {
        ...(questions[chapterName] || {}),
        [topicName]: numberOfQuestions,
      },
    };
  
    const cleanTopicList = [];
    const chapterList = new Set();
  
    Object.entries(updatedQuestions).forEach(([chap, topicMap]) => {
      let hasValidTopic = false;
  
      Object.entries(topicMap).forEach(([tName, count]) => {
        if (count > 0) {
          cleanTopicList.push({
            topicName: tName,
            numberOfQuestions: count,
          });
          hasValidTopic = true;
        }
      });
  
      if (hasValidTopic) {
        chapterList.add(chap);
      }
    });
  
    // Step 3: Save back to session
    const updatedSection = {
      ...sectionData[activeSectionId],
      topic: cleanTopicList,
      chapter: Array.from(chapterList).map((c) => ({ chapterName: c })),
    };
  
    const updatedData = {
      ...sectionData,
      [activeSectionId]: updatedSection,
    };
  
    sessionStorage.setItem("sectionMarkingData", JSON.stringify(updatedData));
  };
  

  const isValid = Object.values(questions).every((chapterTopics) =>
    Object.values(chapterTopics).every((value) => value > 0)
  );

  return (
    <Box
      sx={{
        backgroundColor: "#f8f9fb",
        padding: 2,
        borderRadius: 2,
        marginTop: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: 2,
          borderRadius: 2,
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 2, color: "#1a202c" }}
        >
          How many questions for each topic?
        </Typography>
        <Typography sx={{ mb: 3, fontSize: "14px", color: "#4a5568" }}>
          Assign exactly the required number of questions per section.
        </Typography>
  
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {chapters.map((chapter) => (
            <Box
              key={chapter.chapterName}
              sx={{
                backgroundColor: "#fefefe",
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                px: 2,
                py: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  color: "#2d3748",
                }}
              >
                {chapter.chapterName}
              </Typography>
  
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {chapter.topics.map((topic) => (
                  <Box
                    key={topic.topicName}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#f7fafc",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography sx={{ fontSize: "14px", color: "#2d3748" }}>
                      {topic.topicName}
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={
                        questions[chapter.chapterName]?.[
                          typeof topic.topicName === "object"
                            ? topic.topicName.topicName
                            : topic.topicName
                        ] || ""
                      }
                      onChange={(e) =>
                        handleQuestionChange(
                          chapter.chapterName,
                          typeof topic.topicName === "object"
                            ? topic.topicName.topicName
                            : topic.topicName,
                          e.target.value
                        )
                      }
                      sx={{
                        width: "70px",
                        backgroundColor: "#fff",
                      }}
                      inputProps={{ min: 0 }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
  
};

export default AutoQuestionUI;
