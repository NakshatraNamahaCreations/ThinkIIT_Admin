import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiServices from "../../../services/apiServices";
import { toast } from "react-toastify";
import testServices from "../../../services/testService";
import testPatterns from "../PreSection/Pattern.json";

const FormModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    testName: "",
    testPattern: "",
  });
  const [selectedOption, setSelectedOption] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClass();
  }, []);

  const fetchClass = async () => {
    try {
      const data = await apiServices.fetchClasses();
      setClasData(data);
    } catch (error) {
      toast.error("Failed to fetch classes.");
    }
  };

  const handleUploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await testServices.uploadExcelFile(id, formData);
      if (res.success) {
        toast.success("File uploaded and QIDs processed successfully!");
        setShowModal(false);
      } else {
        toast.error("Upload failed on server.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Something went wrong during upload.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //   const handleSubmit = async () => {
  //     try {
  //       await testServices.createAssignment({
  //         testName: formData.testName,
  //         className: formData.className,
  //       });

  //       localStorage.setItem("sectionCount", 2);
  //       navigate(`/test-Creation`);
  //     } catch (error) {
  //       toast.error("An error occurred while submitting the assignment.");
  //     }

  //     onClose();
  //   };

  const handleSubmit = async () => {
    try {
      let payload = {
        testName: formData.testName,
      };

      if (selectedOption === "SELECTION") {
        const pattern = testPatterns.find((p) =>
          p.exam.toLowerCase().includes(formData.testPattern.toLowerCase())
        );

        payload.testPattern = formData.testPattern;
        payload.sections = pattern ? pattern.sections : [];
      }

      const response = await testServices.createAssignment(payload);
      const createdTestId = response?.data?._id;

      if (selectedOption === "QID" && uploadedFile && createdTestId) {
        const excelFormData = new FormData();
        excelFormData.append("file", uploadedFile);
        await testServices.uploadExcelFile(createdTestId, excelFormData);
      }

      toast.success("Test created successfully!");
      navigate(`/test-Creation`);
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
          <option value="">Test Pattern</option>
          <option value="">New</option>
          {testPatterns.map((item, index) => (
            <option key={index} value={item.exam}>
              {item.exam}
            </option>
          ))}
          <option value="JEE">JEE</option>
        </select>

        {/* Radio Buttons */}
        <div className="flex space-x-4 mb-3">
          <label className="flex items-center space-x-2">
            <input
              className=""
              type="radio"
              name="selectionType"
              value="QID"
              checked={selectedOption === "QID"}
              onChange={() => setSelectedOption("QID")}
            />
            <span className="ml-2">QID</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="selectionType"
              value="SELECTION"
              checked={selectedOption === "SELECTION"}
              onChange={() => setSelectedOption("SELECTION")}
            />
            <span className="ml-2">Selection</span>
          </label>
        </div>

        {/* Conditional Buttons for QID */}
        {selectedOption === "QID" && (
          <div className="flex space-x-3 mb-3 gap-3">
            <button className="px-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
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
