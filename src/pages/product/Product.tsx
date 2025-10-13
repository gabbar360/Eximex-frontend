import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchProducts, deleteProduct } from '../../features/productSlice';
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

const Product: React.FC = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(
    (state: any) => state.product
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProducts() as any);
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
        deleteProduct(confirmDelete) as any
      ).unwrap();
      toast.success(result.message);
      setConfirmDelete(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProducts = Array.isArray(products)
    ? products.filter((product: any) =>
        product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  const getProductTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      tiles: 'Tiles',
      bagasse: 'Bagasse',
      fabric: 'Fabric',
      generic: 'Generic',
    };
    return types[type] || type;
  };

  const getUnitLabel = (unit: string) => {
    const units: Record<string, string> = {
      sqm: 'Square Meter',
      kg: 'Kilogram',
      pcs: 'Pieces',
      box: 'Box',
      cbm: 'Cubic Meter',
    };
    return units[unit] || unit;
  };

  return (
    <>
      <PageMeta
        title="Products | EximEx Dashboard"
        description="Manage your products in EximEx Dashboard"
      />
      <PageBreadcrumb pageTitle="Products" />

      <div className="rounded-sm bg-white shadow-default dark:border-strokedark dark:bg-gray-900">
        <div className="py-6 px-4 md:px-6 xl:px-7.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Products
            </h4>
            <Link
              to="/add-product"
              onClick={() => console.log('Add Product clicked')}
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
              Add Product
            </Link>
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full md:w-1/3 rounded-lg border border-gray-300 dark:text-gray-400 bg-transparent py-2 px-4 outline-none focus:border-primary focus:shadow-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mx-4 md:mx-6 xl:mx-7.5">
          <div className="max-w-full overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 dark:text-gray-400">
                  No products found.{' '}
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
                      Product Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      SKU
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Category
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Unit Weight
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Total Weight
                    </TableCell>
                    {/* <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Boxes/Pieces
                    </TableCell> */}
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {product.name}
                          </span>
                          {/* <span className="text-sm text-gray-500">
                            ID: {product.id}
                          </span> */}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {product.sku || 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {product.category?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {product.unitWeight && product.weightUnitType
                          ? `${product.unitWeight} ${product.unitWeightUnit} per ${product.weightUnitType}`
                          : product.weight
                            ? `${product.weight} ${product.weightUnit}`
                            : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {product.totalGrossWeight
                          ? `${product.totalGrossWeight} ${product.totalGrossWeightUnit}`
                          : 'N/A'}
                      </TableCell>
                      {/* <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex flex-col text-xs">
                          {product.totalBoxes && <span>Boxes: {product.totalBoxes}</span>}
                          {product.totalPieces && <span>Pieces: {product.totalPieces}</span>}
                          {!product.totalBoxes && !product.totalPieces && "N/A"}
                        </div>
                      </TableCell> */}
                      <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/edit-product/${product.id}`}
                            className="hover:text-primary"
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="text-blue-500 hover:text-blue-700"
                            />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(product.id)}
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
              Are you sure you want to delete this product? This action cannot
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

export default Product;
