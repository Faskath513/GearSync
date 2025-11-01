import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-10">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} MyWebsite. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Designed by <span className="text-indigo-400 font-medium">Your Name</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
