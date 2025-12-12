import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AnalyticsPage = () => {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const getInventory = async () => {
    try {
      const { data } = await API.get("/inventory/get-inventory");
      if (data?.success) {
        setRecords(data.inventory);
        setFiltered(data.inventory);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getInventory();
  }, []);

  // ------------------------
  // FILTERING + SEARCH + SORT
  // ------------------------
  useEffect(() => {
    let temp = [...records];

    // search filter
    if (search.trim() !== "") {
      temp = temp.filter((item) =>
        item.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // blood group filter
    if (group !== "All") {
      temp = temp.filter((item) => item.bloodGroup === group);
    }

    // sort
    temp.sort((a, b) =>
      sortOrder === "latest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

    setFiltered(temp);
    setPage(1);
  }, [search, group, sortOrder, records]);

  // ------------------------
  // PAGINATION
  // ------------------------
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ------------------------
  // EXPORT TO PDF
  // ------------------------
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Blood Inventory Report", 14, 15);

    const tableData = filtered.map((item) => [
      item.bloodGroup,
      item.inventoryType,
      item.quantity + " ML",
      item.email,
      moment(item.createdAt).format("DD MMM YYYY, hh:mm A"),
    ]);

    doc.autoTable({
      head: [["Blood Group", "Type", "Quantity", "Email", "Date"]],
      body: tableData,
      startY: 25,
    });

    doc.save("BloodInventoryReport.pdf");
  };

  return (
    <Layout>
      <div className="analytics-wrapper">

        {/* Header */}
        <div className="analytics-header">
          <h1 className="analytics-title">Recent Blood Records</h1>
          <p className="analytics-subtitle">Track and monitor blood inventory activity</p>
        </div>

        {/* Controls Row */}
        <div className="analytics-controls">

          {/* Search */}
          <input
            type="text"
            placeholder="Search by email..."
            className="analytics-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Blood Group Filter */}
          <select
            className="analytics-select"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="All">All Groups</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
          </select>

          {/* Sort */}
          <select
            className="analytics-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* PDF Export */}
          <button className="export-btn" onClick={exportPDF}>Export PDF</button>
        </div>

        {/* Table */}
        <div className="analytics-table-box">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Blood Group</th>
                <th>Inventory Type</th>
                <th>Quantity</th>
                <th>Donor Email</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item._id}>
                    <td>{item.bloodGroup}</td>
                    <td>{item.inventoryType}</td>
                    <td>{item.quantity} ML</td>
                    <td>{item.email}</td>
                    <td>{moment(item.createdAt).format("DD MMM, YYYY • hh:mm A")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-records">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            ⬅ Previous
          </button>

          <span>Page {page} / {totalPages}</span>

          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next ➜
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
