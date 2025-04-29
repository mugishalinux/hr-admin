import "./navbar.scss";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/baseUrl";
import { useAuthUser } from "react-auth-kit";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Badge,
  Tabs,
  Tab,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { DarkModeContext } from "../../context/darkModeContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const Navbar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const auth = useAuthUser();
  const user = auth();

  const [userImage, setUserImage] = useState(user?.image || null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/single`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${user?.jwtToken}`,
        },
      });
      const profileImage = response.data.profile;
      if (profileImage) {
        setUserImage(profileImage);
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/notifications/leave/user`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${user?.jwtToken}`,
        },
      });

      const unread = response.data.unreadNotifications || [];
      const read = response.data.readNotifications || [];

      const sorted = [...unread, ...read].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setUnreadCount(unread.length);
      setNotifications(sorted);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (ids) => {
    if (ids.length === 0) return;
    try {
      await axios.put(
        `${BASE_URL}/api/notifications/mark-read`,
        ids,
        {
          headers: {
            Authorization: `Bearer ${user?.jwtToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  const handleDialogOpen = () => {
    const unreadIds = notifications
      .filter((n) => n.status === "UNREAD")
      .map((n) => n.id);
    markAsRead(unreadIds);
    setUnreadCount(0);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNotifications([]);
    setTabIndex(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    if (user?.jwtToken) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.jwtToken]);

  useEffect(() => {
    if (!user?.image || user?.image === "") {
      fetchUserProfile();
    } else {
      setUserImage(user?.image);
    }
  }, [user]);

  const filteredNotifications =
    tabIndex === 0
      ? notifications
      : notifications.filter((n) => n.status === "UNREAD");

  return (
    <div className="navbar">
      <div className="wrapper">
        <div className="search">
          <input type="text" placeholder="Search..." />
          <SearchOutlinedIcon />
        </div>
        <div className="items">
          <div className="item">
            <DarkModeOutlinedIcon
              className="icon"
              onClick={() => dispatch({ type: "TOGGLE" })}
            />
          </div>

          <div className="item">
            <Badge
              badgeContent={unreadCount}
              color="warning"
              onClick={handleDialogOpen}
              style={{ cursor: "pointer" }}
            >
              <NotificationsNoneOutlinedIcon className="icon" />
            </Badge>
          </div>

          <div className="item">
            {userImage ? (
              <img
                src={userImage}
                alt="avatar"
                className="avatar"
              />
            ) : (
              <div className="avatar-initial">
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        PaperProps={{
          style: {
            position: "absolute",
            top: 20,
            right: 40,
            width: 380,
            maxHeight: "80vh",
            overflowY: "auto",
            borderRadius: "16px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #eee",
            fontWeight: 700,
            fontSize: "1.1rem",
            padding: "12px 20px 4px",
          }}
        >
          Notifications
        </DialogTitle>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="ALL" />
          <Tab label="UNREAD" />
        </Tabs>
        <DialogContent sx={{ padding: 0 }}>
          {filteredNotifications.length === 0 ? (
            <Typography sx={{ padding: 2 }}>No notifications found.</Typography>
          ) : (
            filteredNotifications.map((notif, idx) => (
              <Box
                key={notif.id}
                sx={{
                  padding: "12px 20px",
                  borderBottom:
                    idx < filteredNotifications.length - 1
                      ? "1px solid #eee"
                      : "none",
                  backgroundColor:
                    notif.status === "UNREAD" ? "#f6f4ff" : "#fff",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
                onClick={() => console.log("Clicked notification", notif)}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: notif.status === "UNREAD" ? "#6439ff" : "#333",
                    fontWeight: notif.status === "UNREAD" ? 600 : 400,
                  }}
                >
                  {notif.description}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#999", fontSize: "0.75rem" }}
                >
                  {dayjs(notif.createdAt).fromNow()}
                </Typography>
              </Box>
            ))
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Navbar;
