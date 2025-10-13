import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { fetchCategories, deleteCategory } from '../../features/categorySlice';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

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
      <TableRow className={bgColor}>
        <TableCell className="px-5 py-3 text-start">
          <span
            className={`text-gray-800 dark:text-white/90`}
            style={{ paddingLeft: `${indent * 4}px` }}
          >
            {level > 0 && '↳ '}
            {category.name}
          </span>
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {category.useParentHsnCode ? (
            <span className="italic">(Using parent's HSN code)</span>
          ) : (
            category.hsn_code
          )}
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {category.description || '-'}
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {category.primary_unit || '-'}
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {category.secondary_unit || '-'}
        </TableCell>

        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {filteredSubcategories.length > 0 ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {filteredSubcategories.length} subcategories{' '}
              {expandedCategories.includes(category.id) ? '▼' : '►'}
            </button>
          ) : level === 0 ? (
            'None'
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
          <div className="flex items-center justify-end gap-2">
            <Link
              to={`/edit-category/${category.id}`}
              className="hover:text-primary"
            >
              <FontAwesomeIcon
                icon={faEdit}
                className="text-blue-500 hover:text-blue-700"
              />
            </Link>
            <button
              onClick={() => handleDeleteClick(category.id)}
              className="hover:text-primary"
            >
              <FontAwesomeIcon
                icon={faTrash}
                className="text-red-500 hover:text-red-700"
              />
            </button>
          </div>
        </TableCell>
      </TableRow>
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
    <>
      <PageMeta
        title="Categories | EximEx Dashboard"
        description="Manage your categories in EximEx Dashboard"
      />
      <PageBreadcrumb pageTitle="Categories" />

      <div className="rounded-sm bg-white shadow-default dark:border-strokedark dark:bg-gray-900">
        <div className="py-6 px-4 md:px-6 xl:px-7.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Categories
            </h4>
            <Link
              to="/add-category"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-opacity-90 dark:text-white"
            >
              <svg className="mr-2" width="16" height="16" viewBox="0 0 16 16">
                <path
                  d="M8 3.33331V12.6666M3.33337 7.99998H12.6667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add Category
            </Link>
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full md:w-1/3 rounded-lg border dark:text-gray-400 border-gray-300 bg-transparent py-2 px-4 outline-none focus:border-primary focus:shadow-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mx-4 md:mx-6 xl:mx-7.5">
          <div className="max-w-full overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 dark:text-gray-400">
                  No categories found.{' '}
                  {searchTerm && 'Try a different search term.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      HSN Code
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Description
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Primary Unit
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Secondary Unit
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Subcategories
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
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
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Confirm Delete
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-md bg-gray-200 py-2 px-4 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-500 py-2 px-4 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Category;
