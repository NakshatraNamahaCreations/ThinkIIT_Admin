import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import testServices from "../../services/testService";
import { Typography } from "@mui/material";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import QuestionDistributionSidebar from "./components/QuestionDistributionSidebar";
import axios from "axios";

const FilterDropdown = ({ name, label, value, onChange, options }) => {
  return (
    <div className="min-w-[20px]">
      {/* <label className="block text-gray-700 font-medium mb-1">{label}</label> */}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 bg-white px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        <option value="">All {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

const QuestionPages = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [pickedQuestions, setPickedQuestions] = useState({});
  const [testDetails, setTestDetails] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [showSolution, setShowSolution] = useState({});
  const [topicName, setTopicName] = useState("");
  const [filters, setFilters] = useState({
    Class: "",
    Subject: "",
    Chapter: "",
    Topic: "",
    Difficulty: "",
  });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTestDataById = async (id) => {
    try {
      const data = await testServices.getTestById(id);
      if (data?.data) {
        setSavedSections(data.data);

        setActiveSection(data.data.sections[0]?._id || "");
      } else {
        setSavedSections([]);
        // toast.error("No sections found.");
      }
    } catch (error) {
      //   toast.error("Failed to fetch test details.");
    }
  };

  useEffect(() => {
    fetchTestDataById(id);
  }, [id]);
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!selectedSection) return;

        const payload = {
          Subject: selectedSection.subject?.trim(),
          chapter:
            selectedSection.chapter?.map((chap) => chap.chapterName.trim()) ||
            [],
          topic:
            selectedSection.topic?.map((topic) => topic.topicName.trim()) || [],
          questionType: selectedSection.questionType?.trim(),
        };

        const response = await testServices.GetFilteredQuestions(payload);

        setFilteredQuestions(response);
      } catch (err) {
        console.error("Fetch Error:", err.message);
      }
    };

    fetchQuestions();
  }, [selectedSection]);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await testServices.getTestById(id);
        if (response.success && response.data) {
          setTestDetails(response.data);

          if (response.data.sections.length > 0) {
            setSelectedSection(response.data.sections[0]);
          }
        } else {
          console.error("Failed to fetch test details.");
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchTestDetails();
  }, [id]);

  const handleFilterChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePickQuestion = (questionId, topicName) => {
    if (!selectedSection || !topicName) {
      console.warn("Missing sectionId or topicName");
      return;
    }

    const sectionId = selectedSection._id;
    const trimmedTopicName = topicName.trim();

    setPickedQuestions((prev) => {
      const prevSection = prev[sectionId] || {};
      const prevTopic = prevSection[trimmedTopicName] || {};

      const isAlreadyPicked = !!prevTopic[questionId];

      // Toggle selection
      const updatedTopic = {
        ...prevTopic,
        ...(isAlreadyPicked ? {} : { [questionId]: true }),
      };

      if (isAlreadyPicked) delete updatedTopic[questionId];

      const updatedSection = {
        ...prevSection,
        [trimmedTopicName]: updatedTopic,
      };

      const updated = {
        ...prev,
        [sectionId]: updatedSection,
      };

      localStorage.setItem("pickedQuestions", JSON.stringify(updated));

      return updated;
    });
  };

  const toggleSolution = (questionId) => {
    setShowSolution((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // useEffect(() => {
  //   const fetchAutoPickedQuestions = async () => {
  //     if (testDetails?.questionSelection === "Auto" && selectedSection) {
  //       const response = await testServices.getAutoPickedQuestions(id);
  
  //       if (response.success && response.data) {
  //         const sectionData = response.data[selectedSection._id];
  
  //         if (sectionData) {
  //           const ids = [];
  
  //           Object.values(sectionData).forEach((topicMap) => {
  //             Object.keys(topicMap).forEach((qId) => ids.push(qId));
  //           });
  
  //           setAutoPickedIds(ids);
  //         }
  //       }
  //     }
  //   };
  
  //   fetchAutoPickedQuestions();
  // }, [testDetails, selectedSection]);
  
  useEffect(() => {
    const saved = sessionStorage.getItem("AutoPickedQuestions");
    if (saved && selectedSection) {
      try {
        const autoPicked = JSON.parse(saved);
  
        const sectionId = selectedSection._id;
        const transformed = {
          [sectionId]: autoPicked
        };
  
        setPickedQuestions(transformed);
        sessionStorage.setItem("pickedQuestions", JSON.stringify(transformed)); // Optional
      } catch (error) {
        console.error("Error parsing AutoPickedQuestions:", error);
        // setPickedQuestions({});
      }
    }
  }, [selectedSection]);
  
  
  
  const handleSubmit = async () => {
    try {
      const formattedTestId = id?.testId || id;

      const selectedQuestions = {};

      Object.keys(pickedQuestions).forEach((sectionId) => {
        selectedQuestions[sectionId] = {};

        Object.keys(pickedQuestions[sectionId]).forEach((topicName) => {
          selectedQuestions[sectionId][topicName] = {};

          Object.keys(pickedQuestions[sectionId][topicName]).forEach(
            (questionId) => {
              const questionDetail = filteredQuestions.find(
                (q) => q._id === questionId
              );
              if (questionDetail) {
                selectedQuestions[sectionId][topicName][questionId] =
                  questionDetail;
              }
            }
          );
        });
      });

      sessionStorage.setItem(
        "questionDetails",
        JSON.stringify(selectedQuestions)
      );

      navigate(`/questionReview/${formattedTestId}`);
    } catch (error) {
      console.error("Submission Error:", error);
    }
  };

  const handleTopicSelect = (section, topic) => {
    setSelectedSection(section);
    setSelectedTopic(topic);
  };
  const saved = localStorage.getItem("pickedQuestions");
  console.log("pk ques",saved)

  useEffect(() => {
    const saved = sessionStorage.getItem("AutoPickedQuestions");
    if (saved && selectedSection) {
      try {
        const autoPicked = JSON.parse(saved);
        const sectionId = selectedSection._id;
  
        const transformed = autoPicked[sectionId] 
          ? { [sectionId]: autoPicked[sectionId] }
          : autoPicked;
  
        console.log("🛠 Setting pickedQuestions as:", transformed);
        setPickedQuestions(transformed);
  
        // Optional: update session/local storage
        sessionStorage.setItem("pickedQuestions", JSON.stringify(transformed));
        localStorage.setItem("pickedQuestions", JSON.stringify(transformed));
      } catch (error) {
        console.error("Error parsing AutoPickedQuestions:", error);
      }
    }
  }, [selectedSection]);
  
  
  

  useEffect(() => {
    localStorage.setItem("pickedQuestions", JSON.stringify(pickedQuestions));
  }, [pickedQuestions]);

  const config = {
    loader: { load: ["[tex]/html"] },
    tex: {
      packages: { "[+]": ["html"] },
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
    },
  };

  return (
    <MathJaxContext version={3} config={config}>
      <div className="flex gap-6  bg-gray-100 min-h-screen">
        {/* Sidebar: Question Distribution */}
        <QuestionDistributionSidebar
          onSelectTopic={handleTopicSelect}
          pickedQuestions={pickedQuestions}
          handleSubmit={handleSubmit}
        />

        {/* Main Content Area: Question Selection */}
        <div className="w-3/4 bg-white rounded-lg shadow-md">
          {/* Section Navigation */}

          <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <p className="text-lg font-semibold text-gray-700 mb-3">
              Filter Questions
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {/* <FilterDropdown
                name="Class"
                label="Class"
                value={filters.Class}
                onChange={handleFilterChange}
                options={["11", "12"]}
              />
              <FilterDropdown
                name="Subject"
                label="Subject"
                value={filters.Subject}
                onChange={handleFilterChange}
                options={[...new Set(questions.map((q) => q.Subject))]}
              /> */}
              <FilterDropdown
                name="Chapter"
                label="Chapter"
                value={filters.Chapter}
                onChange={handleFilterChange}
                options={[...new Set(filteredQuestions?.map((q) => q.Chapter))]}
              />
              <FilterDropdown
                name="Topic"
                label="Topic"
                value={filteredQuestions.Topic}
                onChange={handleFilterChange}
                options={[...new Set(questions?.map((q) => q.Topic))]}
              />
              <FilterDropdown
                name="Difficulty"
                label="Difficulty"
                value={filteredQuestions.Difficulty}
                onChange={handleFilterChange}
                options={[...new Set(questions?.map((q) => q.Difficulty))]}
              />
            </div>
          </div>
          {/* Question List */}
          <div className="mt-5">
            {filteredQuestions?.length > 0 ? (
              filteredQuestions
                ?.filter((question) => {
                  if (!selectedTopic) return true; 
                  return pickedQuestions[selectedSection?._id]?.[
                    selectedTopic.topicName
                  ]?.[question._id];
                })
                ?.map((question) => {
                  const imageMatch = question.English?.match(
                    /\\includegraphics\[.*?\]{(.*?)}/
                  );
                  const imageId = imageMatch ? imageMatch[1] : null;
                  console.log("Checking isPicked for", {
                    sectionId: selectedSection?._id,
                    topic: question.Topic,
                    questionId: question._id,
                    isPicked: pickedQuestions[selectedSection?._id]?.[question.Topic]?.[question._id]
                  });
                  
                  const isPicked = pickedQuestions[selectedSection?._id]?.[question.Topic]?.[question._id];

                  return (
                    <div
                      key={question._id}
                      className={`mt-3 m-3 p-3 border rounded-md shadow-sm transition-all relative ${
                        isPicked ? "bg-green-100 border-green-400" : "bg-white"
                      }`}
                    >
                      {/* Pick/Remove Button (Top Right) */}
                      <button
                        className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-md transition ${
                          isPicked
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        onClick={() =>
                          togglePickQuestion(question._id, question.Topic)
                        }
                      >
                        {isPicked ? "Remove" : "Pick"}
                      </button>

                      {/* Question Text + Image */}
                      <div className="flex w-full gap-3">
                        <div className="w-[80%] text-sm text-gray-800">
                          <MathJax>
                            {question.English?.replace(/\\\\/g, " \\[ \n \\] ")
                              .replace(/\\includegraphics\[.*?\]{.*?}/g, "")
                              .trim()}
                          </MathJax>
                        </div>
                        {imageId &&
                          question.Images &&
                          question.Images[imageId] && (
                            <img
                              src={`data:image/jpeg;base64,${question.Images[imageId]}`}
                              alt="Question Diagram"
                              className="w-[180px] h-[140px] border rounded-md shadow-sm"
                            />
                          )}
                      </div>

                      {/* Options Section */}
                      <ul className="mt-2 space-y-1">
                        {question.OptionsEnglish.split("\\\\")
                          .filter((option) => option.trim() !== "")
                          .map((option, index) => {
                            const correctAnswers =
                              question.Answer.split("&").map(Number);
                            const isCorrect = correctAnswers.includes(
                              index + 1
                            );

                            return (
                              <li
                                key={index}
                                className={`flex items-center text-xs px-2 py-1 rounded-md ${
                                  isCorrect
                                    ? "text-green-600 font-bold "
                                    : "text-gray-700"
                                }`}
                              >
                                <MathJax
                                  inline
                                >{`\\(${option.trim()}\\)`}</MathJax>
                              </li>
                            );
                          })}
                      </ul>

                      {/* Show Solution Button */}
                      <button
                        className="mt-2 text-xs text-blue-600 font-semibold rounded-md hover:bg-blue-100 px-2 py-1 transition"
                        onClick={() => toggleSolution(question._id)}
                        style={{ fontSize: "12px" }}
                      >
                        {showSolution[question._id]
                          ? "Hide Solution"
                          : "Show Solution"}
                      </button>

                      {showSolution[question._id] && question.SolutionSteps && (
                        <div className="mt-1 p-2 bg-gray-100 border rounded-md text-xs">
                          <MathJax>{question.SolutionSteps}</MathJax>
                        </div>
                      )}
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-500 mt-3">No questions found.</p>
            )}
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
};

export default QuestionPages;
