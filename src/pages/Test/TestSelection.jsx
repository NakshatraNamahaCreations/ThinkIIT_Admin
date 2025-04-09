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
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();

  const [sectionData, setSectionData] = useState({});

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

      sessionStorage.setItem("sectionMarkingData", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const fromSession = JSON.parse(
      sessionStorage.getItem("sectionMarkingData") || "{}"
    );

    if (
      activeSectionId &&
      !sectionData[activeSectionId] &&
      !fromSession[activeSectionId]
    ) {
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

  // useEffect(() => {
  //   const saved = sessionStorage.getItem("sectionMarkingData");
  //   if (saved) {
  //     const parsed = JSON.parse(saved);
  //     setSectionData(parsed);

  //     const firstKey = Object.keys(parsed)[0];
  //     if (firstKey) setActiveSectionId(firstKey);
  //   }
  // }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("sectionMarkingData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSectionData(parsed);

      const firstKey = Object.keys(parsed)[0];
      if (firstKey) {
        setActiveSectionId(firstKey);

        const firstSection = parsed[firstKey];
        const subjectList = firstSection.subjectSelections;

        if (subjectList?.length > 0) {
          // ✅ Handle both string and object subject types
          const firstSub =
            typeof subjectList[0] === "string"
              ? subjectList[0]
              : subjectList[0].subjectName;

          setSelectedSubject(firstSub);
        }
      }
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
    console.log("jsljsldjasdj");

    // const fetchTestDataById = async () => {
    //   try {
    //     const response = await testServices.getTestById(id);
    //     const test = response?.data;
    //     console.log("theeeeeee test check ", test.testPattern);

    //     // Check for matching test name in your predefined JSON
    //     const matchedPattern = testPatterns.find(
    //       (pattern) =>
    //         pattern.exam.toLowerCase().trim() ===
    //         test.testPattern.toLowerCase().trim()
    //     );

    //     const sessionSectionNames = JSON.parse(
    //       sessionStorage.getItem("customSectionNames") || "{}"
    //     );

    //     let fetchedSections = [];
    //     let initialData = {};
    //     {
    //       console.log("the sectionmatchccc", matchedPattern);
    //     }
    //     if (matchedPattern) {
    //       // Use predefined JSON pattern
    //       fetchedSections = matchedPattern.sections.map((section, idx) => {
    //         {
    //           console.log("the sectionsaaaaaaa", section);
    //         }
    //         const sectionId = `section-${idx}-${Date.now()}`;
    //         initialData[sectionId] = {
    // subjectSelections: section.subjects.map((s) =>
    //   s.split("(")[0].trim()
    // ), // Clean subject names
    //           classSelections: [""],
    //           questionType: section.questionType || "Tmm",
    //           positiveMarking: section.correctAnswerMarks || "",
    //           negativeMarking: section.negativeMarks || "",
    //           searchText: "",
    //           selectionType: selectionType,
    //           questionBankQuestionId: [],
    //           chapter: [],
    //           topic: [],
    //         };
    //         return {
    //           id: sectionId,
    //           sectionName: section.sectionName,
    //         };
    //       });
    //     } else {
    //       fetchedSections = test.sections.map((section, idx) => {
    //         const sectionId = section._id;
    //         initialData[sectionId] = {
    //           subjectSelections: section.subject || [],
    //           classSelections: [""],
    //           questionType: section.questionType || "MCQ",
    //           positiveMarking: section.correctAnswerMarks || "",
    //           negativeMarking: section.negativeMarks || "",
    //           searchText: "",
    //           selectionType: selectionType,
    //           questionBankQuestionId: section.questionBankQuestionId || [],
    //           chapter: section.chapter || [],
    //           topic: section.topic || [],
    //         };
    //         return {
    //           id: sectionId,
    //           sectionName: section.sectionName,
    //         };
    //       });
    //     }

    //     setAllSections(fetchedSections);

    //     const sessionData = JSON.parse(
    //       sessionStorage.getItem("sectionMarkingData") || "{}"
    //     );
    //     const mergedData = { ...initialData, ...sessionData };

    //     setSectionData(mergedData);
    //     sessionStorage.setItem(
    //       "sectionMarkingData",
    //       JSON.stringify(mergedData)
    //     );

    //     if (fetchedSections.length > 0) {
    //       setActiveSectionId(fetchedSections[0].id);
    //     }
    //   } catch (error) {
    //     console.error("Failed to fetch test:", error);
    //   }
    // };
    const fetchTestDataById = async () => {
      try {
        const response = await testServices.getTestById(id);
        const test = response?.data;
        if (!test) return;

        const initialData = {};
        const fetchedSections = test.sections.map((section, idx) => {
          const sectionId = section._id;

          initialData[sectionId] = {
            subjectSelections: section.subject?.map((s) => s) || [],
            classSelections: [test.class || ""],
            questionType: section.questionType || "SCQ",
            positiveMarking: section.marksPerQuestion || "",
            negativeMarking: section.negativeMarksPerWrongAnswer || "",
            searchText: "",
            selectionType: section.selectionType || "Manual",
            questionBankQuestionId: section.questionBankQuestionId || [],
            chapter: section.chapter || [],
            topic: section.topic || [],
          };

          return {
            id: sectionId,
            sectionName: section.sectionName || `Section ${idx + 1}`,
          };
        });

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
    // sessionStorage.setItem("sectionMarkingData", JSON.stringify(updatedData));

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
    const validClasses = ["Class 10", "Class 11", "Class 12"];

    if (validClasses.includes(savedClass)) {
      setSelectedClass(savedClass);
    } else {
      setSelectedClass("");
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
    // Find the subject object from the fetched subjects list
    const selectedSubjectObj = subjects.find(
      (sub) => sub.subjectName === value
    );
    if (!selectedSubjectObj) return;

    const updated = { ...sectionData };

    // Check if the subject is already in the selections
    if (
      !updated[activeSectionId].subjectSelections.some(
        (s) => s.subjectName === value
      )
    ) {
      // Add the selected subject to the subjectSelections array
      updated[activeSectionId].subjectSelections.push(selectedSubjectObj);
      setSectionData(updated);
      sessionStorage.setItem("sectionMarkingData", JSON.stringify(updated));
    }

    // Update the selectedSubject to the chosen value (this ensures it's Math or the correct subject)
    setSelectedSubject(value);

    setAddNew(false); // Close the "add new subject" input
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
      const sectionData = JSON.parse(
        sessionStorage.getItem("sectionMarkingData")
      );
      const selectedClass = sessionStorage.getItem("selectedClass");
      const currentSection = sectionData[activeSectionId];

      const topics = currentSection.topic.map((topic) => ({
        topicName: topic.topicName || topic,
        numberOfQuestions: topic.numberOfQuestions || 0,
        chapterId: topic.chapterId || topic.chapter?._id || "",
      }));

      if (selectionType === "Auto") {
        const autoPickResponse = await testServices.AutoPickQuestions(id, {
          sectionId: activeSectionId,
          topics: topics,
          totalQuestions: topics.reduce(
            (sum, t) => sum + (t.numberOfQuestions || 0),
            0
          ),
        });

        if (!autoPickResponse?.success) {
          alert("Auto pick failed.");
          return;
        }

        const autoPicked = autoPickResponse.data;

        const existing = JSON.parse(
          sessionStorage.getItem("AutoPickedQuestions") || "{}"
        );
        const updated = { ...existing };

        if (!updated[activeSectionId]) updated[activeSectionId] = {};

        Object.entries(autoPicked).forEach(([topicName, questionMap]) => {
          updated[activeSectionId][topicName] = {
            ...(updated[activeSectionId][topicName] || {}),
            ...questionMap,
          };
        });

        sessionStorage.setItem("AutoPickedQuestions", JSON.stringify(updated));
      }

      // Save the section data via AddSectionDetails
      const requestData = {
        sectionId: activeSectionId,
        class: selectedClass,
        subjects: currentSection.subjectSelections.map((subject) => ({
          subjectName: subject.subjectName || subject,
        })),
        negativeMarksPerWrongAnswer: currentSection.negativeMarking,
        marksPerQuestion: currentSection.positiveMarking,
        chapters: currentSection.chapter.map((chapter) => ({
          chapterName: chapter.chapterName || chapter,
        })),
        topics,
      };

      const response = await testServices.AddSectionDetails(id, requestData);

      alert("Section details saved successfully!");
      navigate(`/questionPage/${id}`);
    } catch (error) {
      console.error("Error in handleNextClick:", error);
      alert("An error occurred.");
    }
  };
  useEffect(() => {
    console.log("Selected Subject: ", selectedSubject);
  }, [selectedSubject]); // This will log only when the selectedSubject changes
  
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
    
        {currentSection?.subjectSelections?.map((subject, index) => (
          <Button
            key={index}
            variant="contained"
            sx={{
              backgroundColor:
                subject.subjectName === selectedSubject ? "#1976d2" : "white",
              border:
                subject.subjectName === selectedSubject
                  ? ""
                  : "1px solid black",
              fontWeight: "bold",
              color:
                subject.subjectName === selectedSubject ? "white" : "black",
            }}
            onClick={async () => {
              setSelectedSubject(subject.subjectName);

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
                {console.log("the checling  bro", subject.subjectName)}
            {subject.subjectName}
          </Button>
        ))}

        {currentSection?.subjectSelections?.length === 0 || addNew ? (
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
            select
            label="Select Class"
            value={selectedClass || ""}
            onChange={(e) => handleClassChange(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Select Class</MenuItem>
            <MenuItem value="Class 10">Class 10</MenuItem>
            <MenuItem value="Class 11">Class 11</MenuItem>
            <MenuItem value="Class 12">Class 12</MenuItem>
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
          <FormControlLabel value="Manual" control={<Radio />} label="Manual" />
          <FormControlLabel value="Auto" control={<Radio />} label="Auto" />
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
