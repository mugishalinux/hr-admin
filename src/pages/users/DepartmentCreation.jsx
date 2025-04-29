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

const DepartmentCreation = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuthUser();
  const user = auth();
  const navigate = useNavigate();
  const permission = user?.role || "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.name.trim().length < 3) {
      toast.error("Department name must be at least 3 characters.");
      return;
    }

    if (formData.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/departments/create`,
        {
          departmentName: formData.name,
          departmentDesc: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message || "Department created successfully");
        navigate("/department");
      }
    } catch (error) {
      if (error?.response?.status === 403) {
        toast.error("Forbidden: You do not have permission to create a department.");
      } else if (error?.response?.status === 400) {
        toast.error("Bad Request: Check your input.");
      } else {
        toast.error(error?.response?.data?.message || "Failed to create department");
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
          <h1>Create Department</h1>
        </div>
        <div className="bottom redesigned-form">
          <div className="right">
            <form onSubmit={handleSubmit} className="form-flex-layout" style={{ display: "flex", gap: "2rem" }}>
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

export default DepartmentCreation;
