import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="bg-gray-950 min-h-screen">
      {children}
    </div>
  );
}