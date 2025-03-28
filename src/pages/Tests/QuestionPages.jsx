import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import testServices from "../../services/testService";
import { Typography } from "@mui/material";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import QuestionDistributionSidebar from "./components/QuestionDistributionSidebar";
import axios from "axios";
import "./styles/QuestionPages.css"
const FilterDropdown = ({ name, label, value, onChange, options }) => {
  return (
    <div className="min-w-[20px]">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 bg-white px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        <option value="">All {label}</option>
        {options &&
          options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
      </select>
    </div>
  );
};

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

const QuestionPages = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
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
  const [sectionWiseQuestions, setSectionWiseQuestions] = useState({});
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
        setAllQuestions(response);
        setSectionWiseQuestions((prev) => ({
          ...prev,
          [selectedSection._id]: response,
        }));

        const difficultyOptions = [
          ...new Set(response.map((q) => q.Difficulty)),
        ];
        setFilters((prevFilters) => ({
          ...prevFilters,
          Difficulty: difficultyOptions.length ? difficultyOptions : [],
        }));
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

            const allQuestions = await Promise.all(
              response.data.sections.map(async (section) => {
                const payload = {
                  Subject: section.subject?.trim(),
                  chapter:
                    section.chapter?.map((chap) => chap.chapterName.trim()) ||
                    [],
                  topic:
                    section.topic?.map((topic) => topic.topicName.trim()) || [],
                  questionType: section.questionType?.trim(),
                };
                const response = await testServices.GetFilteredQuestions(
                  payload
                );
                return { sectionId: section._id, questions: response };
              })
            );

            const questionsMap = {};
            allQuestions.forEach(({ sectionId, questions }) => {
              questionsMap[sectionId] = questions;
            });

            setSectionWiseQuestions(questionsMap);
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
  // const handleCheck = (e) => {
  //   const {name, value} = e.target.value;
  //   setFilters(() => {
  // const newFilter = {
  //   ...prevFilter,
  //   [name]: value,

  // }
  //   })
  // }
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        [name]: value,
      };

      let updatedQuestions = allQuestions;

      if (newFilters.Difficulty) {
        updatedQuestions = updatedQuestions.filter(
          (question) => question.Difficulty === newFilters.Difficulty.trim()
        );
      }

      setFilteredQuestions(updatedQuestions);
      return newFilters;
    });
  };

  const togglePickQuestion = (questionId, topicName) => {
    if (!selectedSection || !topicName) {
      console.warn("Missing sectionId or topicName");
      return;
    }

    const sectionId = selectedSection._id;
    const trimmedTopicName = topicName.trim();
    const sectionMaxQuestions = selectedSection.numberOfQuestions;
    // const topicMaxQuestions = selectedSection.topic.find(
    //   (topic) => topic.topicName === trimmedTopicName
    // )?.numberOfQuestions;
    const topicMaxQuestions = selectedSection.topic.find(
      (item) => item.topicName === trimmedTopicName
    )?.numberOfQuestions;

    setPickedQuestions((prev) => {
      const prevSection = prev[sectionId] || {};
      const prevTopic = prevSection[trimmedTopicName] || {};
      const isAlreadyPicked = !!prevTopic[questionId];

      const updatedTopic = {
        ...prevTopic,
        // ...(isAlreadyPicked ? {} : { [questionId]: true }),
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

      const selectedQuestionCount = Object.keys(
        updatedSection[trimmedTopicName]
      ).length;

      if (selectedQuestionCount > topicMaxQuestions) {
        alert(
          `You cannot select more than ${topicMaxQuestions} questions for the topic: ${trimmedTopicName}`
        );
        return prev;
      }

      if (selectedQuestionCount > sectionMaxQuestions) {
        alert(
          `You cannot select more than ${sectionMaxQuestions} questions for this section.`
        );
        return prev;
      }

      sessionStorage.setItem("pickedQuestions", JSON.stringify(updated));
      localStorage.setItem("pickedQuestions", JSON.stringify(updated));
      console.log("the latest udpated", updated);

      return updated;
    });
  };

  const toggleSolution = (questionId) => {
    setShowSolution((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  useEffect(() => {
    const fetchAutoPickedQuestions = async () => {
      const saved = sessionStorage.getItem("AutoPickedQuestions");

      if (saved && testDetails?.sections?.length > 0) {
        try {
          const autoPicked = JSON.parse(saved);
          const merged = { ...pickedQuestions };

          testDetails.sections.forEach((section) => {
            const sectionId = section._id;
            if (autoPicked[sectionId]) {
              merged[sectionId] = {
                ...(merged[sectionId] || {}),
                ...autoPicked[sectionId],
              };
            }
          });

          setPickedQuestions(merged);

          const questionIds = [];
          Object.values(autoPicked).forEach((sectionData) => {
            Object.values(sectionData).forEach((topicData) => {
              Object.keys(topicData).forEach((qId) => questionIds.push(qId));
            });
          });

          const fullQuestions = await GetQuestionByQid(id, questionIds);

          if (fullQuestions.success) {
            Object.keys(fullQuestions.data).forEach((qId, index) => {
              const fullQuestion = fullQuestions.data[index];
              merged[sectionId] = {
                ...(merged[sectionId] || {}),
                [qId]: fullQuestion,
              };
            });

            setPickedQuestions(merged);

            sessionStorage.setItem("pickedQuestions", JSON.stringify(merged));
            localStorage.setItem("pickedQuestions", JSON.stringify(merged));
          }
        } catch (error) {
          console.error("Error parsing AutoPickedQuestions:", error);
        }
      }
    };

    fetchAutoPickedQuestions();
  }, [testDetails]);

  const handleSubmit = () => {
    try {
      const formattedTestId = id?.testId || id;
      const selectedDetails = {};

      Object.keys(pickedQuestions).forEach((sectionId) => {
        const topicMap = pickedQuestions[sectionId];
        const section = testDetails.sections.find(
          (sec) => sec._id === sectionId
        );
        if (!section) return;

        selectedDetails[sectionId] = {
          sectionDetails: {
            subject: section.subject,
            chapter: section.chapter,
            topic: section.topic,
            questionType: section.questionType,
            numberOfQuestions: section.numberOfQuestions,
          },
          pickedTopics: {},
        };

        Object.keys(topicMap).forEach((topicName) => {
          const questionIdsMap = topicMap[topicName];
          const questionIds = Object.keys(questionIdsMap);

          // Get full questions from filteredQuestions (or all available questions if needed)
          const fullQuestions = (sectionWiseQuestions[sectionId] || [])
            .filter((q) => questionIds.includes(q._id))
            .map((q) => ({
              _id: q._id,
              English: q.English,
              OptionsEnglish: q.OptionsEnglish,
              Answer: q.Answer,
              Topic: q.Topic,
              Chapter: q.Chapter,
              Difficulty: q.Difficulty,
              Images: q.Images || null,
              SolutionSteps: q.SolutionSteps || null,
            }));

          selectedDetails[sectionId].pickedTopics[topicName] = fullQuestions;
        });
      });

      const prevDetails = JSON.parse(
        sessionStorage.getItem("questionDetails") || "{}"
      );
      const updatedDetails = { ...prevDetails, ...selectedDetails };

      sessionStorage.setItem("questionDetails", JSON.stringify(updatedDetails));
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

  // useEffect(() => {
  //   // Fetch auto-picked questions from sessionStorage when the section changes
  //   const saved = sessionStorage.getItem("AutoPickedQuestions");

  //   if (saved && selectedSection) {
  //     try {
  //       const autoPicked = JSON.parse(saved);
  //       const sectionId = selectedSection._id;

  //       // Retrieve the selected questions for the section
  //       const newSectionData = autoPicked[sectionId]
  //         ? { [sectionId]: autoPicked[sectionId] }
  //         : {};

  //       // Update pickedQuestions with auto-picked data from sessionStorage
  //       setPickedQuestions((prev) => {
  //         const merged = { ...prev, ...newSectionData };

  //         sessionStorage.setItem("pickedQuestions", JSON.stringify(merged));
  //         localStorage.setItem("pickedQuestions", JSON.stringify(merged));

  //         return merged;
  //       });
  //     } catch (error) {
  //       console.error("Error parsing AutoPickedQuestions:", error);
  //     }
  //   }
  // }, [selectedSection]);

  useEffect(() => {
    const saved = sessionStorage.getItem("AutoPickedQuestions");
    if (saved && testDetails?.sections?.length > 0) {
      try {
        const autoPicked = JSON.parse(saved);
        const merged = { ...pickedQuestions };

        testDetails.sections.forEach((section) => {
          const sectionId = section._id;
          if (autoPicked[sectionId]) {
            merged[sectionId] = {
              ...(merged[sectionId] || {}),
              ...autoPicked[sectionId],
            };
          }
        });

        setPickedQuestions(merged);
        console.log("the mereged", merged);

        sessionStorage.setItem("pickedQuestions", JSON.stringify(merged));
        // localStorage.setItem("pickedQuestions", JSON.stringify(merged));
      } catch (error) {
        console.error("Error parsing AutoPickedQuestions:", error);
      }
    }
  }, [testDetails]);
  const GetQuestionByQid = async (id, mode) => {
    try {
      const response = await testServices.GetQuestionByQid(id, mode);

      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      return { success: false, message: "Failed to fetch questions" };
    }
  };
  useEffect(() => {
    localStorage.setItem("pickedQuestions", JSON.stringify(pickedQuestions));
  }, [pickedQuestions]);

  useEffect(() => {
    // Trigger MathJax typesetting after content updates
    setTimeout(() => {
      window.MathJax?.typeset();
    }, 0);
  }, [filteredQuestions, pickedQuestions]);   
  
  
  const cleanLatexString = (latexString) => {
    return latexString
      .replace(/\\\\/g, " ")
      .replace(/\$([^$]+)\$/g, "\\($1\\)") 
      .replace(/\n/g, "\\\\")
  };
  
  
  
  return (
<MathJaxContext version={3} config={config}>
  <div className="flex gap-6 bg-gray-100 min-h-screen">
    <QuestionDistributionSidebar
      onSelectTopic={handleTopicSelect}
      pickedQuestions={pickedQuestions}
      handleSubmit={handleSubmit}
    />
    <div className="w-3/4 bg-white rounded-lg shadow-md">
      <div className="flex space-x-3 bg-white p-3 rounded-lg shadow-md">
        {testDetails?.sections?.length > 0 && (
          <div className="flex space-x-3 bg-white p-3 rounded-lg shadow-md">
            {testDetails.sections.map((section, index) => (
              <button
                key={section._id}
                className={`px-5 py-2 text-lg font-semibold rounded-md transition-all ${
                  selectedSection?._id === section._id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => {
                  setSelectedSection(section);
                  setSelectedTopic(null);
                }}
              >
                Section {index + 1} ({section.numberOfQuestions} Qs)
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white p-1 rounded-lg">
        <div className="flex flex-row justify-end">
          <FilterDropdown
            name="Difficulty"
            label="Difficulty"
            value={filters.Difficulty}
            onChange={handleFilterChange}
            options={["Low", "Medium", "High"]}
          />
        </div>
      </div>
      <div>
        {filteredQuestions?.length > 0 ? (
          filteredQuestions.map((question) => {
            const imageMatch = question.English?.match(
              /\\includegraphics\[.*?\]{(.*?)}/
            );
            const imageId = imageMatch ? imageMatch[1] : null;
            const cleanQuestion = question.English?.replace(
              /\\\\/g,
              " \\[ \n \\] "
            )
              .replace(/\\includegraphics\[.*?\]{.*?}/g, "")
              .trim();

            const isPicked =
              pickedQuestions[selectedSection?._id]?.[question.Topic]?.[
                question._id
              ];

            return (
              <div
                key={question._id}
                className={`mt-3 m-3 p-3 border rounded-md shadow-sm transition-all relative ${
                  isPicked ? "bg-green-100 border-green-400" : "bg-white"
                }`}
              >
                <div className="flex align-center ">
                  {question.AppearedIn !== "" && (
                    <div className="absolute top-3 right-30 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {question.AppearedIn}
                    </div>
                  )}

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
                </div>

                {/* Question Text + Image */}
                <div className="flex justify-between items-start">
                  <div className="w-[80%]">
                    <div className="question-text">
                      <MathJax inline
                        style={{ fontSize: "16px", marginBottom: "10px" }}
                      >
                       {`${cleanLatexString(question.English)}`}
                      </MathJax>
                    </div>
                  </div>
                  {imageId &&
                    question.Images &&
                    question.Images[imageId] && (
                      <img
                        src={`data:image/jpeg;base64,${question.Images[imageId]}`}
                        alt="Question Diagram"
                        className="w-[250px] h-[200px] border rounded-lg shadow-sm"
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
                      const isCorrect = correctAnswers.includes(index + 1);

                      const cleanOption = cleanLatexString(option.trim());

                      return (
                        <li
                          key={index}
                          className={`mt-1 text-sm flex items-center ${
                            isCorrect ? "text-green-600 font-bold" : ""
                          }`}
                        >
                          <MathJax inline>{`${cleanOption}`}</MathJax>
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
