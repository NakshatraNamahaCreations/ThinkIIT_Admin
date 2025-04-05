import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import apiServices from "../../../services/apiServices";

const dummyData = [
  {
    chapterId: "chapter_001",
    chapterName: "Thermodynamics",
    topics: [
      {
        topicId: "topic_001",
        topicName: "Heat Transfer",
      },
      {
        topicId: "topic_002",
        topicName: "Entropy",
      },
      {
        topicId: "topic_003",
        topicName: "Thermodynamic Processes",
      },
    ],
  },
  {
    chapterId: "chapter_002",
    chapterName: "Kinematics",
    topics: [
      {
        topicId: "topic_004",
        topicName: "Velocity",
      },
      {
        topicId: "topic_005",
        topicName: "Acceleration",
      },
      {
        topicId: "topic_006",
        topicName: "Motion Graphs",
      },
    ],
  },
  {
    chapterId: "chapter_003",
    chapterName: "Organic Chemistry",
    topics: [
      {
        topicId: "topic_007",
        topicName: "Hydrocarbons",
      },
      {
        topicId: "topic_008",
        topicName: "Functional Groups",
      },
    ],
  },
];

const ChapterAndTopic = ({chapters}) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topicsByChapter, setTopicsByChapter] = useState({});

  
  const handleTopicClick = (chapterId, topicId) => {
    const uniqueId = `${chapterId}-${topicId}`;

    setSelectedTopics((prev) =>
      prev.includes(uniqueId)
        ? prev.filter((id) => id !== uniqueId)
        : [...prev, uniqueId]
    );
  };

  useEffect(() => {
    const fetchAllTopics = async () => {
      const topicData = {};
      for (let chapter of chapters) {
        try {
          const topics = await apiServices.fetchTopic(chapter._id);
          console.log("the woring", topics);
          
          topicData[chapter._id] = topics;
        } catch (err) {
          console.error("Error fetching topics for", chapter.chapterName, err);
        }
      }
      setTopicsByChapter(topicData);
    };
  
    if (chapters.length) {
      fetchAllTopics();
    }
  }, [chapters]);
  


  const isSelected = (chapterId, topicId) =>
    selectedTopics.includes(`${chapterId}-${topicId}`);

  return (
    <Box sx={{ p: 2 }}>
      {chapters.map((chapter, index) => (
        <Paper
          key={chapter.chapterId}
          elevation={3}
          sx={{
            borderRadius: 2,
            mb: 3,
            backgroundColor: "#e3f2fd",
            p: 2,
          }}
        >
          <Typography fontWeight={600} mb={1}>
            {chapter.chapterName}
          </Typography>

          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 1,
              p: 2,
              border: "1px solid #ccc",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                px: 2,
                py: 1,
                flexWrap: "wrap",
              }}
            >
              {(topicsByChapter[chapter._id] || []).map((topic) => (
                <Typography
                  key={topic._id}
                  variant="body2"
                  onClick={() =>
                    handleTopicClick(chapter.chapterId, topic.topicId)
                  }
                  sx={{
                    cursor: "pointer",
                    backgroundColor: isSelected(chapter.chapterId, topic.topicId)
                      ? "#dfffe0"
                      : "#fff",
                    borderRadius: 1,
                    p: 0.5,
                    border: "1px solid #ddd",
                    "&:hover": {
                      backgroundColor: "#e6ffe6",
                    },
                  }}
                >
                  {topic.topicName}
                </Typography>
              ))}
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default ChapterAndTopic;
