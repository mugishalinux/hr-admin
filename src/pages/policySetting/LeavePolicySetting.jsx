import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { BASE_URL } from "../../config/baseUrl";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./department.scss";
import { getSidebarByPermission } from "../../utils/getSidebarByPermission";

const LeavePolicySetting = () => {
  const [formData, setFormData] = useState({
    accrualRate: "",
    maxCarryForwardDays: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuthUser();
  const user = auth();
  const navigate = useNavigate();
  const permission = user?.role || "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accrualRate = Number(formData.accrualRate);
    const carryForward = Number(formData.maxCarryForwardDays);

    if (isNaN(accrualRate) || accrualRate <= 0) {
      toast.error("Accrual rate must be a number greater than 0.");
      return;
    }

    if (isNaN(carryForward) || carryForward < 0) {
      toast.error("Max carry forward days must be a non-negative number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/leave-policy`,
        {
          accrualRate,
          maxCarryForwardDays: carryForward,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Leave policy created successfully");
        navigate("/leave/policies");
      }
    } catch (error) {
      if (error?.response?.status === 403) {
        toast.error("Forbidden: You do not have permission to create this policy.");
      } else if (error?.response?.status === 400) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error(error?.response?.data?.message || "Failed to create leave policy");
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
          <h1>Create Leave Policy</h1>
        </div>
        <div className="bottom redesigned-form">
          <div className="right">
            <form onSubmit={handleSubmit} className="form-flex-layout" style={{ display: "flex", gap: "2rem" }}>
              <div style={{ flex: 1 }}>
                <div className="formInput">
                  <label>Accrual Rate (days/month)</label>
                  <input
                    type="number"
                    value={formData.accrualRate}
                    onChange={(e) => setFormData({ ...formData, accrualRate: e.target.value })}
                    placeholder="e.g. 2"
                    required
                  />
                </div>

                <div style={{ marginTop: "15px" }} className="formInput">
                  <label>Max Carry Forward Days</label>
                  <input
                    type="number"
                    value={formData.maxCarryForwardDays}
                    onChange={(e) => setFormData({ ...formData, maxCarryForwardDays: e.target.value })}
                    placeholder="e.g. 30"
                    required
                  />
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

export default LeavePolicySetting;