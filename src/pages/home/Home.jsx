import SidebarStaff from "../../components/sidebar/SidebarStaff";
import Navbar from "../../components/navbar/Navbar";
import Widget from "../../components/widget/Widget";
import StaffLeaveHistory from "../../components/table/staff/StaffLeaveHistory";
import UpcomingHolidays from "../../components/widget/UpcomingHolidays";
import "./home.scss";

import React, { useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config/baseUrl";
import axios from "axios";
import { toast } from "react-toastify";

const Home = () => {
  const auth = useAuthUser();
  const user = auth();
  const navigate = useNavigate();

  const [leaveBalance, setLeaveBalance] = useState(0);
  const [daysAllowed, setDaysAllowed] = useState(0);
  const [accrualRate, setAccrualRate] = useState(0);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);

  // Fetch leave types
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/leave-type/list?page=0&sizePage=10&sortBy=name`,
          {
            headers: {
              Authorization: `Bearer ${user?.jwtToken}`,
            },
          }
        );
        const types = response.data?.content || [];
        setLeaveTypes(types);
        if (types.length > 0) setSelectedLeaveType(types[0]);
      } catch (error) {
        toast.error("Failed to load leave types.");
      }
    };

    if (user?.jwtToken) {
      fetchLeaveTypes();
    }
  }, [user?.jwtToken]);

  // Fetch overview when leave type changes
  useEffect(() => {
    const fetchOverview = async () => {
      if (!selectedLeaveType) return;
      try {
        const url = selectedLeaveType.affectsBalance
          ? `${BASE_URL}/api/leave-balance-overview?userId=${user?.id}&leaveTypeId=${selectedLeaveType.id}`
          : `${BASE_URL}/api/leave-balance-overview/details?userId=${user?.id}&leaveTypeId=${selectedLeaveType.id}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
          },
        });

        const { leaveBalance, daysAllowed, accrualRate } = response.data;
        setLeaveBalance(leaveBalance);
        setDaysAllowed(daysAllowed);
        setAccrualRate(accrualRate);
      } catch (error) {
        toast.error("Could not fetch leave balance overview.");
      }
    };

    if (user?.jwtToken && selectedLeaveType) {
      fetchOverview();
    }
  }, [selectedLeaveType, user?.jwtToken, user?.id]);

  return (
    <div className="home">
      <SidebarStaff />
      <div className="homeContainer">
        <Navbar />

        <div className="dropdown-container">
          <label htmlFor="leaveTypeSelect" style={{ marginRight: "10px" }}>Select Leave Type:</label>
          <select
            id="leaveTypeSelect"
            onChange={(e) => {
              const selected = leaveTypes.find(type => type.id === e.target.value);
              setSelectedLeaveType(selected);
            }}
            value={selectedLeaveType?.id || ""}
          >
            {leaveTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className="widgets">
          <Widget type="leaveBalance" val={leaveBalance} />
          <Widget type="daysAllowed" val={daysAllowed} />
          <Widget type="accrualRate" val={accrualRate} />
        </div>

        <UpcomingHolidays />

        <div className="listContainer">
          <div className="listTitle">Leave applications history</div>
          <StaffLeaveHistory />
        </div>
      </div>
    </div>
  );
};

export default Home;
