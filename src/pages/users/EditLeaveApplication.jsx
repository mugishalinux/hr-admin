import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { BASE_URL } from "../../config/baseUrl";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import "./application.scss";
import { getSidebarByPermission } from "../../utils/getSidebarByPermission";

const cloudName = "ded6s1sof";
const uploadPreset = "pcq731ml";

const EditLeaveApplication = () => {
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
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();

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

    const fetchLeaveApplication = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/leave-applications/byId/${id}`,
          {
            headers: {
              Authorization: `Bearer ${user?.jwtToken}`,
            },
          }
        );
        const data = response.data;
        setFormData({
          leaveTypeId: data.leaveType.id,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
          halfDay: data.halfDay,
          attachmentPath: data.attachmentPath || "",
        });
        setRequiresAttachment(data.leaveType.leaveTypeRequiresAttachment);
        setRequiresReason(data.leaveType.leaveTypeRequireReason);
      } catch (error) {
        toast.error(error.response?.data?.message || "Leave application not found");
        navigate("/home");
      }
    };

    if (user?.jwtToken) {
      fetchLeaveTypes();
      fetchLeaveApplication();
    }
  }, [user?.jwtToken, id, navigate]);

  const handleLeaveTypeChange = (e) => {
    const selectedId = e.target.value;
    setFormData({ ...formData, leaveTypeId: selectedId });
    const selected = leaveTypes.find((lt) => lt.id === selectedId);
    if (selected) {
      setRequiresAttachment(selected.leaveTypeRequiresAttachment);
      setRequiresReason(selected.leaveTypeRequireReason);
    }
  };

  const uploadFileToCloudinary = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      throw new Error("File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.halfDay && formData.startDate !== formData.endDate) {
      toast.error("For half-day leave, start and end date must be the same");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData };

      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error("Attachment must be less than 2MB");
          setIsSubmitting(false);
          return;
        }
        // const allowedTypes = ["application/pdf"];
        // if (!allowedTypes.includes(file.type)) {
        //   toast.error("Only PDF files are allowed as attachments");
        //   setIsSubmitting(false);
        //   return;
        // }
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
          toast.error("Only image files (PNG, JPG, JPEG) are allowed as attachments");
          setIsSubmitting(false);
          return;
        }

        const uploadedUrl = await uploadFileToCloudinary(file);
        payload.attachmentPath = uploadedUrl;
      }

      const response = await axios.put(
        `${BASE_URL}/api/leave-applications/update/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
          },
        }
      );

      toast.success(response.data.message || "Leave application updated successfully");
      navigate("/home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update leave application");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new">
      {getSidebarByPermission(permission)}
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Edit Leave Application</h1>
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
                      Attachment: <DriveFolderUploadOutlinedIcon className="icon" />
                    </label>
                    <input
                      type="file"
                      id="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                    {isUploading && <CircularProgress size={24} style={{ marginTop: 10 }} />}
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
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <CircularProgress size={24} /> : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLeaveApplication;
