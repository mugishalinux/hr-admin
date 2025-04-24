import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import New from "./pages/new/New";
import Application from "./pages/leave/Application";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { productInputs, userInputs } from "./formSource";
import "./style/dark.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { RequireAuth } from "react-auth-kit";
import NotFound from "./pages/exception/NotFound";
import { ToastContainer } from "react-toastify";
import Calender from "./pages/teamMembers/TeamMembers"
import LeaveApplicationList from "../src/pages/leave/LeaveApplicationList"
import "react-toastify/dist/ReactToastify.css"; // import toastify styles
import EditLeaveApplication from "../src/pages/leave/EditLeaveApplication"
import ViewApplicationLeaveDetails from "../src/pages/leave/ViewApplicationLeaveDetails"
import ManageTeam from "../src/components/datatable/team/TeamListDatatable"
import ViewLeaveDetails from "../src/components/datatable/team/TeamListDatatable"
import TeamList from "../src/pages/team/TeamList"
import AddTeam from "../src/pages/team/NewTeam"
import UpdateTeam from "./components/datatable/team/UpdateTeam";
import LeaveType from "../src/pages/leaveType/LeaveType"
import LeaveTypeCreate from "./pages/leaveType/Application"
import DepartmentCreation from "./pages/department/DepartmentCreation"
import Department from "./pages/department/Department"
import PolicySetting from './pages/policySetting/PolicySetting'
import LeavePolicySetting from './pages/policySetting/LeavePolicySetting'
function App() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <RequireAuth loginPath="/">
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/leave"
            element={
              <RequireAuth loginPath="/">
                <LeaveApplicationList />
              </RequireAuth>
            }
          />
          <Route
            path="/leave/application"
            element={
              <RequireAuth loginPath="/">
                <Application inputs={userInputs} title="Add New Leave Application" />
              </RequireAuth>
            }
          />
          <Route
            path="/leave/view/details/:id"
            element={
              <RequireAuth loginPath="/">
                <ViewApplicationLeaveDetails inputs={userInputs} title="Add New Leave Application" />
              </RequireAuth>
            }
          />
          <Route
            path="/leave/application/edit/:id"
            element={
              <RequireAuth loginPath="/">
                <EditLeaveApplication />
              </RequireAuth>
            }
          />
          <Route
            path="/calender"
            element={
              <RequireAuth loginPath="/">
                <Calender />
              </RequireAuth>
            }
          />
          <Route
            path="/team"
            element={
              <RequireAuth loginPath="/">
                {/* <ManageTeam /> */}
                <TeamList />
              </RequireAuth>
            }
          />
          <Route
            path="/team/edit/:id"
            element={
              <RequireAuth loginPath="/">
                <UpdateTeam />
              </RequireAuth>
            }
          />
          <Route
            path="/new/team"
            element={
              <RequireAuth loginPath="/">
                <AddTeam />
              </RequireAuth>
            }
          />
          <Route
            path="/leave/type"
            element={
              <RequireAuth loginPath="/">
                <LeaveType />
              </RequireAuth>
            }
          />
          <Route
            path="/leave/type/new"
            element={
              <RequireAuth loginPath="/">
                <LeaveTypeCreate />
              </RequireAuth>
            }
          />
          <Route
            path="/leave/type/edit"
            element={
              <RequireAuth loginPath="/">
                <LeaveTypeCreate />
              </RequireAuth>
            }
          />
          <Route
            path="/department"
            element={
              <RequireAuth loginPath="/">
                <Department />
              </RequireAuth>
            }
          />
          <Route
            path="/department/new"
            element={
              <RequireAuth loginPath="/">
                <DepartmentCreation />
              </RequireAuth>
            }
          />
          <Route
            path="/leave/policies"
            element={
              <RequireAuth loginPath="/">
                <PolicySetting />
              </RequireAuth>
            }
          />
          <Route
            path="/leave/policy/setting"
            element={
              <RequireAuth loginPath="/">
                <LeavePolicySetting />
              </RequireAuth>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAuth loginPath="/">
                <List />
              </RequireAuth>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <RequireAuth loginPath="/">
                <Single />
              </RequireAuth>
            }
          />
          <Route
            path="/users/new"
            element={
              <RequireAuth loginPath="/">
                <New inputs={userInputs} title="Add New User" />
              </RequireAuth>
            }
          />

          <Route
            path="/products"
            element={
              <RequireAuth loginPath="/">
                <List />
              </RequireAuth>
            }
          />
          <Route
            path="/products/:productId"
            element={
              <RequireAuth loginPath="/">
                <Single />
              </RequireAuth>
            }
          />
          <Route
            path="/products/new"
            element={
              <RequireAuth loginPath="/">
                <New inputs={productInputs} title="Add New Product" />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" // or "dark" to match dark mode
      />
    </div>
  );
}

export default App;
