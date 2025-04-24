import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { BASE_URL } from "../../config/baseUrl";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./application.scss";
import { getSidebarByPermission } from "../../utils/getSidebarByPermission";

const LeaveTypeCreate = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leaveTypeRequiresAttachment: false,
    affectsBalance: "accrual",
    daysLimit: "",
    leaveTypeRequireReason: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuthUser();
  const user = auth();
  const navigate = useNavigate();
  const permission = user?.role || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.description.length < 20) {
      toast.error("Description must be at least 20 characters long");
      return;
    }
    let usesFixedLimit = formData.affectsBalance === "fixed";
    if (formData.affectsBalance === "fixed") {
      console.log(formData.affectsBalance)
      usesFixedLimit = false
    } else {
      console.log(formData.affectsBalance)
      usesFixedLimit = true
      console.log(usesFixedLimit)
    }


    setIsSubmitting(true);
    try {

      const response = await axios.post(`${BASE_URL}/api/leave-type`, {
        "name": formData.name,
        "description": formData.description,
        "leaveTypeRequiresAttachment": formData.leaveTypeRequiresAttachment,
        "affectsBalance": usesFixedLimit,
        "daysLimit": parseInt(formData.daysLimit),
        "leaveTypeRequireReason": formData.leaveTypeRequireReason
      }, {
        headers: {
          Authorization: `Bearer ${user?.jwtToken}`,
        },
      });

      toast.success(response.data.message || "Leave Type created successfully");
      navigate("/leave/type");
    } catch (error) {
      if (error?.response?.status === 403) {
        toast.error("Forbidden: You do not have permission to create leave types.");
      } else {
        const msg = error?.response?.data?.message || "Failed to create leave type";
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new">
      {getSidebarByPermission(permission)}
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Create Leave Type</h1>
        </div>
        <div className="bottom redesigned-form">
          <div className="right">
            <form onSubmit={handleSubmit} className="form-flex-layout" style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <div className="formInput">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginTop: "15px" }} className="formInput">
                  <label>Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div className="formInput">
                  <label>Does this leave use accrual rate?</label>
                  <select
                    value={formData.affectsBalance}
                    onChange={(e) => setFormData({ ...formData, affectsBalance: e.target.value, daysLimit: "" })}
                  >
                    <option value="accrual">Yes (use accrual rate)</option>
                    <option value="fixed">No (use fixed days limit)</option>
                  </select>
                </div>
                {formData.affectsBalance === "fixed" && (
                  <div style={{ marginTop: "15px" }} className="formInput">
                    <label>Leave Days Limit</label>
                    <input
                      type="number"
                      value={formData.daysLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, daysLimit: e.target.value })
                      }
                      placeholder="Enter number of days"
                    />
                  </div>
                )}
                <div style={{ marginTop: "15px" }} className=" checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.leaveTypeRequireReason}
                      onChange={(e) =>
                        setFormData({ ...formData, leaveTypeRequireReason: e.target.checked })
                      }
                    />
                    Requires Reason
                  </label>
                </div>
                <div style={{ marginTop: "15px" }} className=" checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.leaveTypeRequiresAttachment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leaveTypeRequiresAttachment: e.target.checked,
                        })
                      }
                    />
                    Requires Attachment
                  </label>
                </div>
                <div className="formInput">
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveTypeCreate;