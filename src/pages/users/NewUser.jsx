import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { BASE_URL } from "../../config/baseUrl";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./newTeam.scss"; // you can rename to newUser.scss if you want
import { getSidebarByPermission } from "../../utils/getSidebarByPermission";

const NewUser = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    permissions: "",
    departmentId: "",
    profileImg: "",
  });

  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const auth = useAuthUser();
  const user = auth();
  const navigate = useNavigate();
  const permission = user?.role || "";

  const cloudName = "ded6s1sof";
  const uploadPreset = "pcq731ml";

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
      toast.error("Failed to fetch departments");
    }
  };

  useEffect(() => {
    if (user?.jwtToken) {
      fetchDepartments();
    }
  }, [user?.jwtToken]);

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, data);
    return res.data.secure_url; // returns the image URL
  };

  const validateFullName = (name) => {
    return name.trim().split(" ").length >= 2;
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFullName(formData.fullName)) {
      toast.error("Full name must have at least two words (e.g., John Doe).");
      return;
    }
    if (!validateEmail(formData.email)) {
      toast.error("Invalid email address format.");
      return;
    }

    if (!formData.permissions) {
      toast.error("Please select a role.");
      return;
    }
    if (!formData.departmentId) {
      toast.error("Please select a department.");
      return;
    }
    if (!imageFile) {
      toast.error("Please upload a profile image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrl = await uploadToCloudinary(imageFile);

      const payload = {
        ...formData,
        profileImg: imageUrl,
      };

      const response = await axios.post(`${BASE_URL}/api/users/register`, payload, {
        headers: {
          Authorization: `Bearer ${user?.jwtToken}`,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      });

      if (response.status === 201 || response.status === 200) {
        toast.success(response.data.message || "User registered successfully!");
        navigate("/users");
      }
    } catch (error) {
      if (error?.response?.status === 403) {
        toast.error("Forbidden: You do not have permission to register users.");
      } else if (error?.response?.status === 400) {
        toast.error(error.response?.data?.message || "Bad request: Invalid input.");
      } else {
        toast.error("Failed to register user.");
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
          <h1>Create New User</h1>
        </div>
        <div className="bottom redesigned-form">
          <div className="right">
            <form onSubmit={handleSubmit}>
              <div className="formInput">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="formInput">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>



              <div className="formInput">
                <label>Role</label>
                <select
                  value={formData.permissions}
                  onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="STAFF">STAFF</option>
                </select>
              </div>

              <div className="formInput">
                <label>Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="formInput">
                <label>Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  required
                />
              </div>
              <div className="formInput">
                <button type="submit" disabled={isSubmitting} style={{ backgroundColor: "#6439ff", color: "white" }}>
                  {isSubmitting ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Register User"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUser;
