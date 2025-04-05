import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiServices from "../../../services/apiServices";
import { toast } from "react-toastify";
import testServices from "../../../services/testService";
import testPatterns from "../PreSection/Pattern.json";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const FormModal = ({ isOpen, onClose }) => {
  const [selectionType, setselectionType] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    testName: "",
    testPattern: "",
    sections: "",
    selectionType: selectionType,
  });


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "testPattern") {
      const selectedPattern = testPatterns.find((p) => p.exam === value);

      setFormData((prev) => ({
        ...prev,
        testPattern: value,
        sections: selectedPattern ? selectedPattern.sections : [],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUploadExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const sectionNames = Object.keys(jsonData[0]);
      const sections = sectionNames.map((section) => {
        const questionBankQuestionId = jsonData
          .map((row) => row[section])
          .filter((id) => id !== "");
        return {
          sectionName: section,
          questionBankQuestionId,
        };
      });

      setFormData((prev) => ({
        ...prev,
        sections,
      }));

      toast.success("Excel file processed successfully!");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadSample = () => {
    const sampleData = [
      { section1: "q1", section2: "q2", section3: "q32" },
      { section1: "q3", section2: "q43", section3: "q43" },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");

    XLSX.writeFile(workbook, "sample-format.xlsx");
  };

  const handleSubmit = async () => {
    try {
      let payload = {
        testName: formData.testName,
        testPattern: formData.testPattern,
        selectionType: formData.selectionType,
        sections: formData.sections,
      };

      if (formData.selectionType === "SELECTION") {
        const pattern = testPatterns.find((p) =>
          p.exam.toLowerCase().includes(formData.testPattern.toLowerCase())
        );

        payload.sections = pattern ? pattern.sections : [];
      } else if (formData.selectionType === "QID") {
        // Convert sections to match schema format
        payload.sections = formData.sections.map((sec) => ({
          questionBankQuestionId: sec.questionBankQuestionId,
          questionSelection: "QID",
          sectionStatus: "incomplete",
        }));
      }

      const response = await testServices.createAssignment(formData);
      
      toast.success("Test created successfully!");
      navigate(`/test-selection/${response.data._id}`);
      onClose();
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error("Error creating test.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">New Test</h2>

        {/* Test Name Input */}
        <input
          type="text"
          name="testName"
          value={formData.testName}
          onChange={handleChange}
          placeholder="Test Name"
          className="w-full border border-gray-300 px-4 py-2 rounded-md mb-3"
        />

        {/* Class Dropdown */}
        <select
          name="testPattern"
          value={formData.testPattern}
          onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded-md mb-3"
        >
          <option value="">Select Test Pattern</option>
          <option value="New">New</option>
          {testPatterns.map((item, index) => (
            <option key={index} value={item.exam}>
              {item.exam}
            </option>
          ))}
        </select>

        {/* Radio Buttons */}
        <div className="flex space-x-4 mb-3">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="selectionType"
              value="QID"
              checked={selectionType === "QID"}
              onChange={() => {
                setselectionType("QID");
                setFormData((prev) => ({ ...prev, selectionType: "QID" }));
              }}
            />

            <span className="ml-2">QID</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="selectionType"
              value="SELECTION"
              checked={selectionType === "SELECTION"}
              onChange={() => {
                setselectionType("SELECTION");
                setFormData((prev) => ({
                  ...prev,
                  selectionType: "SELECTION",
                }));
              }}
            />

            <span className="ml-2">Selection</span>
          </label>
        </div>

        {selectionType === "QID" && (
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex gap-3">
              <button
                className="px-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={handleDownloadSample}
              >
                Download Sample
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                onClick={() => document.getElementById("excelUpload").click()}
              >
                Upload Excel
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleUploadExcel}
                  id="excelUpload"
                  className="hidden"
                />
              </button>
            </div>

            {/* Uploaded file status */}
            {uploadedFileName && (
              <p className="text-sm text-green-700">
                Uploaded: {uploadedFileName}
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;