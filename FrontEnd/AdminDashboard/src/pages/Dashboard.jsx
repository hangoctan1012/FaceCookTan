import React, { useState, useEffect } from 'react';
import { Users, FileText, Utensils, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatsCard from '../components/StatsCard';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        recipes: 0,
        active: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data in parallel
                const [userRes, postRes, recipeRes] = await Promise.all([
                    api.get('/api/userAdmin/user'),
                    api.get('/api/postAdmin/post'),
                    api.get('/api/recipe')
                ]);

                // Process User Data
                const userTotal = userRes.data.success ? userRes.data.total : 0;
                const userDetails = userRes.data.success ? userRes.data.detail : [];

                // Process Post Data
                const postTotal = postRes.data.success ? postRes.data.total : 0;
                const postDetails = postRes.data.success ? postRes.data.detail : [];

                // Process Recipe Data
                const recipeTotal = recipeRes.data.success && Array.isArray(recipeRes.data.recipes)
                    ? recipeRes.data.recipes.length
                    : 0;

                setStats({
                    users: userTotal,
                    posts: postTotal,
                    recipes: recipeTotal,
                    active: 56 // Mock data for now
                });

                // Merge Data for Charts
                // Create a map of "Year-Month" -> { name, users, posts }
                const dataMap = new Map();

                // Helper to get key
                const getKey = (item) => `${item.year}-${item.month}`;
                const getName = (item) => `T${item.month}/${item.year}`;

                // Add Users to Map
                userDetails.forEach(item => {
                    const key = getKey(item);
                    if (!dataMap.has(key)) {
                        dataMap.set(key, { name: getName(item), users: 0, posts: 0, sortKey: key });
                    }
                    dataMap.get(key).users = item.count;
                });

                // Add Posts to Map
                postDetails.forEach(item => {
                    const key = getKey(item);
                    if (!dataMap.has(key)) {
                        dataMap.set(key, { name: getName(item), users: 0, posts: 0, sortKey: key });
                    }
                    dataMap.get(key).posts = item.count;
                });

                // Convert Map to Array and Sort
                const mergedData = Array.from(dataMap.values())
                    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

                // If no data, provide some empty months for better UI
                if (mergedData.length === 0) {
                    const today = new Date();
                    const month = today.getMonth() + 1;
                    const year = today.getFullYear();
                    mergedData.push({ name: `T${month}/${year}`, users: 0, posts: 0 });
                }

                setChartData(mergedData);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="text-center py-10">Loading dashboard data...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats.users.toLocaleString()}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatsCard
                    title="Total Posts"
                    value={stats.posts.toLocaleString()}
                    icon={FileText}
                    color="bg-purple-500"
                />
                <StatsCard
                    title="Total Recipes"
                    value={stats.recipes.toLocaleString()}
                    icon={Utensils}
                    color="bg-orange-500"
                />
                <StatsCard
                    title="Active Now"
                    value={stats.active.toLocaleString()}
                    icon={Activity}
                    color="bg-green-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">User Growth</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Post Activity Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Post Activity</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="posts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
