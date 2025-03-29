import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import apiServices from "../../services/apiServices";
import testServices from "../../services/testService";

const DefineSyllabus = () => {
  const { id } = useParams();
  const [savedSections, setSavedSections] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [chapters, setChapters] = useState({});
  const [selectedTopics, setSelectedTopics] = useState({});
  const [isAllSectionsComplete, setIsAllSectionsComplete] = useState(false);
  const [questionSelectionType, setQuestionSelectionType] = useState("");
  const navigate = useNavigate();
  const [hasUserModifiedTopics, setHasUserModifiedTopics] = useState(false);


  useEffect(() => {
    if (id) {
      fetchTestDataById(id);
   
    }

  }, [id]);
  useEffect(() =>{
    fetchTestSectionById(id);
  },[])
  useEffect(() => {
    const allSectionsComplete = savedSections.every((section) => {
      const sectionTopics = selectedTopics[section._id];
      return (
        sectionTopics &&
        Object.values(sectionTopics).some((topics) => topics.length > 0)
      );
    });

    setIsAllSectionsComplete(allSectionsComplete);
  }, [selectedTopics, savedSections]);

  const fetchTestSectionById = async (testId) => {
    try {
      const response = await testServices.getSelectedTopics(testId);
      if (response.success) {
        setSavedSections(response.sections);
  
        const preSelectedTopics = {};
  
        response.sections.forEach((section) => {
          if (section.topic && section.topic.length > 0) {
            const groupedByChapter = {};
  
            section.topic.forEach((topic) => {
              const chapterId = topic.chapterId;
              if (!groupedByChapter[chapterId]) {
                groupedByChapter[chapterId] = [];
              }
              groupedByChapter[chapterId].push({
                topicName: topic.topicName,
                numberOfQuestions: topic.numberOfQuestions,
                chapterId: topic.chapterId,
              });
            });
  
            preSelectedTopics[section._id] = groupedByChapter;
          }
        });
  
        setSelectedTopics(preSelectedTopics);
        sessionStorage.setItem("selectedTopics", JSON.stringify(preSelectedTopics));
      } else {
        toast.error("Failed to fetch test sections");
      }
    } catch (error) {
      console.error("Error fetching test sections:", error);
      toast.error("Something went wrong while fetching sections");
    }
  };
  
  

  const fetchTestDataById = async (id) => {
    try {
      const data = await testServices.getTestById(id);
      if (data?.data?.sections) {
        const updatedSections = await Promise.all(
          data.data.sections.map(async (section) => {
            const subID = section.subjectId;
            if (!subID) {
              console.error(
                `No subject ID found for section: ${section.subject}`
              );
              return section;
            }

            const chapterData = await apiServices.fetchChapter(subID);

            const allTopics = await Promise.all(
              chapterData.map(async (chapter) => {
                const topics = await fetchTopics(chapter._id);
                return { chapterId: chapter._id, topics };
              })
            );

            const formattedChapters = chapterData.map((chapter) => {
              const matchedTopics =
                allTopics.find((t) => t.chapterId === chapter._id)?.topics ||
                [];
              return {
                _id: chapter._id,
                chapterName: chapter.chapterName,
                topics: matchedTopics,
              };
            });

            return { ...section, chapters: formattedChapters };
          })
        );

        setSavedSections(updatedSections);
        setActiveSection(updatedSections[0]?._id || "");
      } else {
        setSavedSections([]);
        toast.error("No sections found.");
      }
    } catch (error) {
      toast.error("Failed to fetch test details.");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (activeSection) {
      fetchChapters(activeSection);
    }
  }, [activeSection]);

  const fetchChapters = async (sectionId) => {
    try {
      const selectedSection = savedSections.find((i) => i._id === sectionId);
      const subID = selectedSection.subjectId;
      if (!subID) {
        toast.error("No subject ID found in session storage.");
        return;
      }

      const chapterData = await apiServices.fetchChapter(subID);

      if (!chapterData || chapterData.length === 0) {
        toast.error("No chapters found for this section.");
        return;
      }

      const formattedChapters = await Promise.all(
        chapterData.map(async (chapter) => {
          const topicData = await fetchTopics(chapter._id);

          return {
            _id: chapter._id,
            chapterName: chapter.chapterName,
            topics: topicData || [],
          };
        })
      );

      setChapters((prev) => ({ ...prev, [sectionId]: formattedChapters }));
    } catch (error) {
      toast.error("Error fetching chapters.");
    }
  };

  const fetchTopics = async (chapterId) => {
    try {
      const topicData = await apiServices.fetchTopic(chapterId);

      return topicData.map((topic) => ({
        topicName: topic.topicName,
        numberOfQuestions: 0,
        chapterId: chapterId,
      }));
    } catch (error) {
      console.error("Error fetching topics:", error);
      return [];
    }
  };

  const toggleTopic = async (chapterId, topic) => {
    const isAlreadySelected = selectedTopics[activeSection]?.[chapterId]?.some(
      (t) => t.topicName === topic.topicName
    );
  
    setSelectedTopics((prev) => {
      const updatedChapterTopics = isAlreadySelected
        ? prev[activeSection][chapterId].filter(
            (t) => t.topicName !== topic.topicName
          )
        : [...(prev[activeSection]?.[chapterId] || []), topic];
  
      const updatedSection = {
        ...prev[activeSection],
        [chapterId]: updatedChapterTopics,
      };
  
      const updated = {
        ...prev,
        [activeSection]: updatedSection,
      };
  setHasUserModifiedTopics(true);
      sessionStorage.setItem("selectedTopics", JSON.stringify(updated));
      return updated;
    });
  
    if (isAlreadySelected) {
      const sectionId = activeSection;
      const testId = id;
  
      await testServices.removeTopic(testId, sectionId, {
        topicName: topic.topicName,
        chapterId: topic.chapterId,
      });
    }
  };
  

  const selectAllTopics = (chapterId, topics) => {
    setSelectedTopics((prev) => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        [chapterId]:
          prev[activeSection]?.[chapterId]?.length === topics.length
            ? []
            : topics,
      },
    }));
  };

  const handleSubmit = async (selectionType) => {
    setQuestionSelectionType(selectionType);
  
    const allSectionsWithTopics = Object.entries(selectedTopics).filter(
      ([sectionId, chapters]) =>
        Object.values(chapters).some((topics) => topics.length > 0)
    );
  
    if (allSectionsWithTopics.length !== savedSections.length) {
      toast.error("Please select at least one topic in every section.");
      return;
    }
  
    try {
      for (const [sectionId, chapters] of allSectionsWithTopics) {
        const sectionDetails = savedSections.find((sec) => sec._id === sectionId);
        if (!sectionDetails) continue;
  
        const selectedChapters = Object.keys(chapters)
          .map((chapterId) => {
            const chapterDetails = sectionDetails.chapters.find((chap) => chap._id === chapterId);
            return chapterDetails
              ? {
                  _id: chapterDetails._id,
                  chapterId: chapterDetails.chapterId,
                  chapterName: chapterDetails.chapterName,
                }
              : null;
          })
          .filter(Boolean);
  
        const formattedTopics = Object.entries(chapters).flatMap(([chapterId, topics]) =>
          topics.map((topic) => ({
            topicName: topic.topicName,
            numberOfQuestions: topic.numberOfQuestions || 0,
            chapterId: chapterId,
          }))
        );
  
        sessionStorage.setItem("selectionType", JSON.stringify(selectionType));

        // if (selectionType === "Auto") {
        //   const autoPickResponse = await testServices.AutoPickQuestions(id, {
        //     sectionId,
        //     topics: formattedTopics,
        //     totalQuestions: 4,
        //   });
  
        //   if (!autoPickResponse.success) {
        //     toast.error(`Auto picking failed for section: ${sectionDetails.subject}`);
        //     return;
        //   }
  
        //   const autoPicked = autoPickResponse.data;
  
        //   const existing = JSON.parse(sessionStorage.getItem("AutoPickedQuestions") || "{}");
        //   const updated = { ...existing };
        //   if (!updated[sectionId]) updated[sectionId] = {};
  
        //   Object.entries(autoPicked).forEach(([topicName, questionMap]) => {
        //     updated[sectionId][topicName] = {
        //       ...(updated[sectionId][topicName] || {}),
        //       ...questionMap,
        //     };
        //   });
  
        //   sessionStorage.setItem("AutoPickedQuestions", JSON.stringify(updated));
        // }
  
        const formData = {
          testId: id,
          sectionId,
          sectionName: sectionDetails.subject,
          chapter: selectedChapters,
          topics: formattedTopics,
          questionSelection: selectionType,
        };
 
        const res = await testServices.defineChapterAndTopics(id, sectionId, formData);
        if (!res.success) {
          toast.error(`Failed to save syllabus for ${sectionDetails.subject}`);
          return;
        }
      }
  
      toast.success("Syllabus saved successfully!");
      navigate(`/question-selection/${id}`, { state: { selectedTopics, selectionType } });
    } catch (error) {
      toast.error("Error saving syllabus.");
      console.error("Submission Error:", error);
    }
  };
  

  return (
    <div className=" mx-auto p-6 bg-gray-100 min-h-screen">
      <h4 className="text-lg font-bold text-indigo-700 mb-3">Select Topics</h4>

      {/* Section Tabs from API */}
      <div className="flex  gap-4 mb-5">
        {savedSections.map((section) => (
          <button
            key={section._id}
            onClick={() => setActiveSection(section._id)}
            className={`px-4 py-1 font-semibold rounded-md transition-all text-sm ${
              activeSection === section._id
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {section.subject}
          </button>
        ))}
      </div>

      {/* Chapters & Topics for Active Section */}

      {chapters[activeSection]?.map((chapter) => (
        <div
          key={chapter._id}
          className="mb-6 bg-white p-4 rounded-lg shadow-md"
        >
          <h6 className="text-lg font-semibold text-gray-800 mb-3">
            {chapter.chapterName}
          </h6>
          <div className="flex flex-wrap gap-2">
            {chapter.topics.length > 0 ? (
              chapter.topics.map((topic) => (
                <button
                  key={topic.topicName}
                  onClick={() => toggleTopic(chapter._id, topic)}
                  style={{ fontSize: "12px" }}
                  className={`px-2 py-1.5 border rounded-md text-xs font-medium transition-all  ${
                    selectedTopics[activeSection]?.[chapter._id]?.some(
                      (t) => t.topicName === topic.topicName
                    )
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {topic.topicName}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-400">No topics</p>
            )}
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
  {hasUserModifiedTopics ? (
    <>
      <button
        onClick={() => handleSubmit("Manual")}
        className={`flex items-center gap-2 ${
          questionSelectionType === "Manual"
            ? "bg-indigo-700"
            : "bg-indigo-300 hover:bg-indigo-700"
        } text-white px-4 py-2 rounded-lg text-lg font-semibold shadow-md transition-all`}
      >
        Manually Pick Questions
      </button>

      <button
        onClick={() => handleSubmit("Auto")}
        className={`flex items-center gap-2 ${
          questionSelectionType === "Auto"
            ? "bg-indigo-600"
            : "bg-indigo-300 hover:bg-indigo-600"
        } text-white px-4 py-2 rounded-lg text-lg font-semibold shadow-md transition-all`}
      >
        Auto Pick Questions
      </button>
    </>
  ) : (
    <button
      onClick={() =>
        navigate(`/question-selection/${id}`, {
          state: { selectedTopics, selectionType: questionSelectionType },
        })
      }
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-lg font-semibold shadow-md hover:bg-green-700 transition-all"
    >
      Next
    </button>
  )}
</div>

    </div>
  );
};

export default DefineSyllabus;
