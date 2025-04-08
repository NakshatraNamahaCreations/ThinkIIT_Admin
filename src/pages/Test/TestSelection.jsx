import React, { useEffect, useState } from "react";
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
import { useParams } from "react-router-dom";
import testServices from "../../services/testService";
import apiServices from "../../services/apiServices";
import testPatterns from "./PreSection/Pattern.json";

const TestSelection = () => {
  const [questionType, setQuestionType] = useState("SCQ");
  const [positiveMarking, setPositiveMarking] = useState("");
  const [negativeMarking, setNegativeMarking] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectionType, setSelectionType] = useState("Manual");
  const [addNew, setAddNew] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [allSections, setAllSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const { id } = useParams();

  const [sectionData, setSectionData] = useState({
    1: {
      subjectSelections: [],
      questionType: "SCQ",
      positiveMarking: "",
      negativeMarking: "",
      searchText: "",
      selectionType: selectionType,
    },
  });
  const syncToSessionStorage = (data) => {
    sessionStorage.setItem("sectionMarkingData", JSON.stringify(data));
  };

  // const fetchTestDataById = async (id) => {
  //   try {
  //     const data = await testServices.getTestById(id);
  //     if (data?.data?.sections) {
  //       const updatedSections = await Promise.all(
  //         data.data.sections.map(async (section) => {
  //           const subID = section.subjectId;
  //           if (!subID) {
  //             console.error(
  //               `No subject ID found for section: ${section.subject}`
  //             );
  //             return section;
  //           }

  //           const chapterData = await apiServices.fetchChapter(subID);

  //           const allTopics = await Promise.all(
  //             chapterData.map(async (chapter) => {
  //               const topics = await fetchTopics(chapter._id);
  //               return { chapterId: chapter._id, topics };
  //             })
  //           );

  //           const formattedChapters = chapterData.map((chapter) => {
  //             const matchedTopics =
  //               allTopics.find((t) => t.chapterId === chapter._id)?.topics ||
  //               [];
  //             return {
  //               _id: chapter._id,
  //               chapterName: chapter.chapterName,
  //               topics: matchedTopics,
  //             };
  //           });

  //           return { ...section, chapters: formattedChapters };
  //         })
  //       );

  //       setSavedSections(updatedSections);
  //       setActiveSection(updatedSections[0]?._id || "");
  //     } else {
  //       setSavedSections([]);
  //       toast.error("No sections found.");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to fetch test details.");
  //     console.error("Error:", error);
  //   }
  // };
  const updateSectionField = (fieldName, value) => {
    setSectionData((prev) => {
      const updated = {
        ...prev,
        [activeSectionId]: {
          ...prev[activeSectionId],
          [fieldName]: value,
        },
      };

      syncToSessionStorage(updated);

      return updated;
    });
  };

  useEffect(() => {
    if (!sectionData[activeSectionId]) {
      setSectionData((prev) => ({
        ...prev,
        [activeSectionId]: {
          subjectSelections: [],
          classSelections: [""],
          questionType: "SCQ",
          positiveMarking: "",
          negativeMarking: "",
          searchText: "",
          selectionType: selectionType,
        },
      }));
    }
  }, [activeSectionId]);
  useEffect(() => {
    const saved = sessionStorage.getItem("sectionMarkingData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSectionData(parsed);

      const firstKey = Object.keys(parsed)[0];
      if (firstKey) setActiveSectionId(firstKey);
    }
  }, []);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await apiServices.fetchSubjects();
        setSubjects(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSubject();
  }, [id]);

  useEffect(() => {
    const fetchTestDataById = async () => {
      try {
        const response = await testServices.getTestById(id);
        const test = response?.data;
        console.log("the test check ", test.testPattern);

        // Check for matching test name in your predefined JSON
        const matchedPattern = testPatterns.find(
          (pattern) =>
            pattern.exam.toLowerCase().trim() ===
            test.testPattern.toLowerCase().trim()
        );


        const sessionSectionNames = JSON.parse(
          sessionStorage.getItem("customSectionNames") || "{}"
        );

        let fetchedSections = [];
        let initialData = {};

        if (test.sections.length === 0 && matchedPattern) {
          // Use predefined JSON pattern
          fetchedSections = matchedPattern.sections.map((section, idx) => {
            {
              console.log("the sections", section);
            }
            const sectionId = `section-${idx}-${Date.now()}`;
            initialData[sectionId] = {
              subjectSelections: section.subjects.map((s) =>
                s.split("(")[0].trim()
              ), // Clean subject names
              classSelections: [""],
              questionType: section.questionType || "Tmm",
              positiveMarking: section.correctAnswerMarks || "",
              negativeMarking: section.negativeMarks || "",
              searchText: "",
              selectionType: selectionType,
              questionBankQuestionId: [],
              chapter: [],
              topic: [],
            };
            return {
              id: sectionId,
              sectionName: section.sectionName,
            };
          });
        } else {
          fetchedSections = test.sections.map((section, idx) => {
            const sectionId = section._id;
            initialData[sectionId] = {
              subjectSelections: section.subject || [],
              classSelections: [""],
              questionType: section.questionType || "MCQ",
              positiveMarking: section.correctAnswerMarks || "",
              negativeMarking: section.negativeMarks || "",
              searchText: "",
              selectionType: selectionType,
              questionBankQuestionId: section.questionBankQuestionId || [],
              chapter: section.chapter || [],
              topic: section.topic || [],
            };
            return {
              id: sectionId,
              sectionName: section.sectionName,
            };
          });
        }

        setAllSections(fetchedSections);

        const sessionData = JSON.parse(
          sessionStorage.getItem("sectionMarkingData") || "{}"
        );
        const mergedData = { ...initialData, ...sessionData };

        setSectionData(mergedData);
        sessionStorage.setItem(
          "sectionMarkingData",
          JSON.stringify(mergedData)
        );

        if (fetchedSections.length > 0) {
          setActiveSectionId(fetchedSections[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch test:", error);
      }
    };

    if (id) fetchTestDataById();
  }, [id]);
  // const handleTopicsSelected = (chapterNames, topicNames) => {
  //   const updatedSection = {
  //     ...sectionData[activeSectionId],
  //     chapter: chapterNames,
  //     topic: topicNames,
  //   };
  
  //   const updatedData = {
  //     ...sectionData,
  //     [activeSectionId]: updatedSection,
  //   };
  
  //   console.log("Saving to sessionStorage:", updatedData);
  //   sessionStorage.setItem("sectionMarkingData", JSON.stringify(updatedData));
  // };
  
  const handleTopicsSelected = (chapterNames, topicNames) => {

    let updatedTopicData = [];
  
    if (selectionType === "Auto") {
    
      updatedTopicData = topicNames.map((topic) => ({
        topicName: topic.topicName,
        numberOfQuestions: topic.numberOfQuestions || 0,  
      }));
    } else {
      console.log("the topic chekc", topicNames);
      

      updatedTopicData = topicNames.map((topic) => topic);
    }
  
    // Create the updated section object with chapters and topics
    const updatedSection = {
      ...sectionData[activeSectionId],
      chapter: chapterNames,
      topic: updatedTopicData,
    };
  
    // Merge the updated section data into the existing section data
    const updatedData = {
      ...sectionData,
      [activeSectionId]: updatedSection,
    };
  
    // Save the updated data to sessionStorage
    console.log("Saving to sessionStorage:", updatedData);
    sessionStorage.setItem("sectionMarkingData", JSON.stringify(updatedData));
  
    // Update the sectionData state
    setSectionData(updatedData);
  };
  
  
  // const handleClassChange = (index, value) => {
  const handleClassChange = (value) => {
    // const updated = [...currentSection.classSelections];
    // updated[index] = value;
    setSelectedClass(value);
    sessionStorage.setItem("selectedClass", value);
    // setSectionData((prev) => ({
    //   ...prev,
    //   [activeSectionId]: {
    //     ...prev[activeSectionId],
    //     classSelections: updated,
    //   },
    // }));
  };
  useEffect(() => {
    const savedClass = sessionStorage.getItem("selectedClass");
    if (savedClass) {
      setSelectedClass(savedClass);
    }
  }, []);
  
  const handleSubjectChange = (index, value) => {
    const updated = [...currentSection.subjectSelections];
    updated[index] = value;

    setSectionData((prev) => ({
      ...prev,
      [activeSectionId]: {
        ...prev[activeSectionId],
        subjectSelections: updated,
      },
    }));
  };

  // const handleAddSubject = async (value) => {
  //   const updated = { ...sectionData };

  //   if (!updated[activeSectionId].subjectSelections.includes(value)) {
  //     updated[activeSectionId].subjectSelections.push(value);
  //     setSectionData(updated);
  //     sessionStorage.setItem("sectionMarkingData", JSON.stringify(updated));
  //   }

  //   // Fetch chapters
  //   const subjectObj = subjects.find((sub) => sub.subjectName === value);
  //   if (!subjectObj) return;

  //   const response = await apiServices.fetchChapter(subjectObj._id);


  //   setChapters((prev) => ({
  //     ...prev,
  //     [value]: response, // response should be an array of chapters
  //   }));

  //   setSelectedSubject(value);
  //   setAddNew(false);
  // };

  const handleAddSubject = (value) => {
    const updated = { ...sectionData };

    if (!updated[activeSectionId].subjectSelections.includes(value)) {
      updated[activeSectionId].subjectSelections.push(value);
      setSectionData(updated);
      sessionStorage.setItem("sectionMarkingData", JSON.stringify(updated));
    }

    if (!selectedSubject) {
      setSelectedSubject(value);
    }
    setAddNew(false);
  };

  const selectedChapters = chapters[selectedSubject] || [];

  useEffect(() => {
    const saved = sessionStorage.getItem("sectionMarkingData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSectionData(parsed);
  
      const firstKey = Object.keys(parsed)[0];
      if (firstKey) {
        setActiveSectionId(firstKey);
  
        const firstSection = parsed[firstKey];
        if (firstSection.subjectSelections?.length && !selectedSubject) {
          setSelectedSubject(firstSection.subjectSelections[0]);
        }
      }
    }
  }, []);
  

  const handleRemoveSubject = (index) => {
    const updated = { ...sectionData };
    updated[activeSectionId].subjectSelections.splice(index, 1);
    setSectionData(updated);
    sessionStorage.setItem("sectionMarkingData", JSON.stringify(updated));
  };

  // const handleClassChange = (index, value) => {
  //   const updated = { ...sectionData };
  //   updated[activeSectionId].classSelections[index] = value;
  //   setSectionData(updated);
  // };

  const currentSection = sectionData[activeSectionId] || {
    subjectSelections: [],
    classSelections: [""],
    questionType: "SCQ",
    positiveMarking: "",
    negativeMarking: "",
    searchText: "",
    selectionType: selectionType,
  };
  const handleSelectionTypeChange = (event) => {
    const newSelectionType = event.target.value;
    setSelectionType(newSelectionType);
  
    const updatedSectionData = { ...sectionData };
    updatedSectionData[activeSectionId].selectionType = newSelectionType;
    setSectionData(updatedSectionData);
    syncToSessionStorage(updatedSectionData); 
  };
  
  const handleNextClick = async () => {
    try {
      const sectionData = JSON.parse(sessionStorage.getItem("sectionMarkingData"));
      const selectedClass = sessionStorage.getItem("selectedClass");
  
      const currentSection = sectionData[activeSectionId];
      console.log("the post current section", currentSection);
      let check = currentSection.chapter.map(chapter => ({
        chapterId: chapter.chapterId, 
        chapterName: chapter.chapterName,
      }));
      console.log("the chcekc of chap", check);
      
      // Prepare the request data to match your schema
      const requestData = {
        sectionId: activeSectionId,
        class: selectedClass,
        subjects: currentSection.subjectSelections.map(subject => ({
          subjectName: subject, 
        })),
        negativeMarksPerWrongAnswer: currentSection.negativeMarking,
        marksPerQuestion: currentSection.positiveMarking,
        chapters: currentSection.chapter.map(chapter => ({
       chapter
        })),
        topics: currentSection.topic.map((topic) => ({
   topic
        })),
      };
  
      console.log("Sending request data:", requestData);
  
      // Send the request to the backend
      const response = await testServices.AddSectionDetails(id, requestData);
  
      if (response.status === 200) {
        alert("Section details saved successfully!");
      }
    } catch (error) {
      console.error("Error saving section details:", error);
      alert("Error saving section details");
    }
  };
  
  

  

  return (
    <>
      <TestHeader
        activeSectionId={activeSectionId}
        setActiveSectionId={setActiveSectionId}
        sectionData={sectionData}
        setSectionData={setSectionData}
        allSections={allSections}
        setAllSections={setAllSections}
      />

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
            value={currentSection.questionType}
            onChange={(e) => updateSectionField("questionType", e.target.value)}
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
            value={currentSection.positiveMarking}
            onChange={(e) =>
              updateSectionField("positiveMarking", e.target.value)
            }
            size="small"
          />

          <TextField
            label="Negative Marking"
            type="number"
            value={currentSection.negativeMarking}
            onChange={(e) =>
              updateSectionField("negativeMarking", e.target.value)
            }
            size="small"
          />
        </Box>
        <Button variant="contained" onClick={handleNextClick}>
      Next
    </Button>
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
        {currentSection.subjectSelections.map((subject, index) => (
          <Button
            key={index}
            variant="contained"
            sx={{ backgroundColor: "#1976d2", fontWeight: "bold" }}
            onClick={async () => {
              setSelectedSubject(subject);

              //   const subjectObj = subjects.find((sub) => sub.subjectName === value);
              //   if (subjectObj) {
              //     apiServices.fetchChapter(subjectObj._id).then((res) => {
              //       setChapters((prev) => ({
              //         ...prev,
              //         [value]: res,
              //       }));
              //     });
              //   }
            }}
            endIcon={
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSubject(index);
                }}
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
            onChange={(e) => handleAddSubject(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            {subjects?.map((sub) => (
              <MenuItem key={sub._id} value={sub.subjectName}>
                {sub.subjectName}
              </MenuItem>
            ))}
            {/* <MenuItem value="Maths">Maths</MenuItem>
            <MenuItem value="Physics">Physics</MenuItem>
            <MenuItem value="Chemistry">Chemistry</MenuItem>
            <MenuItem value="Botany">Botany</MenuItem>
            <MenuItem value="Zoology">Zoology</MenuItem> */}
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
        {currentSection?.classSelections?.map((classSelected, index) => (
          <TextField
            key={index}
            select
            label={`Select Class`}
            value={selectedClass}
            // onChange={(e) => handleClassChange(index, e.target.value)}
            onChange={(e) => handleClassChange(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="class 10">Class 10</MenuItem>
            <MenuItem value="class 11">Class 11</MenuItem>
            <MenuItem value="class 12">Class 12</MenuItem>
          </TextField>
        ))}

        <TextField
          placeholder="Search..."
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Button
          variant="contained"
          sx={{ backgroundColor: "#1976d2" }}
          onClick={async () => {
            console.log("the serched", selectedSubject);

            try {
              if (!selectedSubject || !searchText.trim()) {
                console.warn("Missing selected subject or search text");
                return;
              }

              const subjectObj = subjects.find(
                (sub) => sub.subjectName === selectedSubject
              );
              if (!subjectObj) {
                console.warn("Subject not found in subject list");
                return;
              }

              const chapterResponse = await apiServices.fetchChapter(
                subjectObj._id
              );

              const chapterWithTopics = await Promise.all(
                chapterResponse.map(async (chapter) => {
                  try {
                    const topics = await apiServices.fetchTopic(chapter._id);

                    return {
                      ...chapter,
                      topics,
                    };
                  } catch (error) {
                    console.error(
                      `Failed to fetch topics for ${chapter.chapterName}`,
                      error.message
                    );
                    return {
                      ...chapter,
                      topics: [],
                    };
                  }
                })
              );

              const filteredChapters = chapterWithTopics.filter((chapter) => {
                // Match by chapter name
                const matchChapter = chapter.chapterName
                  ?.toLowerCase()
                  .includes(searchText.toLowerCase());

                // Match any topic inside this chapter
                // const filteredTopics = chapter.topics?.filter((topic) =>
                //   topic.topicName?.toLowerCase().includes(searchText.toLowerCase())
                // );
                const filteredTopics = chapter.topics.filter((topic) => {
                  return topic.topicName
                    .toLowerCase()
                    .includes(searchText.toLowerCase());
                });
                // Attach only matching topics (optional: helpful for rendering)
                if (filteredTopics?.length > 0) {
                  chapter.topics = filteredTopics;
                }

                return (
                  matchChapter || (filteredTopics && filteredTopics.length > 0)
                );
              });

              console.log("Filtered chapters:", filteredChapters);

              setChapters((prev) => ({
                ...prev,
                [selectedSubject]: filteredChapters,
              }));
            } catch (error) {
              console.error("Search error:", error);
            }
          }}
        >
          Search
        </Button>

        <Typography sx={{ fontWeight: 500 }}>Question Selection:</Typography>

        <RadioGroup
  row
  value={selectionType}
  onChange={handleSelectionTypeChange}
>
  <FormControlLabel
    value="Manual"
    control={<Radio />}
    label="Manual"
  />
  <FormControlLabel
    value="Auto"
    control={<Radio />}
    label="Auto"
  />
</RadioGroup>
      </Box>

      {selectionType === "Manual" && (
  <ChapterAndTopic
    chapters={chapters[selectedSubject] || []}
    onTopicsSelected={handleTopicsSelected}
  />
)}


{selectionType === "Auto" && (
  <AutoQuestionUI
  chapters={chapters[selectedSubject] || []}
  sectionData={sectionData}  
  activeSectionId={activeSectionId}  
  />
)}
    </>
  );
};

export default TestSelection;
