// src/pages/user/UserListDatatable.jsx

import "./datatable.scss";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { userColumns } from "./datatablesource.js";
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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

const UserListDatatable = () => {
  const auth = useAuthUser();
  const user = auth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/list/all`, {
        headers: {
          Authorization: `Bearer ${user?.jwtToken}`,
          Accept: "*/*",
        },
      });
  
      if (response?.status === 200 && Array.isArray(response.data?.content)) {
        const transformed = response.data.content.map((item, index) => ({
          id: item.id || index,
          fullName: item.fullName,
          email: item.email,
          department: item.departmentName || "N/A",
          departmentId: item.departmentId || null,
          team: item.teamName || "N/A",
          teamId: item.teamId || null,
          role: item.permissions,
          status: item.accountEnabled ? "Enabled" : "Disabled",
          accountEnabled: item.accountEnabled,
        }));
  
        setUsers(transformed);
      } else {
        toast.error(response?.data?.message || "No users found");
        setUsers([]);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to fetch users";
      toast.error(msg);
      setUsers([]);
    }
  };
  

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/departments/list?page=0&sizePage=50&sortBy=name`, {
        headers: {
          Authorization: `Bearer ${user?.jwtToken}`,
          Accept: "*/*",
        },
      });
      setDepartments(response.data.content);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  useEffect(() => {
    if (user?.jwtToken) {
      fetchUsers();
      fetchDepartments();
    }
  }, [user?.jwtToken]);

  const openEditDialog = (row) => {
    setSelectedEditData({ ...row });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field, value) => {
    setSelectedEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    if (!selectedEditData.fullName || selectedEditData.fullName.trim().length < 3) {
      toast.error("Full name must be at least 3 characters.");
      return;
    }
    if (!selectedEditData.email || selectedEditData.email.trim().length < 5) {
      toast.error("Invalid email address.");
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/api/users/update-account/${selectedEditData.id}`,
        {
          fullName: selectedEditData.fullName,
          email: selectedEditData.email,
          permissions: selectedEditData.role,
          departmentId: selectedEditData.departmentId,
          profileImg: "string",
        },
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      toast.success(response.data.message || "User updated successfully");
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to update user";
      toast.error(msg);
    }
  };

  const handleStatusToggle = async (row) => {
    try {
      await axios.put(
        `${BASE_URL}/api/users/enable-account`,
        {
          status: !row.accountEnabled,
          userId: row.id,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );
      toast.success("User status updated.");
      fetchUsers();
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to update status";
      toast.error(msg);
    }
  };

  const actionColumn = {
    field: "action",
    headerName: "Actions",
    width: 250,
    renderCell: (params) => (
      <div className="cellAction">
        <div className="viewButton" onClick={() => openEditDialog(params.row)}>Edit</div>
        <div
          className="deleteButton"
          onClick={() => handleStatusToggle(params.row)}
        >
          {params.row.accountEnabled ? "Disable" : "Enable"}
        </div>
      </div>
    ),
  };

  const columnsToRender = userColumns.concat(actionColumn);

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Users
        <Link to="/new/user" className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={users}
        columns={columnsToRender}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        pagination
        components={{ Toolbar: GridToolbar }}
        disableSelectionOnClick
        autoHeight
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            value={selectedEditData?.fullName || ""}
            onChange={(e) => handleEditChange("fullName", e.target.value)}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={selectedEditData?.email || ""}
            onChange={(e) => handleEditChange("email", e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Department</InputLabel>
            <Select
            label="Department"
              value={selectedEditData?.departmentId || ""}
              onChange={(e) => handleEditChange("departmentId", e.target.value)}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
             label="Role"
              value={selectedEditData?.role || ""}
              onChange={(e) => handleEditChange("role", e.target.value)}
            >
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="MANAGER">MANAGER</MenuItem>
              <MenuItem value="STAFF">STAFF</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" style={{ backgroundColor: "#6439ff", color: "white" }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserListDatatable;