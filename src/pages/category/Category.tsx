import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { fetchCategories, deleteCategory } from '../../features/categorySlice';
import { HiEye, HiPencil, HiTrash, HiPlus, HiMagnifyingGlass, HiSparkles } from 'react-icons/hi2';
import { MdCategory, MdInventory, MdViewList, MdDescription } from 'react-icons/md';
import { FaLayerGroup, FaBoxes, FaIndustry, FaBarcode, FaCubes } from 'react-icons/fa';
import { BiCategory, BiPackage } from 'react-icons/bi';

const CategoryRow: React.FC<{
  category: any;
  level: number;
  expandedCategories: string[];
  toggleExpand: (id: string) => void;
  handleDeleteClick: (id: string) => void;
  searchTerm: string;
}> = ({
  category,
  level,
  expandedCategories,
  toggleExpand,
  handleDeleteClick,
  searchTerm,
}) => {
  const indent = level * 4;
  const bgColor =
    level === 0
      ? ''
      : level === 1
        ? 'bg-gray-50 dark:bg-gray-800/30'
        : 'bg-gray-100 dark:bg-gray-700/30';

  const filteredSubcategories =
    category.subcategories?.filter((sub: any) => {
      const matchesSub =
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.desc?.toLowerCase().includes(searchTerm.toLowerCase());

      const hasMatchingChildren = sub.subcategories?.some(
        (child: any) =>
          child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.desc?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return matchesSub || hasMatchingChildren;
    }) || [];

  return (
    <React.Fragment>
      <div className={`p-4 border-b border-white/20 ${bgColor}`}>
        <div className="grid grid-cols-7 gap-3 items-center">
          {/* Name Column */}
          <div className="flex items-center gap-2" style={{ paddingLeft: `${indent * 16}px` }}>
            <BiCategory className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-slate-800 font-medium truncate" title={category.name}>
              {level > 0 && '↳ '}
              {category.name}
            </span>
          </div>
          
          {/* HSN Code Column */}
          <div className="text-slate-700 text-sm">
            {category.useParentHsnCode ? (
              <span className="italic text-slate-500">(Parent's HSN)</span>
            ) : (
              category.hsn_code || category.hsnCode || '-'
            )}
          </div>
          
          {/* Description Column */}
          <div className="text-slate-700 text-sm truncate" title={category.description || category.desc}>
            {category.description || category.desc || '-'}
          </div>
          
          {/* Primary Unit Column */}
          <div className="text-slate-700 text-sm">
            {category.primary_unit || category.primaryUnit || '-'}
          </div>
          
          {/* Secondary Unit Column */}
          <div className="text-slate-700 text-sm">
            {category.secondary_unit || category.secondaryUnit || '-'}
          </div>
          
          {/* Subcategories Column */}
          <div className="text-slate-700 text-sm">
            {filteredSubcategories.length > 0 ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <span>{filteredSubcategories.length}</span>
                <span>{expandedCategories.includes(category.id) ? '▼' : '►'}</span>
              </button>
            ) : (
              <span>{level === 0 ? 'None' : '-'}</span>
            )}
          </div>
          
          {/* Actions Column */}
          <div className="flex items-center justify-end space-x-2">
            <Link
              to={`/edit-category/${category.id}`}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 hover:scale-110 transform"
            >
              <HiPencil className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleDeleteClick(category.id)}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 hover:scale-110 transform"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {expandedCategories.includes(category.id) &&
        filteredSubcategories.map((subcategory: any) => (
          <CategoryRow
            key={subcategory.id}
            category={subcategory}
            level={level + 1}
            expandedCategories={expandedCategories}
            toggleExpand={toggleExpand}
            handleDeleteClick={handleDeleteClick}
            searchTerm={searchTerm}
          />
        ))}
    </React.Fragment>
  );
};

