import React, { useState, useEffect } from "react";
import Navbar from "../../../components/navbar/Navbar";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { BASE_URL } from "../../../config/baseUrl";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import "./newTeam.scss";
import { getSidebarByPermission } from "../../../utils/getSidebarByPermission";

const UpdateTeam = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const auth = useAuthUser();
    const user = auth();
    const navigate = useNavigate();
    const permission = user?.role || "";
    const { id } = useParams();

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/teams/${id}`, {
                    headers: {
                        Authorization: `Bearer ${user?.jwtToken}`,
                    },
                });
                const { name, description } = response.data;
                setFormData({ name, description });
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load team data");
                navigate("/teams/list");
            }
        };
        if (id && user?.jwtToken) fetchTeam();
    }, [id, user?.jwtToken, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            departmentId: user?.departmentId,
        };

        try {
            const response = await axios.put(`${BASE_URL}/api/teams/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${user?.jwtToken}`,
                },
            });

            toast.success(response.data.message || "Team updated successfully");
            navigate("/team");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update team");
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
                    <h1>Update Team</h1>
                </div>
                <div className="bottom redesigned-form">
                    <div className="right">
                        <form onSubmit={handleSubmit}>
                            <div className="formInput">
                                <label>Team Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="formInput">
                                <label>Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="formInput">
                                <button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <CircularProgress size={24} /> : "Update Team"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateTeam;
