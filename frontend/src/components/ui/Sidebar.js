import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  BookOpenIcon, 
  AcademicCapIcon, 
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Study Materials', path: '/materials', icon: BookOpenIcon },
    { name: 'Quizzes', path: '/quizzes', icon: AcademicCapIcon },
    { name: 'Settings', path: '/profile', icon: Cog6ToothIcon },
  ];

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out md:translate-x-0`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Menu</h2>
        <button
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={toggleSidebar}
        >
          <span className="sr-only">Close sidebar</span>
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <nav className="mt-6 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-4 flex-shrink-0 h-6 w-6" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-800">Need help?</h3>
          <p className="mt-1 text-sm text-indigo-600">
            Check out the documentation or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;