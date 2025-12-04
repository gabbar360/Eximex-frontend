import React from 'react';

interface ProductData {
  productId: string;
  name: string;
  productName?: string;
  hsCode: string;
  description: string;
  quantity: number;
  rate: number;
  unit: string;
  total: number;
  totalWeight?: number;
  convertedQuantity?: number;
  categoryId?: string;
  subcategoryId?: string;
}

interface ProductTableProps {
  addedProducts: ProductData[];
  categories: any[];
  products: any[];
  currency: string;
  editingProductIndex: number | null;
  onEditProduct: (index: number) => void;
  onDeleteProduct: (index: number) => void;
  formatCurrency: (value: number, currency?: string) => string;
  calculateTotalWeight: (
    productId: string,
    quantity: string,
    unit: string
  ) => number;
  calculateGrossWeight: (products: ProductData[]) => number;
  getCurrentTotals: () => { weight: number; volume: number };
}

const ProductTable: React.FC<ProductTableProps> = ({
  addedProducts,
  categories,
  products,
  currency,
  editingProductIndex,
  onEditProduct,
  onDeleteProduct,
  formatCurrency,
  calculateTotalWeight,
  calculateGrossWeight,
  getCurrentTotals,
}) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Added Products ({addedProducts.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Category
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Product
              </th>
              <th className="px-3 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                Quantity
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Unit
              </th>
              <th className="px-3 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                Weight (KG)
              </th>
              <th className="px-3 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                Rate
              </th>
              <th className="px-3 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                Total
              </th>
              <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {addedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No products added yet. Click "Add Product" to add your first
                  product.
                </td>
              </tr>
            ) : (
              addedProducts.map((product, index) => {
                const category = categories.find(
                  (c) => c.id.toString() === product.categoryId?.toString()
                );

                return (
                  <tr
                    key={index}
                    className={
                      editingProductIndex === index
                        ? 'bg-yellow-50 dark:bg-yellow-900'
                        : ''
                    }
                  >
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {category?.name ||
                        category?.categoryName ||
                        'sugarcane bagasse'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {(() => {
                        const foundProduct = products.find(
                          (p) =>
                            p.id.toString() === product.productId.toString()
                        );

                        return (
                          foundProduct?.name ||
                          foundProduct?.productName ||
                          product.name ||
                          product.productName ||
                          `Product ${product.productId}` ||
                          'Unknown Product'
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-gray-100">
                      {product.quantity}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {product.unit || 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-gray-100">
                      {(() => {
                        const weight =
                          product.totalWeight ||
                          calculateTotalWeight(
                            product.productId,
                            product.quantity.toString(),
                            product.unit
                          );
                        return weight > 0 ? weight.toFixed(2) : 'N/A';
                      })()}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-gray-100">
                      {formatCurrency(product.rate, currency)}
                    </td>
                    <td className="px-3 py-2 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(product.total)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditProduct(index)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit product"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete product"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {addedProducts.length > 0 && (
            <tfoot className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100"
                >
                  Net Weight:
                </td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                  {getCurrentTotals().weight.toFixed(2)} KG
                </td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(
                    addedProducts.reduce((sum, p) => sum + p.total, 0),
                    currency
                  )}
                </td>
                <td className="px-3 py-2"></td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100"
                >
                  Gross Weight:
                </td>
                <td className="px-3 py-2 text-right font-semibold text-blue-600 dark:text-blue-400">
                  {calculateGrossWeight(addedProducts).toFixed(2)} KG
                </td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
