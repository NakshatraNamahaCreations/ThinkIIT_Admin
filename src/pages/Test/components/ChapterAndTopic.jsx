import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import apiServices from "../../../services/apiServices";

const ChapterAndTopic = ({ chapters, onTopicsSelected }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topicsByChapter, setTopicsByChapter] = useState({});

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("selectedChapterTopics");
    if (saved) {
      setSelectedTopics(JSON.parse(saved));
    }
  }, []);

  // Update sessionStorage whenever selectedTopics changes
  useEffect(() => {
    sessionStorage.setItem("selectedChapterTopics", JSON.stringify(selectedTopics));
  }, [selectedTopics]);

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
  useEffect(() => {
    console.log("the checksss",selectedTopics);
    
    const selectedChapterNames = [...new Set(selectedTopics.map(id => {
      const chapter = chapters.find(c => c._id === id.split("-")[0]);
      return chapter?.chapterName;
    }).filter(Boolean))];
  
    const selectedTopicNames = selectedTopics.map(id => {
      const chapterId = id.split("-")[0];
      const topicId = id.split("-")[1];
      const topic = topicsByChapter[chapterId]?.find(t => t._id === topicId);
      return topic?.topicName;
    }).filter(Boolean);
  
    if (onTopicsSelected) {
      onTopicsSelected(selectedChapterNames, selectedTopicNames);
    }
  }, [selectedTopics, topicsByChapter]);
  
  const isSelected = (chapterId, topicId) =>
    selectedTopics.includes(`${chapterId}-${topicId}`);

  return (
    <Box sx={{ p: 2 }}>
      {chapters.map((chapter) => (
        <Paper
          key={chapter._id}
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
                  onClick={() => handleTopicClick(chapter._id, topic._id)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: isSelected(chapter._id, topic._id)
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