const Category: React.FC = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(
    (state: any) => state.category
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const result = await dispatch(
        deleteCategory(confirmDelete) as any
      ).unwrap();
      toast.success(result.message);
      setConfirmDelete(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories =
    categories
      ?.filter((category: any) => !category.parent_id) // Only parent categories
      .map((category: any) => {
        const matchParent =
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.primary_unit
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          category.secondary_unit
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const hasMatchingDescendants = (cat: any): boolean => {
          if (!cat.subcategories) return false;
          return cat.subcategories.some((sub: any) => {
            const matches =
              sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              sub.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              sub.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              sub.primary_unit
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              sub.secondary_unit
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
            return matches || hasMatchingDescendants(sub);
          });
        };

        const filteredSubcategories = hasMatchingDescendants(category)
          ? category.subcategories
          : [];

        if (matchParent || filteredSubcategories?.length > 0) {
          return {
            ...category,
            subcategories: filteredSubcategories || [],
          };
        }

        return null;
      })
      .filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-4 lg:p-6 pt-6 sm:pt-8 lg:pt-12 pb-6 sm:pb-8 lg:pb-12">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                  <MdViewList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    Categories
                  </h1>
                  <p className="text-slate-600 text-sm lg:text-base">Manage your product categories</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-2xl border border-white/50 bg-white/60 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-sm placeholder-slate-500 shadow-sm"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                
                <Link
                  to="/add-category"
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-sm sm:text-base whitespace-nowrap"
                >
                  <HiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden xs:inline">Add Category</span>
                  <span className="xs:hidden">Add</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No categories found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm ? 'Try a different search term.' : 'Add your first category to get started'}
            </p>
            <Link
              to="/add-category"
              className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add First Category
            </Link>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-white/30 p-4">
                <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <MdCategory className="w-4 h-4 text-blue-600" />
                    <span>Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBarcode className="w-4 h-4 text-blue-600" />
                    <span>HSN Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdDescription className="w-4 h-4 text-blue-600" />
                    <span>Description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCubes className="w-4 h-4 text-blue-600" />
                    <span>Primary Unit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BiPackage className="w-4 h-4 text-blue-600" />
                    <span>Secondary Unit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaLayerGroup className="w-4 h-4 text-blue-600" />
                    <span>Subcategories</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <HiSparkles className="w-4 h-4 text-blue-600" />
                    <span>Actions</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-white/20">
                {filteredCategories.map((category: any) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    level={0}
                    expandedCategories={expandedCategories}
                    toggleExpand={toggleExpand}
                    handleDeleteClick={handleDeleteClick}
                    searchTerm={searchTerm}
                  />
                ))}
              </div>
            </div>
            
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-white/20">
              {filteredCategories.map((category: any) => (
                <div key={category.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <BiCategory className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <h3 className="font-semibold text-slate-800">{category.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/edit-category/${category.id}`}
                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
                      >
                        <HiPencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(category.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-slate-500 text-xs">HSN Code:</span>
                      <div className="text-slate-700">
                        {category.useParentHsnCode ? (
                          <span className="italic text-slate-500">(Parent's HSN)</span>
                        ) : (
                          category.hsn_code || category.hsnCode || '-'
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500 text-xs">Primary Unit:</span>
                      <div className="text-slate-700">{category.primary_unit || category.primaryUnit || '-'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500 text-xs">Secondary Unit:</span>
                      <div className="text-slate-700">{category.secondary_unit || category.secondaryUnit || '-'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500 text-xs">Subcategories:</span>
                      <div className="text-slate-700">
                        {category.subcategories?.length > 0 ? (
                          <button
                            onClick={() => toggleExpand(category.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {category.subcategories.length} {expandedCategories.includes(category.id) ? '▼' : '►'}
                          </button>
                        ) : (
                          'None'
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {(category.description || category.desc) && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <span className="font-medium text-slate-500 text-xs">Description:</span>
                      <div className="text-slate-700 text-sm mt-1">{category.description || category.desc}</div>
                    </div>
                  )}
                  
                  {/* Mobile Subcategories */}
                  {expandedCategories.includes(category.id) && category.subcategories?.map((subcategory: any) => (
                    <div key={subcategory.id} className="mt-3 ml-6 p-3 bg-white/50 rounded-lg border border-white/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BiCategory className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="font-medium text-slate-700">↳ {subcategory.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/edit-category/${subcategory.id}`}
                            className="p-1.5 rounded text-slate-500 hover:text-emerald-600"
                          >
                            <HiPencil className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(subcategory.id)}
                            className="p-1.5 rounded text-slate-500 hover:text-red-600"
                          >
                            <HiTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">HSN:</span>
                          <span className="ml-1 text-slate-700">
                            {subcategory.useParentHsnCode ? '(Parent)' : (subcategory.hsn_code || subcategory.hsnCode || '-')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Desc:</span>
                          <span className="ml-1 text-slate-700">{subcategory.description || subcategory.desc || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                <HiTrash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Category</h3>
              <p className="text-slate-600">Are you sure you want to delete this category? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 rounded-2xl border border-white/50 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
