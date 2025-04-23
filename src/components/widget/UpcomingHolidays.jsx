import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/baseUrl";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import "./UpcomingHolidays.scss";

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { month: "short", day: "2-digit" };
    const day = date.toLocaleDateString(undefined, { weekday: "short" });
    const formatted = date.toLocaleDateString(undefined, options);
    return { formatted, day };
};

const UpcomingHolidays = () => {
    const auth = useAuthUser();
    const user = auth();
    const [holidays, setHolidays] = useState([]);

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/leave-applications/upcoming-holidays`, {
                    headers: {
                        Authorization: `Bearer ${user?.jwtToken}`
                    }
                });
                setHolidays(response.data);
            } catch (error) {
                console.error("❌ Error fetching holidays:", error);
                toast.error("Failed to fetch holidays. Please try again later.");
            }
        };
        if (user?.jwtToken) fetchHolidays();
    }, [user?.jwtToken]);

    return (
        <div>
            <h1 style={{ fontSize: "20px", paddingLeft: "30px", paddingTop: "20px" }}>Upcoming public holidays</h1>
            <div className="holiday-grid fancy-style">
                {holidays.map((holiday, index) => {
                    const { formatted, day } = formatDate(holiday.date);
                    const [month, dayNum] = formatted.split(" ");

                    return (
                        <div className="holiday-card fancy-card" key={index}>
                            <div className="holiday-date fancy-date">
                                <div className="month fancy-month">{month.toUpperCase()}</div>
                                <div className="day fancy-day">{dayNum}</div>
                            </div>
                            <div className="holiday-desc fancy-desc">
                                <div className="desc fancy-text">{holiday.description}</div>
                                <div className="dayName fancy-dayName">{day}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UpcomingHolidays;
