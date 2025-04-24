
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "../../../config/baseUrl";
import Navbar from "../../../components/navbar/Navbar";
import "./viewDetails.scss";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";



const ViewLeaveDetails = () => {
    const { id } = useParams();
    const auth = useAuthUser();
    const user = auth();
    const navigate = useNavigate();
    const permission = user?.permissions || "";
    const [leave, setLeave] = useState(null);

    useEffect(() => {
        const fetchLeaveDetails = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/leave-applications/byId/${id}`, {
                    headers: {
                        Authorization: `Bearer ${user?.jwtToken}`,
                    },
                });
                setLeave(response.data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Leave application not found");
                navigate("/home");
            }
        };

        if (user?.jwtToken) fetchLeaveDetails();
    }, [user?.jwtToken, id, navigate]);

    if (!leave) return null;

    return (
        <div className="viewLeave">

            <div className="viewLeaveContainer">

                <div className="viewLeaveContent">
                    <div className="headerWithBack">
                        <ArrowBackIcon
                            onClick={() => navigate(-1)}
                            style={{ cursor: "pointer", marginRight: "10px", color: "#6439ff" }}
                        />
                        <h2 style={{ marginTop: "20px" }}>Leave Application Details</h2>
                    </div>

                    <div className="detailsGrid">
                        <div className="detailItem">
                            <span className="label">Applicant:</span>
                            <span>{leave.user.fullName}</span>
                        </div>
                        <div className="detailItem">
                            <span className="label">Leave Type:</span>
                            <span>{leave.leaveType.name}</span>
                        </div>
                        <div className="detailItem">
                            <span className="label">Start Date:</span>
                            <span>{leave.startDate}</span>
                        </div>
                        <div className="detailItem">
                            <span className="label">End Date:</span>
                            <span>{leave.endDate}</span>
                        </div>
                        <div className="detailItem">
                            <span className="label">Half Day:</span>
                            <span>{leave.halfDay ? "Yes" : "No"}</span>
                        </div>
                        <div className="detailItem">
                            <span className="label">Reason:</span>
                            <span>{leave.reason}</span>
                        </div>
                        <div className="detailItem">
                            <span className="label">Status:</span>
                            <span className={`status ${leave.status.toLowerCase()}`}>{leave.status}</span>
                        </div>
                        {leave.reviewComment && (
                            <div className="detailItem">
                                <span className="label">Review Comment:</span>
                                <span>{leave.reviewComment}</span>
                            </div>
                        )}
                        {leave.attachmentPath && (
                            <div className="detailItem">
                                <span className="label">Attachment:</span>
                                <a href={leave.attachmentPath} target="_blank" rel="noreferrer">
                                    View Document
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewLeaveDetails;
