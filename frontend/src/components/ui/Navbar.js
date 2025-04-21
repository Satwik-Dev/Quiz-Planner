import React, { useContext, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  Bars3BottomLeftIcon 
} from '@heroicons/react/24/outline';
import AuthContext from '../../contexts/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-indigo-600 shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              className="p-2 rounded-md text-indigo-100 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center ml-4">
              <span className="text-white text-xl font-bold">Quiz Planner</span>
            </Link>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="ml-3 relative">
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="flex items-center text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      <span className="mr-2">{user.name || user.email}</span>
                      <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="px-1 py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700'
                              } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            >
                              <UserCircleIcon 
                                className="w-5 h-5 mr-2" 
                                aria-hidden="true" 
                              />
                              Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`${
                                active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700'
                              } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            >
                              <ArrowRightOnRectangleIcon 
                                className="w-5 h-5 mr-2" 
                                aria-hidden="true" 
                              />
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-400"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;