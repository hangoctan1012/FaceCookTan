import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, Activity } from 'lucide-react';

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Mock Data for Area Chart
    const data = [
        { name: 'Jan', activeUsers: 1200, newPosts: 800 },
        { name: 'Feb', activeUsers: 1100, newPosts: 700 },
        { name: 'Mar', activeUsers: 1600, newPosts: 1100 },
        { name: 'Apr', activeUsers: 1500, newPosts: 1000 },
        { name: 'May', activeUsers: 2000, newPosts: 1400 },
        { name: 'Jun', activeUsers: 1900, newPosts: 1300 },
        { name: 'Jul', activeUsers: 2200, newPosts: 1600 },
        { name: 'Aug', activeUsers: 2100, newPosts: 1500 },
        { name: 'Sep', activeUsers: 2500, newPosts: 1800 },
        { name: 'Oct', activeUsers: 2400, newPosts: 1700 },
        { name: 'Nov', activeUsers: 2800, newPosts: 2000 },
        { name: 'Dec', activeUsers: 3000, newPosts: 2200 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Phân Tích</h2>
                <p className="text-gray-500 mt-1">Theo dõi hoạt động và hành vi người dùng Facecook</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
                {['Tổng Quan', 'Danh Mục', 'Thiết Bị'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.toLowerCase().replace(' ', '-')
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Người Dùng Hoạt Động</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">2,350</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                    <span className="text-green-500 text-sm font-medium">+15.2% từ tháng trước</span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Bài Đăng Mới</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">1,520</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <FileText className="text-green-600" size={24} />
                        </div>
                    </div>
                    <span className="text-green-500 text-sm font-medium">+12.5% từ tháng trước</span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Tỷ Lệ Tương Tác</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">68.4%</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Activity className="text-purple-600" size={24} />
                        </div>
                    </div>
                    <span className="text-green-500 text-sm font-medium">+5.3% từ tháng trước</span>
                </div>
            </div>

            {/* Area Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Xu Hướng Hoạt Động</h3>
                    <p className="text-sm text-gray-500">Người dùng hoạt động và bài đăng mới theo tháng</p>
                </div>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                            <CartesianGrid vertical={false} stroke="#f3f4f6" />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="activeUsers"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                                name="Người dùng hoạt động"
                            />
                            <Area
                                type="monotone"
                                dataKey="newPosts"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorPosts)"
                                name="Bài đăng mới"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
