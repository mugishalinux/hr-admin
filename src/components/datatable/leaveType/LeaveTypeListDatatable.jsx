import "./datatable.scss";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { leaveTypeColumns } from "./datatablesource.js";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../../config/baseUrl.js";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const LeaveTypeListDatatable = () => {
  const auth = useAuthUser();
  const user = auth();

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState(null);

  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/leave-type/list?page=${page}&sizePage=${pageSize}&sortBy=name`,
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
          },
        }
      );

      const transformed = response.data.content.map((item, index) => ({
        id: item.id || index,
        leaveTypeName: item.name,
        description: item.description,
        isLeaveRequireAttachment: item.leaveTypeRequiresAttachment,
        isLeaveRequireReason: item.leaveTypeRequireReason,
        leaveTypeStatus: item.leaveTypeStatus || "ACTIVE",
        affectsBalance: item.affectsBalance ? "accrual" : "fixed",
        leaveDaysLimit: item.daysLimit,
      }));

      setLeaveTypes(transformed);
      setRowCount(response.data.totalElements);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch leave types");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/leave-type/${selectedDeleteId}`, {
        headers: { Authorization: `Bearer ${user?.jwtToken}` },
      });
      toast.success(response.data.message || "Leave type deleted successfully");
      fetchLeaveTypes();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete leave type");
    } finally {
      setConfirmOpen(false);
      setSelectedDeleteId(null);
    }
  };

  const openDeleteDialog = (id) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const openEditDialog = (row) => {
    setSelectedEditData({ ...row });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field, value) => {
    setSelectedEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    if (!selectedEditData.leaveTypeName || selectedEditData.leaveTypeName.length < 3) {
      toast.error("Name is required and must be at least 3 characters.");
      return;
    }

    if (!selectedEditData.description || selectedEditData.description.length < 20) {
      toast.error("Description must be at least 20 characters.");
      return;
    }

    const affects = selectedEditData.affectsBalance === "accrual"; // matches create logic

    const payload = {
      name: selectedEditData.leaveTypeName,
      description: selectedEditData.description,
      leaveTypeRequiresAttachment: selectedEditData.isLeaveRequireAttachment,
      leaveTypeRequireReason: selectedEditData.isLeaveRequireReason,
      leaveTypeStatus: selectedEditData.leaveTypeStatus || "ACTIVE",
      affectsBalance: affects,
      daysLimit: affects ? 0 : parseInt(selectedEditData.leaveDaysLimit || 0),
    };

    try {
      const response = await axios.put(
        `${BASE_URL}/api/leave-type/${selectedEditData.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${user?.jwtToken}` },
        }
      );
      toast.success(response.data.message || "Leave type updated successfully");
      setEditDialogOpen(false);
      fetchLeaveTypes();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update leave type");
    }
  };

  useEffect(() => {
    if (user?.jwtToken) fetchLeaveTypes();
  }, [user?.jwtToken, page, pageSize]);

  const actionColumn = {
    field: "action",
    headerName: "Actions",
    width: 200,
    renderCell: (params) => (
      <div className="cellAction">
        <div className="viewButton" onClick={() => openEditDialog(params.row)}>
          Edit
        </div>
        <div className="deleteButton" onClick={() => openDeleteDialog(params.row.id)}>
          Delete
        </div>
      </div>
    ),
  };

  const columnsToRender = leaveTypeColumns.concat(actionColumn);

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Leave Type
        <Link to="/leave/type/new" className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={leaveTypes}
        columns={columnsToRender}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 25, 50]}
        pagination
        paginationMode="server"
        rowCount={rowCount}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this leave type?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} style={{ backgroundColor: "gray", color: "white" }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} style={{ backgroundColor: "#d32f2f", color: "white" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Leave Type</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={selectedEditData?.leaveTypeName || ""}
            onChange={(e) => handleEditChange("leaveTypeName", e.target.value)}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            minRows={3}
            value={selectedEditData?.description || ""}
            onChange={(e) => handleEditChange("description", e.target.value)}
          />
          <TextField
            select
            fullWidth
            label="Does this leave use accrual rate?"
            margin="normal"
            value={selectedEditData?.affectsBalance || "accrual"}
            onChange={(e) => handleEditChange("affectsBalance", e.target.value)}
          >
            <MenuItem value="accrual">Yes (use accrual rate)</MenuItem>
            <MenuItem value="fixed">No (use fixed days limit)</MenuItem>
          </TextField>

          {selectedEditData?.affectsBalance === "fixed" && (
            <TextField
              fullWidth
              type="number"
              label="Leave Days Limit"
              margin="normal"
              value={selectedEditData?.leaveDaysLimit || ""}
              onChange={(e) => handleEditChange("leaveDaysLimit", e.target.value)}
            />
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedEditData?.isLeaveRequireAttachment || false}
                onChange={(e) => handleEditChange("isLeaveRequireAttachment", e.target.checked)}
              />
            }
            label="Requires Attachment"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedEditData?.isLeaveRequireReason || false}
                onChange={(e) => handleEditChange("isLeaveRequireReason", e.target.checked)}
              />
            }
            label="Requires Reason"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" style={{ color: "white", backgroundColor: " #6439ff" }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeaveTypeListDatatable;
