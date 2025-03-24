import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import testServices from "../../services/testService";
import apiServices from "../../services/apiServices";

const QuestionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [formData, setFormData] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [savedSections, setSavedSections] = useState([]);

  useEffect(() => {
    fetchTestDetails();
    fetchSubjects();
    fetchQuestionType();
  }, []);

  const fetchTestDetails = async () => {
    try {
      const response = await testServices.getTestById(id);
      if (response.success) {
        setSections(response.data.sections || []);
        initializeFormData(response.data.sections);
      } else {
        toast.error("Failed to fetch test details.");
      }
    } catch (error) {
      toast.error("Error fetching test details.");
      console.error("API Error:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await apiServices.fetchSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error("Failed to fetch subjects.");
    }
  };

  const fetchQuestionType = async () => {
    try {
      const data = await apiServices.fetchQuestionType();
      setQuestionTypes(data);
    } catch (error) {
      toast.error("Failed to fetch question types.");
    }
  };

  const initializeFormData = (sections) => {
    const initialData = {};
    const initialSubjects = {};

    sections.forEach((section) => {
      initialData[section._id] = {
        sectionId: section._id,
        questionType: "MCQ",
        marks: "",
        correctAnswer: "",
        negativeMarking: "",
        numQuestions: "",
        selectionType: "Auto",
      };
      initialSubjects[section._id] = "";
    });

    setFormData(initialData);
    setSelectedSubjects(initialSubjects);
  };

  const handleChange = (e, sectionId) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [name]: value,
      },
    }));
    setSelectedSubjects((prev) => ({
      ...prev,
      [sectionId]: value,
    }));
  };

  // Function to save the current section
  const handleSaveSection = (sectionId, index) => {
    const sectionData = {
      ...formData[sectionId],
      sectionIndex: index + 1,
      subject: pendingSubjectChanges[sectionId] || selectedSubjects[sectionId],
      sectionName:
        sections.find((s) => s._id === sectionId)?.sectionName ||
        "Unknown Section",
    };

    setSelectedSubjects((prev) => ({
      ...prev,
      [sectionId]: pendingSubjectChanges[sectionId],
    }));

    setSavedSections((prev) => {
      const updatedSections = prev.filter(
        (item) => item.sectionId !== sectionId
      );
      return [...updatedSections, sectionData];
    });

    toast.success("Section saved successfully!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const allSectionsData = Object.keys(formData).map((sectionId) => ({
        ...formData[sectionId],
        subject: selectedSubjects[sectionId],
      }));

      const payload = { sections: allSectionsData };

      await testServices.addQuestionsToSection(id, payload);
      toast.success("Questions added successfully!");
      navigate(`/define-syllabus/:${"physics"}`);
    } catch (error) {
      toast.error("Error submitting questions.");
      console.error("Submission Error:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-100 min-h-screen flex flex-col md:flex-row gap-6">
      {/* Left Section - Form */}
      <div className="w-full md:w-2/3">
        <h2 className="text-2xl font-bold text-indigo-700 text-center mb-4">
          Question Configuration
        </h2>

        {/* Tabs for Sections */}
        <div className="flex justify-center gap-4 border-b pb-2">
          {sections.map((section, index) => (
            <button
              key={index}
              className={`px-4 py-2 text-md font-semibold rounded-md transition-all ${
                activeTab === index
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {`Section ${index + 1}`}
            </button>
          ))}
        </div>

        {/* Question Form */}
        {sections.length > 0 && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white shadow-lg p-6 rounded-lg"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              {sections[activeTab]?.sectionName}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Subject",
                  name: "subject",
                  type: "select",
                  options: subjects.map((s) => s.subjectName),
                },
                {
                  label: "Question Type",
                  name: "questionType",
                  type: "select",
                  options: questionTypes.map((q) => q.questionType),
                },
                { label: "Marks", name: "marks", type: "number" },
                {
                  label: "Negative Marking",
                  name: "negativeMarking",
                  type: "number",
                },
                {
                  label: "Number of Questions",
                  name: "numQuestions",
                  type: "number",
                },
                {
                  label: "Selection Type",
                  name: "selectionType",
                  type: "select",
                  options: ["Auto", "Manual"],
                },
              ].map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={
                        formData[sections[activeTab]._id]?.[field.name] || ""
                      }
                      onChange={(e) => handleChange(e, sections[activeTab]._id)}
                      className="w-full p-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-400"
                    >
                      {field.options.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={
                        formData[sections[activeTab]._id]?.[field.name] || ""
                      }
                      onChange={(e) => handleChange(e, sections[activeTab]._id)}
                      className="w-full p-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-400"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => handleSaveSection(sections[activeTab]._id)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Save Section
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Submit
              </button>
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow-lg">
        <p className="text-lg font-semibold text-gray-800 mb-3">
          Saved Sections
        </p>
        {savedSections.length > 0 ? (
          savedSections.map((section, index) => (
            <div
              key={section.sectionId}
              className="p-4 bg-gray-200 rounded-lg mb-4"
            >
              <p className="font-bold text-md">{`Section: ${index + 1} `}</p>

              <div className="flex gap-4">
                <p className="text-sm">
                  Subject: {selectedSubjects[section.sectionId]}
                </p>
                <p className="text-sm">Marks: {section.marks}</p>
              </div>

              <div className="flex gap-6">
                <p className="text-sm">Question Type: {section.questionType}</p>
                <p className="text-sm">
                  Numer of Questions: {section.numQuestions}
                </p>
              </div>

              <p className="text-sm">Selection Type: {section.selectionType}</p>
              <button
                onClick={() => handleDeleteSection(section.sectionId)}
                className="mt-2 text-red-600"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No sections saved yet.</p>
        )}
      </div>
    </div>
  );
};

export default QuestionForm;
