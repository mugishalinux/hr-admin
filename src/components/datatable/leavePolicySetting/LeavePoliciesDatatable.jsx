import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config/baseUrl.js";
import { toast } from "react-toastify";
import { useAuthUser } from "react-auth-kit";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const LeavePoliciesDatatable = () => {
  const auth = useAuthUser();
  const user = auth();

  const [policyData, setPolicyData] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState({
    accrualRate: 0,
    maxCarryForwardDays: 0,
  });
  const [noPolicy, setNoPolicy] = useState(false);

  const fetchPolicy = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/leave-policy`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${user?.jwtToken}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const policy = response.data;
        setPolicyData([
          {
            id: 1,
            accrualRate: policy.accrualRate,
            maxCarryForwardDays: policy.maxCarryForwardDays,
          },
        ]);
        setNoPolicy(false);
      }
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 400 && message === "Leave policy not found") {
        toast.info("No policy record found.");
        setPolicyData([]);
        setNoPolicy(true);
      } else if (status === 403) {
        toast.error("Forbidden: You do not have access to view leave policies.");
      } else if (status === 400) {
        toast.error("Bad Request: Unable to fetch leave policy.");
      } else {
        toast.error("Failed to fetch leave policy.");
      }
    }
  };

  const handleEditChange = (field, value) => {
    setSelectedEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    const { accrualRate, maxCarryForwardDays } = selectedEditData;

    if (!accrualRate || accrualRate <= 0) {
      toast.error("Accrual rate must be greater than 0.");
      return;
    }

    if (maxCarryForwardDays < 0) {
      toast.error("Max carry forward days cannot be negative.");
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/api/leave-policy`,
        {
          accrualRate,
          maxCarryForwardDays,
        },
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.jwtToken}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(noPolicy ? "Policy created successfully." : "Policy updated successfully.");
        setEditDialogOpen(false);
        fetchPolicy();
      }
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 403) {
        toast.error("Forbidden: You do not have permission to update this policy.");
      } else if (status === 400 && message !== "Leave policy not found") {
        toast.error("Bad Request: Please check your input.");
      } else {
        toast.error("Failed to save policy.");
      }
    }
  };

  const openEditDialog = (row) => {
    setSelectedEditData({ ...row });
    setEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedEditData({ accrualRate: 0, maxCarryForwardDays: 0 });
    setEditDialogOpen(true);
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const columns = [
    {
      field: "accrualRate",
      headerName: "Accrual Rate (days/month)",
      width: 220,
    },
    {
      field: "maxCarryForwardDays",
      headerName: "Max Carry Forward Days",
      width: 220,
    },
    {
      field: "action",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="cellAction">
          <div className="viewButton" onClick={() => openEditDialog(params.row)}>
            Edit
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Set New Policies
        <Link to="/leave/policy/setting" className="link">
          Set new policy
        </Link>
      </div>

      <DataGrid
        className="datagrid"
        rows={policyData}
        columns={columns}
        pageSize={1}
        rowsPerPageOptions={[1]}
        disableSelectionOnClick
        autoHeight
        getRowId={(row) => row.id}
      />

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{noPolicy ? "Create Leave Policy" : "Edit Leave Policy"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Accrual Rate (days/month)"
            margin="normal"
            type="number"
            value={selectedEditData.accrualRate === 0 ? "" : selectedEditData.accrualRate}
            onChange={(e) =>
              handleEditChange("accrualRate", e.target.value === "" ? 0 : Number(e.target.value))
            }
          />
          <TextField
            fullWidth
            label="Max Carry Forward Days"
            margin="normal"
            type="number"
            value={selectedEditData.maxCarryForwardDays === 0 ? "" : selectedEditData.maxCarryForwardDays}
            onChange={(e) =>
              handleEditChange("maxCarryForwardDays", e.target.value === "" ? 0 : Number(e.target.value))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            style={{ color: "white", backgroundColor: "#6439ff" }}
          >
            {noPolicy ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeavePoliciesDatatable;
