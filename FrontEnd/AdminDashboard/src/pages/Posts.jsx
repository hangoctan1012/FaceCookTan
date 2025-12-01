import React, { useState, useEffect } from 'react';
import { Search, Trash2, ExternalLink, MessageSquare, Heart } from 'lucide-react';
import api from '../services/api';

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setError(null);
            // API /posts requires x-user-id header. We use a dummy one for admin view.
            const response = await api.get('/api/post?limit=50', {
                headers: { 'x-user-id': 'admin-view' }
            });
            if (response.data.success) {
                setPosts(Array.isArray(response.data.posts) ? response.data.posts : []);
            } else {
                setError('API returned success: false');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError(error.message || 'Failed to fetch posts');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await api.delete(`/api/post/${id}`);
                setPosts(posts.filter(post => post._id !== id));
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post');
            }
        }
    };

    const filteredPosts = posts.filter(post =>
        (post.caption && post.caption.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.location?.name && post.location.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}. <br />Please ensure backend is running on port 9000 and restart frontend server.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Post Management</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredPosts.map((post) => (
                            <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        {post.media && post.media.length > 0 ? (
                                            <img src={post.media[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                        )}
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs" title={post.caption}>{post.caption || 'No caption'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                        {post.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span className="flex items-center"><Heart size={14} className="mr-1" /> {post.like}</span>
                                        <span className="flex items-center"><MessageSquare size={14} className="mr-1" /> {post.comment}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{post.location?.name || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <ExternalLink size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Posts;
