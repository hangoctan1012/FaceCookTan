import React, { useState, useEffect } from 'react';
import { Search, Trash2, ExternalLink, Clock, Users } from 'lucide-react';
import api from '../services/api';

const Recipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            setError(null);
            const response = await api.get('/api/recipe');
            if (response.data.success) {
                setRecipes(Array.isArray(response.data.recipes) ? response.data.recipes : []);
            } else {
                setError('API returned success: false');
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setError(error.message || 'Failed to fetch recipes');
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            try {
                await api.delete(`/api/recipe/${id}`);
                setRecipes(recipes.filter(recipe => recipe._id !== id));
            } catch (error) {
                console.error('Error deleting recipe:', error);
                alert('Failed to delete recipe');
            }
        }
    };

    const filteredRecipes = recipes.filter(recipe =>
        (recipe.name && recipe.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}. <br />Please ensure backend is running on port 9000 and restart frontend server.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Recipe Management</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search recipes..."
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
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipe</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ration</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredRecipes.map((recipe) => (
                            <tr key={recipe._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        {recipe.thumbnail ? (
                                            <img src={recipe.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                        )}
                                        <p className="text-sm font-medium text-gray-900">{recipe.name}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{recipe.description}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock size={14} className="mr-1" /> {recipe.time}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-sm text-gray-500 font-medium">
                                        <Users size={14} className="mr-1" /> {recipe.ration} people
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <ExternalLink size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(recipe._id)}
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

export default Recipes;
