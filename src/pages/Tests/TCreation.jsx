import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import NewAssignmentModal from "./components/FormModal";
import testServices from "../../services/testService";
import { MdDelete } from "react-icons/md";

const TCreation = () => {
  const [assignments, setAssignments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await testServices.GETALLTheTESTS();
      setAssignments(response.data);
    } catch (error) {
      toast.error("Failed to fetch test details.");
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;

    try {
      const response = await testServices.deleteTestById(id);
      if (response.success) {
        toast.success("Test deleted successfully!");
        fetchTests();
      } else {
        toast.error(response.message || "Failed to delete test.");
      }
    } catch (error) {
      toast.error("Error deleting test.");
      console.error("Delete error:", error);
    }
  };

  const filteredAssignments = assignments?.filter((assignment) =>
    assignment?.testName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">All Tests</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-purple-700 transition"
        >
          New Test
        </button>
      </div>

      {/* Search Box */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tests by name..."
          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Test Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">SL No</th>
              <th className="px-4 py-3 text-left">Test Name</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-left">No. of Sections</th>
              <th className="px-4 py-3 text-left">Assigned Batch</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment, index) => (
                <tr
                  key={assignment._id}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {assignment.testName || "Untitled"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {assignment.class || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {assignment.noOfSections ||
                      assignment.sections?.length ||
                      0}
                  </td>
                  <td className="px-4 py-3 text-gray-600">-</td>
                  <td className="px-4 py-3 flex items-center gap-4 text-indigo-600 font-medium">
                    <button className="hover:underline">View</button>
                    <button
                      onClick={() => handleDeleteTest(assignment._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center px-4 py-6 text-gray-500">
                  No tests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <NewAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default TCreation;
