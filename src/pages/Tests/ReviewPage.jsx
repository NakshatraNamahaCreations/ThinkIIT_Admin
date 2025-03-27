import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { jsPDF } from "jspdf";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import testServices from "../../services/testService";
import { toast } from "react-toastify";

const ReviewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sectionQuestions, setSectionQuestions] = useState({});
  const [examMode, setExamMode] = useState("online");
  const [activeSection, setActiveSection] = useState(null);
  const printRef = useRef(null);

  const handleSubmit = async () => {
    try {
      const allSections = Object.keys(sectionQuestions);
  
      for (const sectionId of allSections) {
        const pickedTopics = sectionQuestions[sectionId].pickedTopics;
  
        const questionIds = [];
  
        Object.keys(pickedTopics).forEach((topicName) => {
          pickedTopics[topicName].forEach((question) => {
            if (question._id) {
              questionIds.push(question._id);
            }
          });
        });
  
        if (questionIds.length === 0) {
          console.warn(`No questions found for section ${sectionId}`);
          continue;
        }
    
        const payload = {
          questionBankQuestionId: questionIds,
        };
  
        const response = await testServices.addQuestionsToSection(id, sectionId, payload);
  
        if (response.success) {
          console.log(`Saved questions for section ${sectionId}`);
        } else {
          console.error(`Failed to save section ${sectionId}:`, response.message);
          toast.error(`Failed to save section ${sectionId}`);
        }
      }
  
      toast.success("All questions saved to DB successfully!");
      navigate("/TCreation");
      sessionStorage.removeItem("AutoPickedQuestions");
      sessionStorage.removeItem("pickedQuestions");
      sessionStorage.removeItem("pickedQuestions");
      sessionStorage.removeItem("questionDetails");
      sessionStorage.removeItem("selectionType");
      localStorage.removeItem("AutoPickedQuestions");
      localStorage.removeItem("pickedQuestions");
      
    } catch (error) {
      console.error("Error submitting questions:", error);
      toast.error("Something went wrong while submitting the questions.");
    }
  };

  useEffect(() => {
    const storedQuestions = sessionStorage.getItem("questionDetails");
  
    if (storedQuestions) {
      const parsedQuestions = JSON.parse(storedQuestions);
      console.log("Parsed Questions", parsedQuestions);  // Log the questions to see their structure
      setSectionQuestions(parsedQuestions);
  
      if (Object.keys(parsedQuestions).length > 0) {
        setActiveSection(Object.keys(parsedQuestions)[0]);  // Optionally set the first section as active
      }
    }
  }, []);

  const toggleExamMode = () => {
    setExamMode((prevMode) => (prevMode === "online" ? "offline" : "online"));
  };

  const printQuestionPaper = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    const centerText = (text, y) => {
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    centerText("DEMO ACCOUNT", yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    centerText("Test123", yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    centerText(`Date: ${new Date().toLocaleDateString()}`, yPosition);
    yPosition += 20;

    doc.setFont("helvetica", "bold");
    doc.text("Topics Covered:", 15, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");

    Object.keys(sectionQuestions).forEach((sectionId) => {
      Object.keys(sectionQuestions[sectionId]).forEach((topicName) => {
        doc.text(`- ${topicName}`, 20, yPosition);
        yPosition += 8;
      });
    });

    yPosition += 10;
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 10;

    let questionNumber = 1;
    Object.keys(sectionQuestions).forEach((sectionId) => {
      Object.keys(sectionQuestions[sectionId]).forEach((topicName) => {
        Object.values(sectionQuestions[sectionId][topicName]).forEach(
          (question) => {
            const splitText = doc.splitTextToSize(
              question.English,
              pageWidth - 30
            );

            doc.setFont("helvetica", "bold");
            doc.text(`${questionNumber})`, 15, yPosition);
            doc.text(splitText, 25, yPosition);

            yPosition += splitText.length * 7;

            question.OptionsEnglish?.split("\\\\").forEach((opt, idx) => {
              const wrappedOption = doc.splitTextToSize(
                `${idx + 1}) ${opt.trim()}`,
                pageWidth - 30
              );
              doc.text(wrappedOption, 30, yPosition);
              yPosition += wrappedOption.length * 7;
            });

            yPosition += 10;
            doc.line(10, yPosition, pageWidth - 10, yPosition);
            yPosition += 10;
            questionNumber++;

            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
          }
        );
      });
    });

    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };

  const downloadQuestionPaper = async () => {
    if (!activeSection) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    const centerText = (text, y) => {
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    centerText("DEMO ACCOUNT", yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    centerText("Test123", yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    centerText(`Date: ${new Date().toLocaleDateString()}`, yPosition);
    yPosition += 20;

    doc.setFont("helvetica", "bold");
    doc.text("Topics Covered:", 15, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");

    Object.keys(sectionQuestions[activeSection]).forEach((topicName) => {
      doc.text(`- ${topicName}`, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 10;
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 10;

    let questionNumber = 1;
    Object.keys(sectionQuestions[activeSection]).forEach((topicName) => {
      Object.values(sectionQuestions[activeSection][topicName]).forEach(
        (question) => {
          const splitText = doc.splitTextToSize(
            question.English,
            pageWidth - 30
          );

          doc.setFont("helvetica", "bold");
          doc.text(`${questionNumber})`, 15, yPosition);
          doc.text(splitText, 25, yPosition);

          yPosition += splitText.length * 7;

          question.OptionsEnglish?.split("\\\\").forEach((opt, idx) => {
            const wrappedOption = doc.splitTextToSize(
              `${idx + 1}) ${opt.trim()}`,
              pageWidth - 30
            );
            doc.text(wrappedOption, 30, yPosition);
            yPosition += wrappedOption.length * 7;
          });

          yPosition += 10;
          doc.line(10, yPosition, pageWidth - 10, yPosition);
          yPosition += 10;
          questionNumber++;

          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        }
      );
    });

    doc.save("Question_Paper.pdf");
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

  return (
    <MathJaxContext version={3} config={config}>
      <div className="p-5">
        <p className="text-lg font-bold text-gray-700">
          Review Picked Questions
        </p>

        {/* <div className="mt-4 flex items-center">
          <span className="text-gray-700 font-semibold mr-5">Mode:</span>
          <button
            className={`ml-3 px-4 py-2 rounded-md font-semibold transition-all ${
              examMode === "online"
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-black"
            }`}
            onClick={toggleExamMode}
          >
            Online
          </button>
          <button
            className={`ml-2 px-4 py-2 rounded-md font-semibold transition-all ${
              examMode === "offline"
                ? "bg-green-500 text-white"
                : "bg-gray-300 text-black"
            }`}
            onClick={toggleExamMode}
          >
            Offline
          </button>
        </div> */}

        <div className="mt-5">
          <div className="flex">
            {Object.keys(sectionQuestions).map((sectionId) => (
              <button
                key={sectionId}
                className={`px-5 py-2 rounded-t-md font-semibold transition-all ${
                  activeSection === sectionId
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setActiveSection(sectionId)}
              >
                Section {Object.keys(sectionQuestions).indexOf(sectionId) + 1}
              </button>
            ))}
          </div>
        </div>
        <div ref={printRef} className="mt-4">
  {activeSection && sectionQuestions[activeSection] ? (
    Object.keys(sectionQuestions[activeSection].pickedTopics).map((topicName) => {
      let questionNumber = 1; 

      return sectionQuestions[activeSection].pickedTopics[topicName].map(
        (question) => {
          return (
            <div
              key={question._id}
              className="mt-2 p-2 border rounded-md bg-white"
            >
              <p className="font-medium text-gray-800 mb-1">
               {question.English} 
              </p>

              {question.OptionsEnglish?.split("\\\\").map((opt, idx) => (
                <p key={idx} className="text-sm text-gray-600 ml-4">
                  {`${opt.trim()}`}
                </p>
              ))}
            </div>
          );
        }
      );
    })
  ) : (
    <p className="text-gray-600 mt-4">
      No questions found for this section.
    </p>
  )}
</div>




        <div className="mt-4 sticky bottom-0 bg-white p-3 shadow-md flex flex-wrap justify-center gap-4">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition w-full md:w-auto"
            onClick={() => navigate(-1)}
          >
            Back to Questions
          </button>

          {/* Show Download and Print buttons only in Offline mode
          {examMode === "offline" && activeSection && (
            <>
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition w-full md:w-auto"
                onClick={downloadQuestionPaper}
              >
                Download Question Paper
              </button>
              <button
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition w-full md:w-auto"
                onClick={printQuestionPaper}
              >
                Print Question Paper
              </button>
            </>
          )} */}

          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition w-full md:w-auto"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </MathJaxContext>
  );
};

export default ReviewPage;
