import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentPlusIcon, 
  MagnifyingGlassIcon,
  TagIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import materialService from '../../services/materialService';

const MaterialsList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialService.getAllMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = async (id) => {
    try {
      await materialService.deleteMaterial(id);
      setMaterials(materials.filter(material => material._id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  // Extract all unique tags from materials
  const allTags = Array.from(
    new Set(
      materials.flatMap(material => material.tags || [])
    )
  );

  // Filter materials based on search term and selected tag
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchTerm || 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || 
      (material.tags && material.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
        <Link
          to="/materials/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Material
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tag filter */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex flex-wrap gap-2">
              <button
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  !selectedTag 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedTag('')}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    selectedTag === tag
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedTag(tag)}
                >
                  <TagIcon className="mr-1 h-4 w-4" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Materials list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredMaterials.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredMaterials.map(material => (
                <li key={material._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
                          <DocumentPlusIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/materials/${material._id}`}
                            className="text-lg font-medium text-indigo-600 hover:text-indigo-900"
                          >
                            {material.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {material.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex space-x-2">
                          <Link
                            to={`/materials/edit/${material._id}`}
                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <PencilIcon className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          <button
                            onClick={() => setShowDeleteConfirm(material._id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <TrashIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="flex flex-wrap mt-2 gap-1">
                          {material.tags && material.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(material.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delete confirmation */}
                  {showDeleteConfirm === material._id && (
                    <div className="px-4 py-3 bg-red-50 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-red-700">
                          Are you sure you want to delete this material? This action cannot be undone.
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(material._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No study materials found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedTag
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating a new study material'}
              </p>
              {!searchTerm && !selectedTag && (
                <div className="mt-6">
                  <Link
                    to="/materials/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Add Material
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialsList;