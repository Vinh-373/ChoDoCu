import { Outlet } from "react-router-dom";

/** Bọc các trang thường trong khung cùng bề rộng với Header/Footer (lớp .container/.page trong index.css). */
export default function ContainerLayout() {
  return (
    <div className="container page">
      <Outlet />
    </div>
  );
}
