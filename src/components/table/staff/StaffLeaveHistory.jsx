import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import axios from "axios";
import { BASE_URL } from "../../../config/baseUrl";
import { useAuthUser } from "react-auth-kit";
import "../table.scss";

const StaffLeaveHistory = () => {
  const auth = useAuthUser();
  const user = auth();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const rowsPerPage = 5;

  const fetchLeaveHistory = async (pageNumber = 0) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/leave-applications/history?page=${pageNumber}&size=${rowsPerPage}&sortBy=createdAt`,
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
          },
        }
      );

      if (response.status === 200) {
        setRows(response.data.content);
        setTotalElements(response.data.totalElements);
      } else {
        console.warn("Unable to fetch leave history", response.status);
      }
    } catch (error) {
      console.error("❌ Error fetching leave application history:", error);
    }
  };

  useEffect(() => {
    if (user?.jwtToken) fetchLeaveHistory(page);
  }, [user?.jwtToken, page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const calculateDaysRequested = (start, end, halfDay) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return halfDay ? 0.5 : days;
  };

  const formatDateOnly = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <TableContainer component={Paper} className="table">
        <Table sx={{ minWidth: 650 }} aria-label="leave application history table">
          <TableHead>
            <TableRow>
              <TableCell className="tableCell">Leave Type</TableCell>
              <TableCell className="tableCell">Start Date</TableCell>
              <TableCell className="tableCell">End Date</TableCell>
              {/* <TableCell className="tableCell">Days Requested</TableCell> */}
              <TableCell className="tableCell">Requested At</TableCell>
              <TableCell className="tableCell">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="tableCell">{app.leaveType?.name}</TableCell>
                  <TableCell className="tableCell">{formatDateOnly(app.startDate)}</TableCell>
                  <TableCell className="tableCell">{formatDateOnly(app.endDate)}</TableCell>
                  {/* <TableCell className="tableCell">
                    {calculateDaysRequested(app.startDate, app.endDate, app.halfDay)}
                  </TableCell> */}
                  <TableCell className="tableCell">{formatDateTime(app.createdAt)}</TableCell>
                  <TableCell className="tableCell">
                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        color:
                          app.status === "APPROVED"
                            ? "green"
                            : app.status === "PENDING"
                              ? "goldenrod"
                              : "red",
                        backgroundColor:
                          app.status === "APPROVED"
                            ? "rgba(0, 128, 0, 0.1)"
                            : app.status === "PENDING"
                              ? "rgba(189, 189, 3, 0.1)"
                              : "rgba(255, 0, 0, 0.1)",
                      }}
                    >
                      {app.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" style={{ padding: "20px", fontWeight: "bold" }}>
                  No leave applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[9]}
        />
      </TableContainer>
    </>
  );
};

export default StaffLeaveHistory;
