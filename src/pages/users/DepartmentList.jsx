import "./leaveApplicationList.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import Datatable from "../../components/datatable/Datatable"
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";
import LeaveListDatatable from "../../components/datatable/leave/LeaveListDatatable"
import { getSidebarByPermission } from "../../utils/getSidebarByPermission";


const DepartmentList = () => {
  const auth = useAuthUser();
  const user = auth();
  const permission = user?.role || "";
  const navigate = useNavigate();
  return (
    <div className="list">
      {getSidebarByPermission(permission)}
      <div className="listContainer">
        <Navbar />
        <LeaveListDatatable />
      </div>
    </div>
  )
}

export default DepartmentList