import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FlightIcon from '@mui/icons-material/Flight';
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import StoreIcon from "@mui/icons-material/Store";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsSystemDaydreamOutlinedIcon from "@mui/icons-material/SettingsSystemDaydreamOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Link } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";
import { useSignOut } from "react-auth-kit";
import { useAuthUser } from "react-auth-kit";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { CalendarViewDay, CalendarViewDayRounded } from "@material-ui/icons";
import ApartmentIcon from '@mui/icons-material/Apartment';
import SegmentIcon from '@mui/icons-material/Segment';
import PolicyIcon from '@mui/icons-material/Policy';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const { instance, accounts } = useMsal();
    const auth = useAuthUser();
    const user = auth();
    const { dispatch } = useContext(DarkModeContext);
    const signOut = useSignOut();
    const handleLogout = async () => {
        try {
          const authUser = auth();
      
          if (authUser?.loginMethod === "microsoft") {
         
            await instance.logoutRedirect({
              postLogoutRedirectUri: "http://localhost:3000",
            });
          } else {
           
            signOut();
            navigate("/"); 
          }
        } catch (error) {
          console.error("Logout error", error);
        }
      };
      


    return (
        <div className="sidebar">
            <div className="top">
                <Link to="/" style={{ textDecoration: "none" }}>
                    <span className="logo">welcome</span>
                </Link>
            </div>
            <hr />
            <div className="center">
                <ul>
                    <p className="title">MAIN</p>
                    <Link to="/home" style={{ textDecoration: "none" }}>
                        <li>
                            <DashboardIcon className="icon" />
                            <span>Dashboard</span>
                        </li>
                    </Link>

                    <p className="title">LISTS</p>
                    <Link to="/leave/" style={{ textDecoration: "none" }}>
                        <li>
                            <FlightIcon className="icon" />
                            <span>Leave Application</span>
                        </li>
                    </Link>
                    <Link to="/calender" style={{ textDecoration: "none" }}>
                        <li>
                            <CalendarMonthIcon className="icon" />
                            <span>Calender</span>
                        </li>
                    </Link>
                    {user?.permissions !== 'ADMIN' && (
                        <Link to="/team" style={{ textDecoration: "none" }}>
                            <li>
                                <PersonOutlineIcon className="icon" />
                                <span>Team members</span>
                            </li>
                        </Link>
                    )}
                    {user?.permissions == 'ADMIN' && (
                        <Link to="/leave/type" style={{ textDecoration: "none" }}>
                            <li>
                                <SegmentIcon className="icon" />
                                <span>Leave Type</span>
                            </li>
                        </Link>
                    )}
                    {user?.permissions == 'ADMIN' && (
                        <Link to="/department" style={{ textDecoration: "none" }}>
                            <li>
                                <ApartmentIcon className="icon" />
                                <span>Department</span>
                            </li>
                        </Link>
                    )}
                    {user?.permissions == 'ADMIN' && (
                        <Link to="/leave/policies" style={{ textDecoration: "none" }}>
                            <li>
                                <PolicyIcon className="icon" />
                                <span>Accrual & Carry forward </span>
                            </li>
                        </Link>
                    )}
                    {user?.permissions == 'ADMIN' && (
                        <Link to="/users" style={{ textDecoration: "none" }}>
                            <li>
                                <GroupAddIcon className="icon" />
                                <span>Users</span>
                            </li>
                        </Link>
                    )}

                    <Link
                        to="/"
                        onClick={handleLogout}
                        style={{ textDecoration: "none" }}
                    >
                        <li>
                            <ExitToAppIcon className="icon" />
                            <span>Logout</span>
                        </li>
                    </Link>
                </ul>
            </div>
            <div className="bottom">
                <div
                    className="colorOption"
                    onClick={() => dispatch({ type: "LIGHT" })}
                ></div>
                <div
                    className="colorOption"
                // onClick={() => dispatch({ type: "DARK" })}
                ></div>
            </div>
        </div>
    );
};

export default Sidebar;
