import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

const Widget = (props) => {
  let data;

  const amount = 100;
  const diff = 20;

  switch (props.type) {
    case "leaveBalance":
      data = {
        title: "Leave Balance",
        link: "Total days remaining",
      };
      break;
    case "daysAllowed":
      data = {
        title: "Days Allowed",
        link: "Total days allowed.",
      };
      break;
    case "accrualRate":
      data = {
        title: "Accrual rate",
        link: "rate",
      };
      break;
    default:
      break;
  }

  return (
    <div className="widget">
      <div className="left">
        <span style={{textDecoration: "none", color:"black"}} className="title">{data.title}</span>
        <span style={{textDecoration: "none", color:"black"}} className="counter">
          {data.isMoney && "$"} {props.val}
        </span>
        <span className="" style={{textDecoration: "none", color:"gray"}}>{data.link}</span>
      </div>
      <div className="right">
        <div className="percentage positive">
          <KeyboardArrowUpIcon />
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
