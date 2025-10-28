import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/'

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <img 
        src="/logo.png"   
        alt="GC Club Logo" 
        className="w-10 h-10 object-contain rounded-full"
      />
     
    </Link>
  );
};

export default Logo;
