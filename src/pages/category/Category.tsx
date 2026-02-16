import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { fetchCategories, deleteCategory } from '../../features/categorySlice';
import PageMeta from '../../components/common/PageMeta';
import {
  HiPencil,
  HiTrash,
  HiPlus,
  HiMagnifyingGlass,
  HiSparkles,
} from 'react-icons/hi2';
import { MdCategory, MdViewList, MdDescription } from 'react-icons/md';
import { FaLayerGroup, FaBarcode, FaCubes } from 'react-icons/fa';
import { BiCategory, BiPackage } from 'react-icons/bi';
import { Pagination } from 'antd';
import { useDebounce } from '../../utils/useDebounce';

const CategoryRow: React.FC<{
  category: Record<string, unknown>;
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
    (category.subcategories as Record<string, unknown>[])?.filter(
      (sub: Record<string, unknown>) => {
        const matchesSub =
          (sub.name as string)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (sub.hsn_code as string)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (sub.desc as string)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const hasMatchingChildren = (
          sub.subcategories as Record<string, unknown>[]
        )?.some(
          (child: Record<string, unknown>) =>
            (child.name as string)
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (child.hsn_code as string)
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (child.desc as string)
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

        return matchesSub || hasMatchingChildren;
      }
    ) || [];

  return (
    <React.Fragment>
      <div className={`p-4 border-b border-white/20 ${bgColor}`}>
        <div className="grid grid-cols-7 gap-3 items-center">
          {/* Name Column */}
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${indent * 16}px` }}
          >
            <BiCategory className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <span
              className="text-slate-800 font-medium truncate"
              title={category.name as string}
            >
              {level > 0 && '↳ '}
              {category.name as string}
            </span>
          </div>

          {/* HSN Code Column */}
          <div className="text-slate-700 text-sm">
            {(category.useParentHsnCode as boolean) ? (
              <span className="italic text-slate-500">(Parent's HSN)</span>
            ) : (
              (category.hsn_code as string) ||
              (category.hsnCode as string) ||
              '-'
            )}
          </div>

          {/* Description Column */}
          <div
            className="text-slate-700 text-sm truncate"
            title={
              (category.description as string) || (category.desc as string)
            }
          >
            {(category.description as string) ||
              (category.desc as string) ||
              '-'}
          </div>

          {/* Primary Unit Column */}
          <div className="text-slate-700 text-sm">
            {(category.primary_unit as string) ||
              (category.primaryUnit as string) ||
              '-'}
          </div>

          {/* Secondary Unit Column */}
          <div className="text-slate-700 text-sm">
            {(category.secondary_unit as string) ||
              (category.secondaryUnit as string) ||
              '-'}
          </div>

          {/* Subcategories Column */}
          <div className="text-slate-700 text-sm">
            {filteredSubcategories.length > 0 ? (
              <button
                onClick={() => toggleExpand(category.id as string)}
                className="text-slate-600 hover:text-slate-800 font-medium flex items-center gap-1"
              >
                <span>{filteredSubcategories.length}</span>
                <span>
                  {expandedCategories.includes(category.id as string)
                    ? '▼'
                    : '►'}
                </span>
              </button>
            ) : (
              <span>{level === 0 ? 'None' : '-'}</span>
            )}
          </div>

          {/* Actions Column */}
          <div className="flex items-center justify-end space-x-2">
            <Link
              to={`/edit-category/${category.id as string}`}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
            >
              <HiPencil className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleDeleteClick(category.id as string)}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {expandedCategories.includes(category.id as string) &&
        filteredSubcategories.map((subcategory: Record<string, unknown>) => (
          <CategoryRow
            key={subcategory.id as string}
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
  const { categories, loading, pagination } = useSelector(
    (state: {
      category: {
        categories: Record<string, unknown>[];
        loading: boolean;
        pagination: { total: number };
      };
    }) => state.category
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(
      fetchCategories({
        page: 1,
        limit: 10,
        search: '',
      }) as unknown as Record<string, unknown>
    );
  }, [dispatch]);

  const { debouncedCallback: debouncedSearch } = useDebounce(
    (value: string) => {
      dispatch(
        fetchCategories({
          page: 1,
          limit: pageSize,
          search: value,
        }) as unknown as Record<string, unknown>
      );
    },
    500
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const result = await dispatch(
        deleteCategory(confirmDelete) as unknown as Record<string, unknown>
      ).unwrap();
      setConfirmDelete(null);

      dispatch(
        fetchCategories({
          page: currentPage,
          limit: pageSize,
          search: searchTerm,
        }) as unknown as Record<string, unknown>
      );

      toast.success(result.message);
    } catch (error: unknown) {
      toast.error(error as string);
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // const filteredCategories =
  //   categories?.filter((category: any) => !category.parent_id) || [];

  return (
    <>
      <PageMeta
        title="Categories - EximEx | Product Category Management"
        description="Organize and manage product categories for your import-export business. Create hierarchical category structures with HSN codes and units."
      />
      <div className="min-h-screen bg-gray-50">
        <div className="p-2 lg:p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                    <MdViewList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                      Categories
                    </h1>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 sm:flex-none">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  <Link
                    to="/add-category"
                    className="inline-flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg text-sm sm:text-base whitespace-nowrap"
                  >
                    <HiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden xs:inline">Add Category</span>
                    <span className="xs:hidden">Add Category</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Categories List */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 && !loading ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
              <div className="w-10 h-10 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                <HiMagnifyingGlass className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No categories found
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm
                  ? 'Try a different search term.'
                  : 'Add your first category to get started'}
              </p>
              {/* <Link
              to="/add-category"
              className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add First Category
            </Link> */}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                {/* Table Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <MdCategory className="w-4 h-4 text-slate-600" />
                      <span>Name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBarcode className="w-4 h-4 text-slate-600" />
                      <span>HSN Code</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdDescription className="w-4 h-4 text-slate-600" />
                      <span>Description</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCubes className="w-4 h-4 text-slate-600" />
                      <span>Primary Unit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BiPackage className="w-4 h-4 text-slate-600" />
                      <span>Secondary Unit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaLayerGroup className="w-4 h-4 text-slate-600" />
                      <span>Subcategories</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <HiSparkles className="w-4 h-4 text-slate-600" />
                      <span>Actions</span>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-white/20">
                  {categories.map((category: Record<string, unknown>) => (
                    <CategoryRow
                      key={category.id as string}
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

              {/* Tablet/Mobile Table View with Horizontal Scroll */}
              <div className="lg:hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-gray-200 p-4">
                      <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <MdCategory className="w-4 h-4 text-slate-600" />
                          <span>Name</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaBarcode className="w-4 h-4 text-slate-600" />
                          <span>HSN Code</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MdDescription className="w-4 h-4 text-slate-600" />
                          <span>Description</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCubes className="w-4 h-4 text-slate-600" />
                          <span>Primary Unit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BiPackage className="w-4 h-4 text-slate-600" />
                          <span>Secondary Unit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaLayerGroup className="w-4 h-4 text-slate-600" />
                          <span>Subcategories</span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <HiSparkles className="w-4 h-4 text-slate-600" />
                          <span>Actions</span>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-white/20">
                      {categories.map((category: Record<string, unknown>) => (
                        <CategoryRow
                          key={category.id as string}
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
                </div>
              </div>
            </div>
          )}

          {/* Simple Pagination */}
          {pagination.total > 0 && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                total={pagination.total}
                pageSize={pageSize}
                onChange={(page) => {
                  setCurrentPage(page);
                  dispatch(
                    fetchCategories({
                      page: page,
                      limit: pageSize,
                      search: searchTerm,
                    }) as unknown as Record<string, unknown>
                  );
                }}
              />
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                  <HiTrash className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Delete Category
                </h3>
                <p className="text-slate-600">
                  Are you sure you want to delete this category? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Category;
