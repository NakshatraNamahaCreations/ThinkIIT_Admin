import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import testServices from "../../services/testService";

const QuestionNumber = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const { selectedTopic, questionType } = state || {};
  const [savedSections, setSavedSections] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [selectedTopics, setSelectedTopics] = useState({});
  const [sectionTotals, setSectionTotals] = useState({});
  const [totalQuestions, setTotalQuestions] = useState(0);

  const selectionType = JSON.parse(sessionStorage.getItem("selectionType"));

  useEffect(() => {
    fetchTestDataById(id);
  }, [id]);

  const fetchTestDataById = async (id) => {
    try {
      const data = await testServices.getTestById(id);
      if (data?.data?.sections) {
        setSavedSections(data.data.sections);
        setActiveSection(data.data.sections[0]?._id || "");
      } else {
        setSavedSections([]);
        toast.error("No sections found.");
      }
    } catch (error) {
      toast.error("Failed to fetch test details.");
    }
  };

  const handleQuestionChange = (sectionId, topicName, value, chapterId) => {
    const num = parseInt(value, 10) || 0;
    const section = savedSections.find((sec) => sec._id === sectionId);
    const maxQuestions = section?.numberOfQuestions || 0;

    const updatedSection = {
      ...selectedTopics[sectionId],
      [topicName]: {
        topicName,
        numberOfQuestions: num,
        chapterId,
      },
    };

    const total = Object.values(updatedSection).reduce(
      (sum, topic) => sum + topic.numberOfQuestions,
      0
    );

    if (total > maxQuestions) {
      toast.error(
        `You can only assign ${maxQuestions} questions in ${section.subject}.`
      );
      return;
    }

    setSelectedTopics((prev) => ({
      ...prev,
      [sectionId]: updatedSection,
    }));

    setSectionTotals((prev) => ({
      ...prev,
      [sectionId]: total,
    }));
  };

  const isValid = savedSections.every(
    (section) => sectionTotals[section._id] === section.numberOfQuestions
  );

  const handleNext = async () => {
    if (!isValid) {
      toast.error(
        "Please assign the exact number of questions for each section."
      );
      return;
    }

    try {
      for (const section of savedSections) {
        const sectionId = section._id;
        if (!selectedTopics[sectionId]) continue;

        const formattedTopics = Object.values(selectedTopics[sectionId]);

        const formattedTopic = Object.entries(selectedTopics[sectionId]).map(
          ([topicName, topicData]) => ({
            topicName,
            numberOfQuestions: topicData.numberOfQuestions || 0,
            chapterId: topicData.chapterId,
          })
        );
        console.log("the format",formattedTopics);

        // If AutoPick is selected, trigger Auto Pick API
        if (selectionType === "Auto") {
          console.log("Auto Pick Payload", {
            sectionId,
            topics: formattedTopic,
            totalQuestions: sectionTotals[sectionId],
          });
          const autoPickResponse = await testServices.AutoPickQuestions(id, {
            sectionId,
            topics: formattedTopic,
            totalQuestions: sectionTotals[sectionId], 
          });

          if (!autoPickResponse.success) {
            toast.error(`Auto picking failed for section: ${section.subject}`);
            return;
          }

          const autoPicked = autoPickResponse.data;

          const existing = JSON.parse(
            sessionStorage.getItem("AutoPickedQuestions") || "{}"
          );
          const updated = { ...existing };

          if (!updated[sectionId]) updated[sectionId] = {};

          Object.entries(autoPicked).forEach(([topicName, questionMap]) => {
            updated[sectionId][topicName] = {
              ...(updated[sectionId][topicName] || {}),
              ...questionMap,
            };
          });

          sessionStorage.setItem("AutoPickedQuestions", JSON.stringify(updated));
        }
        const formData = {
          testId: id,
          sectionId,
          sectionName: section.subject,
          chapter: section.chapter,
          topics: formattedTopics,
          questionSelection: "Manual",
        };

        const res = await testServices.defineChapterAndTopics(
          id,
          sectionId,
          formData
        );

        if (!res.success) {
          toast.error(`Failed to save topics for ${section.subject}`);
          return;
        }
      }

      toast.success("Topics updated successfully!");
      navigate(`/questionPage/${id}`, { state: { selectedTopics } });
    } catch (error) {
      toast.error("Error updating topics.");
      console.error("API Error:", error);
    }
  };

  return (
    <div className="p-4 mx-auto bg-white rounded-lg shadow-md ">
      <h5 className="text-2xl font-bold text-blue-700 mb-2">
        How many questions for each topic?
      </h5>
      <p className="text-sm text-gray-600 mb-4">
        Assign exactly the required number of questions per section.
      </p>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b mb-4">
        {savedSections.map((section) => (
          <button
            key={section._id}
            onClick={() => setActiveSection(section._id)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-all ${
              activeSection === section._id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {section.subject}
          </button>
        ))}
      </div>

      {/* Topics of Active Section */}
      {activeSection && (
        <div className="mb-6">
          {savedSections
            .filter((section) => section._id === activeSection)
            .map((section) => (
              <div key={section._id}>
                <div className="flex justify-between items-center mb-2">
                  <h6 className="text-md font-semibold text-gray-800">
                    {section.subject}
                  </h6>
                  <span className="text-sm text-gray-500">
                    Total: {sectionTotals[section._id] || 0} /{" "}
                    {section.numberOfQuestions}
                  </span>
                </div>

                {section?.topic?.map((topic, topicIndex) => (
                  <div
                    key={topicIndex}
                    className="flex justify-between items-center border p-3 mt-2 rounded-md"
                  >
                    <span>{topic.topicName}</span>
                    <input
                      type="number"
                      min="0"
                      className="w-20 text-center border border-gray-300 px-2 py-1 rounded-md"
                      value={
                        selectedTopics[section._id]?.[topic.topicName]
                          ?.numberOfQuestions || ""
                      }
                      onChange={(e) =>
                        handleQuestionChange(
                          section._id,
                          topic.topicName,
                          e.target.value,
                          topic.chapterId
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold shadow-md hover:bg-blue-700 transition disabled:opacity-50"
          disabled={!isValid}
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default QuestionNumber;
