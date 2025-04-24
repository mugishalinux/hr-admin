// TeamListDatatable.jsx
import "./datatable.scss";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Checkbox, TextField, Box, Typography
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config/baseUrl.js";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const teamColumns = [
  { field: "name", headerName: "Team Name", width: 200 },
  { field: "description", headerName: "Team description", width: 400 },
  { field: "departmentName", headerName: "Department", width: 250 },
  { field: "teamLead", headerName: "Team Leader", width: 200 },
];

const memberColumns = [
  { field: "fullName", headerName: "Full Name", width: 200 },
  { field: "permissions", headerName: "Permission", width: 200 },
  { field: "email", headerName: "Email", width: 300 },
];

const TeamListDatatable = () => {
  const auth = useAuthUser();
  const user = auth();
  const [teams, setTeams] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningTeamId, setAssigningTeamId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  const fetchTeams = async () => {
    try {
      const endpoint = user?.permissions === "ADMIN"
        ? `/api/teams?page=${page}&sizePage=${pageSize}&sortBy=name`
        : "/api/teams/creator";

      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${user?.jwtToken}` },
      });

      const teamData = Array.isArray(response.data.content)
        ? response.data.content
        : [response.data];

      const transformed = teamData.map((team, index) => ({
        id: team.id || index,
        name: team.name,
        description: team.description,
        departmentName: team.department?.name || "N/A",
        teamLead: team.lead?.fullName || "N/A",
      }));

      setTeams(transformed);
      setRowCount(response.data.totalElements || transformed.length);

      if (teamData[0]?.id) {
        fetchTeamMembers(teamData[0].id);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to load teams";
      if (error?.response?.status === 404 && user?.permissions !== "ADMIN") {
        setTeams([]);
        toast.info("No team belongs to you found.");
      } else {
        toast.error(msg);
      }
    }
  };

  const fetchTeamMembers = async (teamId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/team/${teamId}?page=0&size=10&sortBy=fullName`, {
        headers: { Authorization: `Bearer ${user?.jwtToken}` },
      });
      setTeamMembers(response.data.content);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to load team members";
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/teams/${id}`, {
        headers: { Authorization: `Bearer ${user?.jwtToken}` },
      });
      toast.success(response.data.message || "Team deleted successfully");
      fetchTeams();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete team");
    }
  };

  const openAssignDialog = async (teamId) => {
    setAssigningTeamId(teamId);
    try {
      const res = await axios.get(`${BASE_URL}/api/users/list`, {
        headers: { Authorization: `Bearer ${user?.jwtToken}` },
      });
      const filteredUsers = res.data.filter((u) => u.id !== user.id);
      setAllUsers(filteredUsers);
      setOpenAssignModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAssignUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select at least one user to assign");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/teams/assign-users`,
        { teamId: assigningTeamId, userIds: selectedUsers },
        { headers: { Authorization: `Bearer ${user?.jwtToken}` } }
      );
      toast.success(response.data.message || "Users assigned successfully");
      setOpenAssignModal(false);
      setSelectedUsers([]);
      fetchTeams();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign users");
    }
  };

  useEffect(() => {
    if (user?.jwtToken) fetchTeams();
  }, [user?.jwtToken, page, pageSize]);

  const actionColumn = {
    field: "action",
    headerName: "Action",
    width: 300,
    renderCell: (params) => (
      <div className="cellAction">

        {["MANAGER"].includes(user?.permissions) && (
          <Link to={`/team/edit/${params.row.id}`} style={{ textDecoration: "none" }}>
            <div className="viewButton">Edit</div>
          </Link>

        )}

        {["MANAGER"].includes(user?.permissions) && (
          <div className="deleteButton" onClick={() => handleDelete(params.row.id)}>
            Delete
          </div>

        )}

        {["MANAGER"].includes(user?.permissions) && (
          <div
            className="assignButton"
            onClick={() => openAssignDialog(params.row.id)}
            style={{ border: "2px dotted green", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}
          >
            Assign Members
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Team
        {["MANAGER"].includes(user?.permissions) && (
          <Link to="/new/team/" className="link">
            Add New
          </Link>
        )}
      </div>

      <DataGrid
        className="datagrid"
        rows={teams}
        columns={[...teamColumns, actionColumn]}
        pagination
        paginationMode="server"
        pageSize={pageSize}
        rowsPerPageOptions={[10, 25, 50]}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
        rowCount={rowCount}
        disableSelectionOnClick
        autoHeight
        components={{ Toolbar: user?.permissions === "ADMIN" ? GridToolbar : undefined }}
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

      <div className="datatableTitle" style={{ marginTop: "2rem" }}>Team Members</div>
      <DataGrid
        className="datagrid"
        rows={teamMembers}
        columns={memberColumns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
        autoHeight
      />

      <Dialog open={openAssignModal} onClose={() => setOpenAssignModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Users to Team</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Search user by name"
            variant="outlined"
            margin="normal"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Box sx={{ maxHeight: 350, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
            {allUsers
              .filter((u) => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((user) => (
                <Box key={user.id} sx={{ display: "flex", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: 1 }}>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                  />
                  <Typography variant="body2">{user.fullName} ({user.permissions})</Typography>
                </Box>
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignModal(false)} style={{ backgroundColor: "gray", color: "white" }}>
            Cancel
          </Button>
          <Button onClick={handleAssignUsers} style={{ border: "2px dotted green", color: "green", fontWeight: "bold" }}>
            Assign Users
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeamListDatatable;
