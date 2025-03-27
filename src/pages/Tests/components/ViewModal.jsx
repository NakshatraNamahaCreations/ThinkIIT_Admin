import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Tabs, Tab, CircularProgress, FormControlLabel, Switch, Button } from '@mui/material';
import testServices from "../../../services/testService";
import jsPDF from "jspdf";

const ViewModal = ({ open, onClose, testId }) => {
  const [testDetails, setTestDetails] = useState(null);
  const [sections, setSections] = useState([]);
  const [questionsBySection, setQuestionsBySection] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (testId && open) {
      fetchTestDetails(testId);
    }
  }, [testId, open]);

  const fetchTestDetails = async (testId) => {
    setLoading(true);
    try {
      const response = await testServices.getTestById(testId);

      if (response.success && response.data) {
        setTestDetails(response.data);
        setSections(response.data.sections);

        const questionsData = {};

        await Promise.all(response.data.sections.map(async (section) => {
          if (section.questionBankQuestionId.length > 0) {
            const res = await testServices.GetQuestionByQid(null, { questionIds: section.questionBankQuestionId });
            questionsData[section._id] = res.questions;
          } else {
            questionsData[section._id] = [];
          }
        }));

        setQuestionsBySection(questionsData);
        setSelectedSectionId(response.data.sections[0]?._id);
      }
    } catch (error) {
      console.error("Error fetching test details", error);
    }
    setLoading(false);
  };

  const handleTabChange = (event, newSectionId) => {
    setSelectedSectionId(newSectionId);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(testDetails?.testName || "Question Paper", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 20;

    sections.forEach((section) => {
      const sectionQuestions = questionsBySection[section._id];
      if (sectionQuestions.length > 0) {
        doc.setFontSize(14);
        doc.text(section.subject, 10, yPos);
        yPos += 10;

        sectionQuestions.forEach((q, idx) => {
          const questionText = doc.splitTextToSize(
            `${idx + 1}. ${q.English.replace(/\\/g, '')}`,
            pageWidth - 20
          );
          doc.setFontSize(12);
          doc.text(questionText, 10, yPos);
          yPos += questionText.length * 7;

          q.OptionsEnglish.split(/\\\\/)
            .filter((opt) => opt)
            .forEach((opt, i) => {
              const optionText = doc.splitTextToSize(
                `(${i + 1}) ${opt.replace(/[\(\)]/g, '').trim()}`,
                pageWidth - 30
              );
              doc.text(optionText, 15, yPos);
              yPos += optionText.length * 7;
            });

          yPos += 5;

          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
        });

        yPos += 10;
      }
    });

    doc.save(`${testDetails?.testName || "Question_Paper"}.pdf`);
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;
  
    const centerText = (text, y) => {
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, y);
    };
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    centerText(testDetails?.testName || "Question Paper", yPos);
    yPos += 10;
  
    doc.setFontSize(12);
    centerText(`Date: ${new Date().toLocaleDateString()}`, yPos);
    yPos += 20;
  
    sections.forEach((section) => {
      const sectionQuestions = questionsBySection[section._id];
      if (sectionQuestions.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(section.subject, 10, yPos);
        yPos += 10;
  
        sectionQuestions.forEach((q, idx) => {
          const questionText = doc.splitTextToSize(
            `${idx + 1}. ${q.English.replace(/\\/g, '')}`,
            pageWidth - 20
          );
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          doc.text(questionText, 10, yPos);
          yPos += questionText.length * 7;
  
          q.OptionsEnglish.split(/\\\\/)
            .filter((opt) => opt)
            .forEach((opt, i) => {
              const optionText = doc.splitTextToSize(
                `(${i + 1}) ${opt.replace(/[\(\)]/g, '').trim()}`,
                pageWidth - 30
              );
              doc.text(optionText, 15, yPos);
              yPos += optionText.length * 7;
            });
  
          yPos += 5;
  
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
        });
  
        yPos += 10;
      }
    });
  
    // Trigger print and open PDF in new tab
    doc.autoPrint();
    const pdfBlob = doc.output("bloburl");
    window.open(pdfBlob, "_blank");
  };
  

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="view-modal-title">
      <Box sx={{ width: 700, maxHeight: '90vh', overflowY: 'auto', margin: "auto", padding: 3, bgcolor: "white", boxShadow: 24 }}>
        <Typography variant="h6" component="h2" id="view-modal-title" gutterBottom>
          Test Details
        </Typography>

        <FormControlLabel
          control={<Switch checked={isOnline} onChange={() => setIsOnline(!isOnline)} />}
          label={isOnline ? "Online" : "Offline"}
          sx={{ mb: 2 }}
        />

        {sections.length > 0 && (
          <Tabs
            value={selectedSectionId}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ marginBottom: 2 }}
          >
            {sections.map((section) => (
              <Tab key={section._id} label={section.subject} value={section._id} />
            ))}
          </Tabs>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {(questionsBySection[selectedSectionId] || []).map((q, idx) => (
              <Box key={q._id} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Q{idx + 1}:</strong> {q.English.replace(/\\/g, '')}
                </Typography>

                <Box component="ul" sx={{ pl: 3 }}>
                  {q.OptionsEnglish.split(/\\\\/).filter(opt => opt).map((option, i) => (
                    <Typography component="li" key={i}>{option.replace(/[\(\)]/g, '').trim()}</Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {!isOnline && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleDownload}>Download</Button>
            <Button variant="outlined" onClick={handlePrint}>Print</Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default ViewModal;