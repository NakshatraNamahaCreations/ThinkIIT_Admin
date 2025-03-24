import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import testServices from "../../services/testService";
import { Typography } from "@mui/material";
import axios from "axios";
import { MathJax, MathJaxContext } from "better-react-mathjax";

const FilterDropdown = ({ name, label, value, onChange, options }) => {
  return (
    <div className="min-w-[140px]">
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
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

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [pickedQuestions, setPickedQuestions] = useState({});
  const [filters, setFilters] = useState({
    Class: "",
    Subject: "",
    Chapter: "",
    Topic: "",
    Difficulty: "",
  });
  const [testDetails, setTestDetails] = useState(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const navigate = useNavigate();
  const [showSolution, setShowSolution] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await testServices.GetAllQuestions();
        if (!Array.isArray(response)) {
          throw new Error("API response is not an array");
        }
        setQuestions(response);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err.message);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await testServices.getTestById(id);
        if (response.success) {
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

  const togglePickQuestion = (questionId) => {
    setPickedQuestions((prev) => {
      const sectionId = selectedSection?._id;
      if (!sectionId) return prev;

      const updated = { ...prev, [sectionId]: { ...(prev[sectionId] || {}) } };
      console.log("the picked", pickedQuestions);

      if (updated[sectionId][questionId]) {
        delete updated[sectionId][questionId];
      } else {
        updated[sectionId][questionId] = true;
      }

      return updated;
    });
  };

  useEffect(() => {
    if (!selectedSection || !testDetails || questions.length === 0) {
      return;
    }

    const filtered = questions.filter((q) => {
      return (
        q?.Class?.trim() === testDetails?.class?.trim() &&
        q.Subject.trim().toLowerCase() ===
          testDetails.subject.trim().toLowerCase() &&
        (q.Type || "").trim().toLowerCase() ===
          (selectedSection.questionType || "").trim().toLowerCase()
      );
    });
    console.log("Matching Questions After Filtering:", filtered);

    console.log("Filtered Questions After Section Change:", filtered);
    setFilteredQuestions(filtered);
  }, [selectedSection, testDetails, questions]);

  const toggleSolution = (questionId) => {
    setShowSolution((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };
  const handleSubmit = async () => {
    try {
      const formattedTestId = id?.testId || id;

      // const formattedQuestions = {};
      // Object.entries(pickedQuestions).forEach(([sectionId, questions]) => {
      //   formattedQuestions[sectionId] = Object.keys(questions);
      // });

      const submissionData = {
        testId: formattedTestId,
        selectedQuestions: pickedQuestions,
      };

      console.log("Final Payload Sent:", formattedTestId);
      console.log("Final2 Payload Sent:", pickedQuestions);

      const response = await testServices.submitSelectedQuestions(
        submissionData
      );

      if (response.success) {
        navigate(`/questionReview/${formattedTestId}`);
      } else {
        console.error("Failed to submit questions.");
      }
    } catch (error) {
      console.error(" Submission Error:", error);
    }
  };

  useEffect(() => {
    const fetchFilteredQuestions = async () => {
      try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await axios.get(
          `http://localhost:8003/api/QB/getfilteredquestions?${queryParams}`
        );

        if (response) {
          setQuestions(response.data);
          console.log(response);
          setFilteredQuestions(response.data);
        } else {
          setQuestions([]);
          setFilteredQuestions([]);
        }
      } catch (error) {
        console.error("Error fetching filtered questions:", error);
        setQuestions([]);
        setFilteredQuestions([]);
      }
    };

    fetchFilteredQuestions();
  }, [filters]);

  return (
    <MathJaxContext>
      <div className="p-6 bg-gray-100 min-h-screen relative">
        {/* Section Navigation */}
        <div className="flex space-x-3 bg-white p-3 rounded-lg shadow-md">
          {testDetails?.sections.map((section, index) => (
            <button
              key={section._id}
              className={`px-5 py-2 text-lg font-semibold rounded-md transition-all ${
                selectedSection?._id === section._id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedSection(section)}
            >
              Section {index + 1} ({section.numberOfQuestions} Qs)
            </button>
          ))}
        </div>

        {/* Filter Section */}

        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Filter Questions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <FilterDropdown
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
            />
            <FilterDropdown
              name="Chapter"
              label="Chapter"
              value={filters.Chapter}
              onChange={handleFilterChange}
              options={[...new Set(questions.map((q) => q.Chapter))]}
            />
            <FilterDropdown
              name="Topic"
              label="Topic"
              value={filters.Topic}
              onChange={handleFilterChange}
              options={[...new Set(questions.map((q) => q.Topic))]}
            />
            <FilterDropdown
              name="Difficulty"
              label="Difficulty"
              value={filters.Difficulty}
              onChange={handleFilterChange}
              options={[...new Set(questions.map((q) => q.Difficulty))]}
            />
          </div>
        </div>
        {/* Question List */}
        <div className="bg-white p-5 rounded-lg shadow-md mt-5">
          {loading && <p className="text-gray-600">Loading questions...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {!loading && !error && filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => {
              const imageMatch = question.English?.match(
                /\\includegraphics\[.*?\]{(.*?)}/
              );
              const imageId = imageMatch ? imageMatch[1] : null;
              const cleanQuestion = question.English?.replace(
                /\\\\/g,
                " \\[ \n \\] "
              ) // Ensures line breaks
                .replace(/\\includegraphics\[.*?\]{.*?}/g, "")
                .trim();

              return (
                <div
                  key={question._id}
                  className="mt-4 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex">
                      <div className="w-[80%]">
                        <MathJax>{cleanQuestion}</MathJax>
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
                    <div>
                      {/* Pick Button */}
                      <button
                        className={`px-4 py-2 text-white font-semibold rounded-lg ${
                          pickedQuestions[selectedSection?._id]?.[question._id]
                            ? "bg-red-600"
                            : "bg-blue-600"
                        }`}
                        onClick={() => togglePickQuestion(question._id)}
                      >
                        {pickedQuestions[selectedSection?._id]?.[question._id]
                          ? "Remove"
                          : "Pick"}
                      </button>
                    </div>
                  </div>

                  {/* Options Section */}
                  <ul>
                    {question.OptionsEnglish?.split("\\\\")
                      .filter((option) => option.trim() !== "")
                      .map((option, index) => {
                        const correctAnswers =
                          question.Answer.split("&").map(Number);
                        const isCorrect = correctAnswers.includes(index + 1);

                        return (
                          <li
                            key={index}
                            className={`text-sm ${
                              isCorrect ? "font-bold text-green-600" : ""
                            }`}
                          >
                            <MathJax>{`\\(${option.trim()}\\)`}</MathJax>
                          </li>
                        );
                      })}
                  </ul>

                  {/* Show Solution Button */}
                  <button
                    className="mt-3 px-4 py-1 text-blue-500 font-semibold  rounded-md transition"
                    onClick={() => toggleSolution(question._id)}
                  >
                    {showSolution[question._id]
                      ? "Hide Solution"
                      : "Show Solution"}
                  </button>

                  {showSolution[question._id] && question.SolutionSteps && (
                    <MathJax>{question.SolutionSteps}</MathJax>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 mt-3">No questions found.</p>
          )}
        </div>
        <div className="fixed top-25 right-5 bg-white p-4 rounded-lg shadow-lg border">
          <p className="text-lg font-semibold">Selected Questions</p>
          <p>
            Total Picks:{" "}
            {Object.values(pickedQuestions).reduce(
              (total, section) => total + Object.keys(section).length,
              0
            )}
          </p>

          {testDetails?.sections.map((section, index) => (
            <p key={section._id}>
              Section {index + 1}:{" "}
              {Object.keys(pickedQuestions[section._id] || {}).length} /{" "}
              {section.numberOfQuestions}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <button
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700"
          onClick={handleSubmit}
        >
          Submit & Go to Review
        </button>
      </div>
    </MathJaxContext>
  );
};

export default QuestionsPage;
