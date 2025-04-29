import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./teamMembers.scss";
import axios from "axios";
import { BASE_URL } from "../../config/baseUrl";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { getSidebarByPermission } from "../../utils/getSidebarByPermission";
import {
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  Button,
  Paper,
  Typography,
} from "@mui/material";

const Calender = () => {
  const auth = useAuthUser();
  const user = auth();
  const navigate = useNavigate();
  const permission = user?.permissions || "";

  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [onLeaveUsers, setOnLeaveUsers] = useState([]);
  const [teamName, setTeamName] = useState("");

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/departments/list?page=0&sizePage=50&sortBy=name`, {
        headers: { Authorization: `Bearer ${user?.jwtToken}` },
      });
      if (response.status === 200) {
        setDepartments(response.data.content);
      } else {
        toast.error(response.data.message || "Failed to fetch departments.");
      }
    } catch (error) {
      toast.error("Network error while fetching departments.");
    }
  };

  const fetchTeamsByDepartment = async (departmentId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/teams/department/${departmentId}`, {
        headers: { Authorization: `Bearer ${user?.jwtToken}` },
      });
      if (response.status === 200) {
        setTeams(response.data);
      } else {
        toast.error(response.data.message || "Failed to fetch teams.");
      }
    } catch (error) {
      toast.error("Network error while fetching teams.");
    }
  };

  const fetchCalendarData = async () => {
    if (!selectedDepartment || !startDate || !endDate) {
      toast.error("Please select department, start date, and end date.");
      return;
    }
    try {
      const url = `${BASE_URL}/api/leave-applications/api/calendar/department-team?departmentId=${selectedDepartment}${selectedTeam ? `&teamId=${selectedTeam}` : ""}&fromDate=${startDate}&toDate=${endDate}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${user?.jwtToken}` },
      });
      if (response.status === 200) {
        setOnLeaveUsers(response.data);
      } else {
        toast.error(response.data.message || "Failed to fetch calendar data.");
      }
    } catch (error) {
      toast.error("Network error while fetching leave data.");
    }
  };

  const fetchOwnTeamLeave = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/leave-applications/team-on-leave`, {
        headers: { Authorization: `Bearer ${user?.jwtToken}` },
      });
      if (response.status === 200) {
        setTeamName(response.data.teamName);
        setOnLeaveUsers(response.data.onLeaveUsers.map((name) => ({
          id: name,
          title: name,
          start: new Date(),
          allDay: true,
        })));
      } else {
        toast.error(response.data.message || "Failed to fetch team leave data.");
      }
    } catch (error) {
      toast.error("Network error while fetching team leave data.");
    }
  };

  useEffect(() => {
    if (user?.jwtToken) {
      if (permission === "ADMIN") {
        fetchDepartments();
      } else {
        fetchOwnTeamLeave();
      }
    }
  }, [user?.jwtToken, permission]);

  return (
    <div className="new">
      {getSidebarByPermission(permission)}
      <div className="newContainer" style={{paddingTop: "20px" }}>
        <Navbar />
        <div className="top">
          <h1 style={{ color: "#6439ff" }}>
            {permission === "ADMIN"
              ? "Team Calendar - Admin View"
              : teamName ? `Team: ${teamName}` : "Team members on leave"}
          </h1>
        </div>

        {permission === "ADMIN" ? (
          <>
            {/* Filter Section */}
            <Box style={{ paddingLeft: "20px", paddingTop: "20px" }} display="flex" gap={2} mb={3} flexWrap="wrap">
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Department"
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedTeam("");
                    fetchTeamsByDepartment(e.target.value);
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Team</InputLabel>
                <Select
                  value={selectedTeam}
                  label="Team"
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  disabled={!teams.length}
                >
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <TextField
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <Button
                variant="contained"
                style={{ backgroundColor: "#6439ff", color: "white", height: "55px" }}
                onClick={fetchCalendarData}
              >
                Search
              </Button>
            </Box>

            {/* Result Display */}
            <Box style={{ paddingLeft: "20px"}} display="flex" flexWrap="wrap" gap={2}>
              {onLeaveUsers.length > 0 ? (
                onLeaveUsers.map((user, index) => (
                  <Paper
                    key={index}
                    elevation={3}
                    sx={{
                      padding: 2,
                      minWidth: 250,
                      backgroundColor: "#f8f9ff",
                      borderLeft: "5px solid #6439ff",
                      marginBottom: 2,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.fullName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.departmentName} - {user.teamName}
                    </Typography>
                    <Typography variant="body2">
                      From: {user.startDate}
                    </Typography>
                    <Typography variant="body2">
                      To: {user.endDate}
                    </Typography>
                    {user.halfDay && (
                      <Typography variant="caption" color="warning.main">
                        Half-day leave
                      </Typography>
                    )}
                  </Paper>
                ))
              ) : (
                <Typography>No leave records found.</Typography>
              )}
            </Box>
          </>
        ) : (
          <div className="calendar-show">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridWeek"
              height="auto"
              events={onLeaveUsers}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Calender;
