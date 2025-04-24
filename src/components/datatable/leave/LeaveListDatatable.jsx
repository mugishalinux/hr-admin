import "./datatable.scss";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { leaveApplicationColumns } from "./datatablesource.js";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config/baseUrl.js";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { useSignIn } from "react-auth-kit";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const LeaveListDatatable = () => {
  const auth = useAuthUser();
  const user = auth();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [selectedRejectId, setSelectedRejectId] = useState(null);

  const fetchLeaveApplications = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/leave-applications/approve/pending-applications?page=${page}&size=${pageSize}&sort=createdAt&sort=desc`,
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
          },
        }
      );

      const transformed = response.data.content.map((item) => ({
        id: item.id,
        leaveTypeName: item.leaveType.name,
        name: item.user.fullName,
        // daysRequested: item.halfDay
        //   ? 1
        //   : new Date(item.endDate).getDate() - new Date(item.startDate).getDate() + 1,
        startDate: item.startDate,
        endDate: item.endDate,
        reason: item.reason,
        comment: item.reviewComment ?? "N/A",
        status: item.status ?? "N/A",
        createdById: item.createdBy?.id,
      }));

      setData(transformed);
      setRowCount(response.data.totalElements);
    } catch (error) {
      toast.error("Failed to fetch leave applications");
    }
  };

  useEffect(() => {
    if (user?.jwtToken) {
      fetchLeaveApplications();
    }
  }, [user?.jwtToken, page, pageSize]);

  const handleApprove = async (id) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/leave-applications/approve-or-reject/${id}?status=APPROVED&comment=Approved`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
          },
        }
      );
      toast.success(response.data.message || "Leave approved successfully");
      fetchLeaveApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve leave");
    }
  };

  const openRejectModal = (id) => {
    setSelectedRejectId(id);
    setRejectComment("");
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectComment.trim()) {
      toast.warning("Please enter a reason for rejection");
      return;
    }
    try {
      const response = await axios.put(
        `${BASE_URL}/api/leave-applications/approve-or-reject/${selectedRejectId}?status=REJECTED&comment=${encodeURIComponent(rejectComment)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
          },
        }
      );
      toast.warning(response.data.message || "Leave rejected successfully");
      fetchLeaveApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject leave");
    } finally {
      setRejectModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    const target = data.find((item) => item.id === id);
    if (target?.status !== "PENDING") return toast.warning("Only pending applications can be deleted");
    try {
      const response = await axios.delete(`${BASE_URL}/api/leave-applications/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.jwtToken}`,
        },
      });
      toast.success(response.data.message || "Leave deleted successfully");
      fetchLeaveApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete leave");
    }
  };

  const actionColumn = [
    {
      field: "edit",
      headerName: "Edit",
      width: 80,
      renderCell: (params) => (
        params.row.createdById === user?.id && (
          <div className="cellAction">
            <Link to={`/leave/application/edit/${params.row.id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">Edit</div>
            </Link>
          </div>
        )
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => (
        <div className="cellAction">
          <Link to={`/leave/view/details/${params.row.id}`} style={{ textDecoration: "none" }}>
            <div className="viewButton">View</div>
          </Link>
          {params.row.createdById === user?.id && params.row.status === "PENDING" && (
            <div className="deleteButton" onClick={() => handleDelete(params.row.id)}>
              Delete
            </div>
          )}
          {(user?.permissions === "ADMIN" || user?.permissions === "MANAGER") && (
            <>
              <button className="approveButton" onClick={() => handleApprove(params.row.id)}>
                Approve
              </button>
              <button className="rejectButton" onClick={() => openRejectModal(params.row.id)}>
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const styledColumns = leaveApplicationColumns.map((col) =>
    col.field === "status"
      ? {
        ...col,
        renderCell: (params) => {
          const status = params.row.status;
          let className = "cellWithStatus ";
          if (status === "PENDING") className += "yellow";
          else if (status === "APPROVED") className += "green";
          else if (status === "REJECTED") className += "red";
          return <div className={className}>{status}</div>;
        },
      }
      : col
  );

  const columnsToRender = styledColumns.concat(actionColumn);

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Leave Applications
        <Link to="/leave/application" className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={columnsToRender}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 25, 50]}
        pagination
        paginationMode="server"
        rowCount={rowCount}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        checkboxSelection
        sortingOrder={["desc", "asc"]}
        components={{ Toolbar: user?.permissions === "ADMIN" ? GridToolbar : undefined }}
        disableSelectionOnClick
        autoHeight
        sx={{
          "& .MuiDataGrid-toolbarContainer": {
            backgroundColor: "#f3f3f3",
            padding: "8px",
            justifyContent: "space-between",
          },
          "& .MuiDataGrid-toolbarContainer button": {
            color: "#6439ff",
          },
        }}
      />

      <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
        <DialogTitle>Reject Leave Application</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for rejection"
            fullWidth
            multiline
            rows={3}
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectModalOpen(false)} style={{ backgroundColor: "gray", color: "white" }}>Cancel</Button>
          <Button onClick={confirmReject} style={{ backgroundColor: "#6439ff", color: "white" }}>Reject</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeaveListDatatable;
