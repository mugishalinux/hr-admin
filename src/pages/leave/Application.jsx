import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import axios from "axios";
import { BASE_URL } from "../../config/baseUrl";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./application.scss";
import { getSidebarByPermission } from "../../utils/getSidebarByPermission"

const Application = () => {
  const [file, setFile] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    halfDay: false,
  });
  const [requiresAttachment, setRequiresAttachment] = useState(false);
  const [requiresReason, setRequiresReason] = useState(false);
  const auth = useAuthUser();
  const user = auth();
  const permission = user?.role || "";

  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/leave-type/list?page=0&sizePage=100&sortBy=name`,
          {
            headers: {
              Authorization: `Bearer ${user?.jwtToken}`,
            },
          }
        );
        setLeaveTypes(response.data.content);
      } catch (error) {
        toast.error("Failed to fetch leave types");
      }
    };
    fetchLeaveTypes();
  }, [user?.jwtToken]);

  const handleLeaveTypeChange = (e) => {
    const selectedId = e.target.value;
    setFormData({ ...formData, leaveTypeId: selectedId });
    const selected = leaveTypes.find((lt) => lt.id === selectedId);
    if (selected) {
      setRequiresAttachment(selected.leaveTypeRequiresAttachment);
      setRequiresReason(selected.leaveTypeRequireReason);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.halfDay && formData.startDate !== formData.endDate) {
      toast.error("For half-day leave, start and end date must be the same");
      return;
    }

    try {
      const payload = { ...formData };
      if (file) payload.attachmentPath = file.name;

      await axios.post(
        `${BASE_URL}/api/leave-applications/submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
          },
        }
      );

      toast.success("Leave application submitted successfully");
      navigate("/home");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to submit leave application");
      }
    }
  };


  return (
    <div className="new">
      {getSidebarByPermission(permission)}
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Apply for Leave</h1>
        </div>
        <div className="bottom redesigned-form">
          <div className="right">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="formInput">
                  <label>Leave Type</label>
                  <select
                    value={formData.leaveTypeId}
                    onChange={handleLeaveTypeChange}
                    required
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((lt) => (
                      <option key={lt.id} value={lt.id}>
                        {lt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ paddingLeft: "30px" }} className="formInput rightSpaces">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    min={today}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="formInput">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate || today}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>

                {requiresAttachment && (
                  <div
                    style={{ paddingLeft: "30px", paddingTop: "20px" }}
                    className="formInput rightSpaces"
                  >
                    <label htmlFor="file">
                      Attachment:{" "}
                      <DriveFolderUploadOutlinedIcon className="icon" />
                    </label>
                    <input
                      type="file"
                      id="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </div>

              {requiresReason && (
                <div className="formInput">
                  <label>Reason</label>
                  <textarea
                    rows={3}
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="formInput checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.halfDay}
                    onChange={(e) =>
                      setFormData({ ...formData, halfDay: e.target.checked })
                    }
                  />
                  Apply for Half Day
                </label>
              </div>

              <div className="formInput">
                <button type="submit">Apply</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Application;
