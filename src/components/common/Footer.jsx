import React from "react";
import { Github, User } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

const Footer = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  return (
    <footer
      className="text-gray-800 pt-20 pb-10 border-t border-gray-300"
      style={{ backgroundColor: "aliceblue" }}
    >
      


      {/* Footer Bottom Links */}
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 gap-4">
        <p>© {new Date().getFullYear()} Fasil360. All rights reserved.</p>

        <div className="flex items-center gap-6">
          {/* GitHub Link */}
          <a
            href="https://github.com/Asmamaw-kas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-blue-700 transition-colors"
          >
            <Github className="h-5 w-5" />
            <span>View Source Code</span>
          </a>

          {/* About Developer */}
          <a
            href="https://asmamaw-kas.github.io/my-portfolio/"
            className="flex items-center gap-2 hover:text-blue-700 transition-colors"
          >
            <User className="h-5 w-5" />
            <span>About Developer</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
