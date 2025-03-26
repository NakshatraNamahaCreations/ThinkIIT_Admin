 import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import testServices from "../../../services/testService";

const QuestionDistributionSidebar = ({
  onSelectTopic,
  pickedQuestions,
  handleSubmit,
}) => {
  const { id } = useParams();
  const [sections, setSections] = useState([]);
  //   const [pickedQuestions, setPickedQuestions] = useState({});

  useEffect(() => {
    fetchTestDataById(id);
  }, [id]);

  // useEffect(() => {
  //   const handleStorageChange = () => {
  //     const saved = localStorage.getItem("pickedQuestions");
  //     if (saved) {
  //       setPickedQuestions(JSON.parse(saved));
  //     }
  //   };

  //   window.addEventListener("storage", handleStorageChange);
  //   return () => {
  //     window.removeEventListener("storage", handleStorageChange);
  //   };
  // }, []);

  const fetchTestDataById = async (testId) => {
    try {
      const response = await testServices.getTestById(testId);
      console.log("Fetched test data:", response);

      if (response?.success && response?.data?.sections) {
        setSections(response.data.sections);
      }
    } catch (error) {
      console.error("Failed to fetch test details", error);
    }
  };

  return (
    <div className="w-1/4 h-screen bg-white p-4 rounded-lg shadow-md flex flex-col">
      <h3
        className="font-bold text-gray-800 mb-4"
        style={{ fontSize: "1.2rem" }}
      >
        Question Distribution
      </h3>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        {sections.map((section) => (
          <div key={section._id} className="mb-4">
            <p className="text-md font-semibold text-gray-700">
              {section.subject}
              {console.log(section)
              }
            </p>

            {section.chapter.length > 0 ? (
              section.chapter.map((chapter) => {
                const relatedTopics =
                  section.topic?.filter(
                    (topic) =>
                      topic.chapterId === chapter._id ||
                      topic.chapterId === chapter.chapterId
                  ) || [];

                return (
                  <div key={chapter._id} className="ml-2 mt-2">
                    <p className="text-sm font-semibold text-gray-600">
                      {chapter.chapterName}
                    </p>
                    {relatedTopics.length > 0 ? (
                      relatedTopics.map((topic) => {
                        const topicName = topic.topicName.trim();
                        const sectionId = section._id;
                        
                        const pickedTopicMap = Object.keys(pickedQuestions?.[sectionId] || {}).find(
                          (key) => key.trim() === topicName.trim()
                        );
                        
                        const pickedCount = pickedTopicMap
                          ? Object.keys(pickedQuestions[sectionId][pickedTopicMap]).length
                          : 0;
                        
                        return (
                          <div
                            key={topic._id}
                            className={`ml-4 flex justify-between text-sm border-l pl-3 cursor-pointer ${
                              pickedCount > 0
                                ? "text-green-600 font-semibold"
                                : "text-gray-500 hover:text-indigo-600"
                            }`}
                            onClick={() => onSelectTopic(section, topic)}
                          >
                            <span style={{ fontSize: "1rem" }}>
                              {topicName.slice(0,15)}
                            </span>
                            <span>
                              {console.log("the final topic",topic)
                              }
                              {pickedCount} / {topic.numberOfQuestions}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-400 ml-4">No topics</p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 ml-3">No chapters</p>
            )}
          </div>
        ))}
      </div>

      {/* Fixed Footer Button */}
      <div className="mt-4 sticky bottom-0 bg-white">
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Review
        </button>
      </div>
    </div>
  );
};

export default QuestionDistributionSidebar;
