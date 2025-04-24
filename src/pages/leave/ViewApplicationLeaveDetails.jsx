import "./leaveApplicationList.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import Datatable from "../../components/datatable/Datatable"
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import LeaveListDatatable from "../../components/datatable/leave/LeaveListDatatable"
import ViewLeaveDetails from "../../components/datatable/leave/ViewLeaveDetails"
import { getSidebarByPermission } from "../../utils/getSidebarByPermission";


const ViewApplicationLeaveDetails = () => {
    const auth = useAuthUser();
    const user = auth();
    const permission = user?.role || "";
    const navigate = useNavigate();
    return (
        <div className="list">
            {getSidebarByPermission(permission)}
            <div className="listContainer">
                <Navbar />
                <ViewLeaveDetails />
            </div>
        </div>
    )
}

export default ViewApplicationLeaveDetails