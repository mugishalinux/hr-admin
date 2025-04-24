export const leaveApplicationColumns = [
  {
    field: "leaveTypeName",
    headerName: "Leave Type Name",
    width: 200,
  },
  {
    field: "name",
    headerName: "Requested By",
    width: 200,
  },
  // {
  //   field: "daysRequested",
  //   headerName: "Days Requested",
  //   width: 150,
  // },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 150,
  },
  {
    field: "endDate",
    headerName: "End Date",
    width: 150,
  },
  {
    field: "reason",
    headerName: "Reason",
    width: 200,
  },
  {
    field: "comment",
    headerName: "Comment",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 160,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      );
    },
  },
];
