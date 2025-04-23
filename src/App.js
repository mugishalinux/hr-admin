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
import TeamMembers from "../src/pages/teamMembers/TeamMembers"
import "react-toastify/dist/ReactToastify.css"; // import toastify styles

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
            path="/team/members"
            element={
              <RequireAuth loginPath="/">
                <TeamMembers />
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
            path="/leave/application"
            element={
              <RequireAuth loginPath="/">
                <Application inputs={userInputs} title="Add New Leave Application" />
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
