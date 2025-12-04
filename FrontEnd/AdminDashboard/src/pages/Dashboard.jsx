import React, { useState, useEffect } from 'react';
import { Users, FileText, Heart, Activity, MoreHorizontal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import StatsCard from '../components/StatsCard';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        likes: 0,
        engagement: 0
    });
    const [topSearchData, setTopSearchData] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for AI Personalization Chart
    const aiData = [
        { time: '0', val1: -100, val2: -50, val3: -80 },
        { time: '4', val1: -80, val2: -40, val3: -70 },
        { time: '8', val1: 100, val2: 50, val3: 0 },
        { time: '12', val1: 500, val2: 300, val3: 150 },
        { time: '16', val1: 400, val2: 200, val3: 50 },
        { time: '20', val1: 0, val2: -50, val3: -80 },
        { time: '24', val1: -100, val2: -80, val3: -100 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                const currentYear = new Date().getFullYear();
                const [userRes, postRes, recipeRes, searchRes] = await Promise.all([
                    api.get('/api/userAdmin/user'),
                    api.get('/api/postAdmin/post'),
                    api.get('/api/recipe'),
                    api.get(`/stat/search?limit=10&year=${currentYear}`)
                ]);

                const userTotal = userRes.data.success ? userRes.data.total : 0;
                const postTotal = postRes.data.success ? postRes.data.total : 0;

                // Fetch Recent Posts for Table
                // Try to fetch actual posts list if possible, otherwise fallback to empty or mock
                let postsList = [];
                try {
                    const postsListRes = await api.get('/api/post?limit=5');
                    postsList = postsListRes.data.success ? postsListRes.data.posts : [];
                } catch (err) {
                    console.warn("Could not fetch recent posts list:", err);
                }

                setStats({
                    users: userTotal,
                    posts: postTotal,
                    likes: 45231, // Mock for now or fetch from like stats
                    engagement: 68.4 // Mock
                });

                // Process Top Search Data for Bar Chart
                if (searchRes.data.success) {
                    const rawData = searchRes.data.data || [];
                    // Transform for chart
                    const chartData = rawData.map(item => ({
                        name: item.keyword,
                        value: item.count,
                        color: '#3b82f6' // Default blue
                    })).slice(0, 10);

                    // Add colors gradient simulation
                    const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
                    chartData.forEach((item, index) => {
                        item.color = colors[index % colors.length];
                    });

                    setTopSearchData(chartData);
                }

                setRecentPosts(postsList);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen text-amber-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Facecook Dashboard</h2>
                <p className="text-gray-500 mt-1">Chào mừng trở lại! Đây là tổng quan về hoạt động trong năm {new Date().getFullYear()}.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Posts"
                    value={stats.posts.toLocaleString()}
                    icon={FileText}
                    trend={12.5}
                />
                <StatsCard
                    title="Total Users"
                    value={stats.users.toLocaleString()}
                    icon={Users}
                    trend={15.2}
                />
                <StatsCard
                    title="Total Likes, comments"
                    value={stats.likes.toLocaleString()}
                    icon={Heart}
                    trend={20.1}
                />
                <StatsCard
                    title="Engagement Rate"
                    value={`${stats.engagement}%`}
                    icon={Activity}
                    trend={5.3}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Search Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Top từ khóa tìm kiếm</h3>
                    <p className="text-sm text-gray-500 mb-6">Những từ khóa tìm kiếm nhiều trong năm {new Date().getFullYear()}</p>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={topSearchData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topSearchData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Personalization Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Số lượt cá nhân hóa bằng AI</h3>
                    <p className="text-sm text-gray-500 mb-6">Tổng số lượt theo khung 24 giờ</p>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={aiData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="val1" name="21-Jun" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="val2" name="Equinox" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="val3" name="21-Dec" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Posts Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Bài Đăng Gần Đây</h3>
                        <p className="text-sm text-gray-500">Các bài đăng món ăn mới nhất</p>
                    </div>
                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Post ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người Đăng</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Món Ăn</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Likes</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentPosts.map((post) => (
                                <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{post._id.slice(-5)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{post.author?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{post.title || post.content?.slice(0, 30) || 'No Title'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{post.numLikes || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                                            Hoạt động
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                            {recentPosts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Chưa có bài đăng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
