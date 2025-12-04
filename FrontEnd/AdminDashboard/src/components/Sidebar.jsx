import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Utensils, LogOut, Search, BarChart2 } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/posts', icon: FileText, label: 'Posts' },
        { path: '/recipes', icon: Utensils, label: 'Recipes' },
        { path: '/top-search', icon: Search, label: 'Top Search' },
        { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    ];

    return (
        <div className="h-screen w-64 bg-orange-500 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-orange-400">
                <h1 className="text-2xl font-bold text-white">AdminPanel</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-orange-100 hover:bg-orange-600 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-orange-400">
                <button className="flex items-center space-x-3 px-4 py-3 w-full text-orange-100 hover:bg-orange-600 hover:text-white rounded-lg transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
