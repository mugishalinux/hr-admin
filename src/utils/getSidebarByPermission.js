// src/utils/getSidebarByPermission.js
import React from "react";
import SidebarAdmin from "../components/sidebar/SidebarAdmin";
import SidebarStaff from "../components/sidebar/SidebarStaff";

export const getSidebarByPermission = (permission) => {
    if (permission === "ADMIN") {
        return  <SidebarStaff/>;
    } else if (permission === "STAFF") {
        return <SidebarStaff/>;
    } else {
        return <SidebarStaff/>;
    }
};
