import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
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

  // Save changes
  useEffect(() => {
    sessionStorage.setItem("selectedChapterTopics", JSON.stringify(selectedTopics));
  }, [selectedTopics]);

  // Fetch topics for all chapters
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

    if (chapters.length) fetchAllTopics();
  }, [chapters]);

  const handleTopicClick = (chapterId, topicId) => {
    const uniqueId = `${chapterId}-${topicId}`;
    setSelectedTopics((prev) =>
      prev.includes(uniqueId)
        ? prev.filter((id) => id !== uniqueId)
        : [...prev, uniqueId]
    );
  };

  // Callback on topic select
  useEffect(() => {
    const selectedChapterNames = [...new Set(
      selectedTopics
        .map((id) => chapters.find(c => c._id === id.split("-")[0])?.chapterName)
        .filter(Boolean)
    )];

    const selectedTopicNames = selectedTopics
      .map((id) => {
        const [chapterId, topicId] = id.split("-");
        return topicsByChapter[chapterId]?.find(t => t._id === topicId)?.topicName;
      })
      .filter(Boolean);

    onTopicsSelected?.(selectedChapterNames, selectedTopicNames);
  }, [selectedTopics, topicsByChapter]);

  const isSelected = (chapterId, topicId) =>
    selectedTopics.includes(`${chapterId}-${topicId}`);

  return (
    <Box sx={{ padding: 3 }}>
      {chapters.map((chapter) => (
        <div
          key={chapter._id}
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {chapter.chapterName}
          </Typography>

          <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1
          }}>
            {(topicsByChapter[chapter._id] || []).map((topic) => (
              <div
                key={topic._id}
                onClick={() => handleTopicClick(chapter._id, topic._id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  backgroundColor: isSelected(chapter._id, topic._id)
                    ? "#1976d2" // Active purple
                    : "#f3f4f6",  // Default gray
                  color: isSelected(chapter._id, topic._id)
                    ? "white"
                    : "#333",
                  border: "1px solid #ccc"
                }}
              >
                {topic.topicName}
              </div>
            ))}
          </Box>
        </div>
      ))}
    </Box>
  );
};

export default ChapterAndTopic;
