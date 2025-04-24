import "./datatable.scss";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { departmentColumns } from "./datatablesource.js";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../../config/baseUrl.js";
import { toast } from "react-toastify";
import { useAuthUser } from "react-auth-kit";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from "@mui/material";

const DepartmentListDatatable = () => {
  const auth = useAuthUser();
  const user = auth();
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState(null);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/departments/list?page=${page}&sizePage=${pageSize}&sortBy=name`
      );

      const transformed = response.data.content.map((item, index) => ({
        id: item.id || index,
        name: item.name,
        description: item.description,
      }));

      setDepartments(transformed);
      setRowCount(response.data.totalElements);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to fetch departments";
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/departments/delete/${selectedDeleteId}`);
      toast.success(response.data.message || "Department deleted successfully");
      fetchDepartments();
    } catch (error) {
      if (error?.response?.status === 403) {
        toast.error("Forbidden: You do not have permission to delete departments.");
      } else if (error?.response?.status === 400) {
        toast.error("Bad Request: Invalid department ID.");
      } else {
        toast.error("Failed to delete department");
      }
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
    if (!selectedEditData.name || selectedEditData.name.length < 3) {
      toast.error("Department name must be at least 3 characters.");
      return;
    }

    if (!selectedEditData.description || selectedEditData.description.length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/api/departments/update/${selectedEditData.id}`,
        {
          departmentName: selectedEditData.name,
          departmentDesc: selectedEditData.description,
        },
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.jwtToken}`, // ✅ Include the token
          },
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message || "Department updated successfully");
        setEditDialogOpen(false);
        fetchDepartments();
      }
    } catch (error) {
      if (error?.response?.status === 403) {
        toast.error("Forbidden: You do not have permission to update this department.");
      } else if (error?.response?.status === 400) {
        toast.error("Bad Request: Invalid input for update.");
      } else {
        toast.error(error?.response?.data?.message || "Failed to update department.");
      }
    }
  };



  useEffect(() => {
    fetchDepartments();
  }, [page, pageSize]);

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

  const columnsToRender = departmentColumns.concat(actionColumn);

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Departments
        <Link to="/department/new" className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={departments}
        columns={columnsToRender}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 25, 50]}
        pagination
        paginationMode="server"
        rowCount={rowCount}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
        components={{ Toolbar: GridToolbar }}
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
          <Typography>Are you sure you want to delete this department?</Typography>
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
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Department Name"
            margin="normal"
            value={selectedEditData?.name || ""}
            onChange={(e) => handleEditChange("name", e.target.value)}
          />
          <TextField
            fullWidth
            label="Department Description"
            margin="normal"
            multiline
            minRows={3}
            value={selectedEditData?.description || ""}
            onChange={(e) => handleEditChange("description", e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" style={{ color: "white", backgroundColor: "#6439ff" }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DepartmentListDatatable;
