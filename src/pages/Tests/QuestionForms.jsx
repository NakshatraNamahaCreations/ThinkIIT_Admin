import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiServices from "../../services/apiServices";
import { FaEdit, FaTrash } from "react-icons/fa"; // Import icons
import { useNavigate, useParams } from "react-router-dom";
import testServices from "../../services/testService";

const QuestionForms = () => {
  const [questionTypes, setQuestionTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    sectionName: "",
    subject: "",
    subjectId: "",
    questionType: "",
    minQuestionsAnswerable: "",
    marks: "",
    negativeMarking: "",
    numQuestions: "",
  });

  const [editIndex, setEditIndex] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [savedSections, setSavedSections] = useState(() => {
    const storedSections = sessionStorage.getItem("savedSections");
    return storedSections ? JSON.parse(storedSections) : [];
  });

  useEffect(() => {
    if (!id) return;
    fetchTestDataById(id);
  }, [id]);

  const fetchTestDataById = async (id) => {
    try {
      const data = await testServices.getTestById(id);

      if (data) {
        setSavedSections(data.data.sections);

        sessionStorage.setItem(
          "savedSections",
          JSON.stringify(data.data.sections)
        );
      } else {
        setSavedSections([]);
      }
    } catch (error) {
      toast.error("Failed to fetch test details.");
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchQuestionType();

    const storedSections = sessionStorage.getItem("savedSections");
    if (storedSections) {
      setSavedSections(JSON.parse(storedSections));
    }
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "subject") {
      console.log(subjects);

      const selectedSubject = subjects.find(
        (item) => item.subjectName === value
      );

      setFormData((prev) => ({
        ...prev,
        subject: value,
        subjectId: selectedSubject ? selectedSubject._id : "", // Ensure ID is stored
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = () => {
    if (savedSections?.length > 0) {
      // Check if savedSections exists and has at least one section
      navigate(`/define-syllabus/${id}`);
    } else {
      toast.error("Please create at least one section before proceeding.");
    }
  };

  const handleSaveSection = async () => {
    if (
      !formData.marks ||
      !formData.numQuestions ||
      !formData.subject ||
      !formData.negativeMarking
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      subject: formData.subject,
      subjectId: formData.subjectId,
      questionType: formData.questionType,
      numberOfQuestions: parseInt(formData.numQuestions, 10),
      marksPerQuestion: parseInt(formData.marks, 10),
      minQuestionsAnswerable: parseInt(formData.minQuestionsAnswerable, 10),
      negativeMarksPerWrongAnswer: parseFloat(formData.negativeMarking),
    };

    let updatedSections = Array.isArray(savedSections)
      ? [...savedSections]
      : [];

    try {
      if (editIndex !== null) {
        // Editing an existing section
        const sectionId = savedSections[editIndex]._id;

        await testServices.editSection(id, sectionId, payload);

        updatedSections[editIndex] = { ...formData, _id: sectionId };
        setSavedSections(updatedSections);
        setEditIndex(null);
        toast.success("Section updated successfully!");
      } else {
        // Adding a new section
        const newSection = await testServices.addSectionDetail(id, payload);
        updatedSections.push({ ...formData, _id: newSection._id });
        toast.success("Section saved successfully!");
      }

      // Update state
      setSavedSections(updatedSections);

      // Store updated sections in **sessionStorage**
      sessionStorage.setItem("savedSections", JSON.stringify(updatedSections));

      // Reset form
      setFormData({
        sectionName: "",
        subject: "",
        questionType: "",
        marks: "",
        negativeMarking: "",
        minQuestionsAnswerable: "",
        numQuestions: "",
      });
    } catch (error) {
      toast.error("Error saving section.");
      console.error("Save Error:", error);
    }
  };

  const handleEditSection = (index) => {
    const selectedSection = savedSections[index];

    if (!selectedSection) {
      console.error("Section not found at index:", index);
      return;
    }

    setFormData({
      sectionName: selectedSection.sectionName || "",
      subject: selectedSection.subject || "",
      questionType: selectedSection.questionType || "MCQ",
      numQuestions: selectedSection.numberOfQuestions
        ? selectedSection.numberOfQuestions.toString()
        : "",
      marks: selectedSection.marksPerQuestion
        ? selectedSection.marksPerQuestion.toString()
        : "",
      negativeMarking: selectedSection.negativeMarksPerWrongAnswer
        ? selectedSection.negativeMarksPerWrongAnswer.toString()
        : "",
      selectionType: "Auto",
    });

    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    const sectionId = savedSections[index]._id;

    await testServices.deleteSection(id, sectionId);
    const newItem = savedSections.filter((_, i) => i !== index);
    setSavedSections(newItem);
  };
  return (
    <div className=" mx-auto p-8 bg-gray-100 min-h-screen flex flex-col md:flex-row gap-6">
      {/* Left Section - Single Form */}
      <div className="w-full md:w-2/3">
        <div className="mb-6 bg-white shadow-lg p-6 rounded-lg">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">
            Enter Section Details
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select Subject</option>
                {subjects.map((item) => (
                  <option key={item._id} value={item.subjectName}>
                    {item.subjectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium">Question Type</label>
              <select
                name="questionType"
                value={formData.questionType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select type</option>
                {questionTypes.map((item) => (
                  <option key={item.id} value={item.questionType}>
                    {item.questionType}
                  </option>
                ))}
              </select>
            </div>

            {/* Marks */}
            <div>
              <label className="block text-sm font-medium">
                Marks Per Question
              </label>
              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            {/* Minimum answarable */}
            <div>
              <label className="block text-sm font-medium">
                Minimum AnswearableQuestions
              </label>
              <input
                type="number"
                name="minQuestionsAnswerable"
                value={formData.minQuestionsAnswerable}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Negative Marking */}
            <div>
              <label className="block text-sm font-medium">
                Negative Marking
              </label>
              <input
                type="number"
                name="negativeMarking"
                value={formData.negativeMarking}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium">
                Number of Questions
              </label>
              <input
                type="number"
                name="numQuestions"
                value={formData.numQuestions}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSection}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Save Section
            </button>
            <button
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Saved Sections */}
      <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow-lg">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Saved Sections
        </h4>

        {savedSections?.length > 0 ? (
          savedSections?.map((section, index) => (
            <div
              key={index}
              className="p-4 bg-gray-200 rounded-lg mb-4 relative"
            >
              <div className="absolute top-2 right-2 flex space-x-2">
                <FaEdit
                  className="text-blue-600 cursor-pointer"
                  onClick={() => handleEditSection(index)}
                />
                <FaTrash
                  className="text-red-600 cursor-pointer"
                  onClick={() => handleDelete(index)}
                />
              </div>
              <p className="text-sm">Section Name: {section.subject}</p>
              {/* <p>Subject: {section.subject}</p> */}
              <p className="text-sm">Question Type: {section.questionType}</p>
              {/* <p>Marks: {section.marks}</p> */}
              {/* <p>Negative Marking: {section.negativeMarking}</p> */}
              <p className="text-sm">
                Number of Questions: {section.numberOfQuestions}
              </p>
              {/* <p>Selection Type: {section.selectionType}</p> */}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No sections saved yet.</p>
        )}
      </div>
    </div>
  );
};

export default QuestionForms;
