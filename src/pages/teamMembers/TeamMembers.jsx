import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import SidebarStaff from "../../components/sidebar/SidebarStaff";
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

const TeamMembers = () => {
  const auth = useAuthUser();
  const user = auth();
  const navigate = useNavigate();
  const permission = user?.permissions || "";

  const [teamName, setTeamName] = useState("");
  const [onLeaveUsers, setOnLeaveUsers] = useState([]);

  useEffect(() => {
    const fetchOnLeaveUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/leave-applications/team-on-leave`, {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
          },
          validateStatus: () => true,
        });

        if (response.status === 200) {
          setTeamName(response.data.teamName);
          setOnLeaveUsers(response.data.onLeaveUsers);
        } else {
          toast.error(response.data.message || "Failed to fetch leave data.");
        }
      } catch (error) {
        toast.error("Network error. Please try again later.");
      }
    };

    if (user?.jwtToken) fetchOnLeaveUsers();
  }, [user?.jwtToken]);

  return (
    <div className="new">
      {getSidebarByPermission(permission)}
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1 style={{ color: "#6439ff;" }}>{teamName ? `Team: ${teamName}` : "Team members on leave"}</h1>
        </div>
        <div className="top-paragraph">
          <p className="description">Currently Team members on leave</p>
        </div>
        <div className="calendar-show">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridWeek"
            height="auto"
            events={onLeaveUsers.map((name, i) => ({
              id: i.toString(),
              title: name,
              start: new Date(), // Show on today only
              allDay: true,
              classNames: ["today-highlight"], // Highlight today
            }))}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;
