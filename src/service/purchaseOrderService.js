import axiosInstance from '../utils/axiosInstance';
import { getCompanyById } from './company';
import { getAllParties } from './partyService';

class PurchaseOrderService {
  // Get form data (company and vendors)
  async getFormData() {
    try {
      console.log('Fetching form data...');

      // Call both APIs in parallel
      const [companyResponse, partiesResponse] = await Promise.allSettled([
        getCompanyById(1), // Get company with ID 1
        getAllParties(),
      ]);

      // Handle company response
      let company = null;
      if (companyResponse.status === 'fulfilled') {
        console.log('Company response:', companyResponse.value);
        company = companyResponse.value.data || companyResponse.value;
      } else {
        console.error('Company API failed:', companyResponse.reason);
      }

      // Handle parties response
      let vendors = [];
      if (partiesResponse.status === 'fulfilled') {
        console.log('Parties response:', partiesResponse.value);
        const allParties = Array.isArray(partiesResponse.value)
          ? partiesResponse.value
          : partiesResponse.value.data || [];
        console.log('All parties array:', allParties);

        vendors = allParties
          .filter((party) => {
            console.log(
              'Checking party:',
              party.companyName,
              'role:',
              party.role,
              'status:',
              party.status
            );
            // Show all parties for now to debug
            return true;
          })
          .map((party) => ({
            id: party.id,
            companyName: party.companyName,
            address: party.address,
            gstNumber: party.gstNumber,
            email: party.email,
            phone: party.phone,
            contactPerson: party.contactPerson,
            role: party.role,
            status: party.status,
          }));
      } else {
        console.error('Parties API failed:', partiesResponse.reason);
      }

      console.log('Final vendors array:', vendors);
      console.log('Total vendors found:', vendors.length);
      console.log('Company data:', company);

      return {
        success: true,
        data: { company, vendors },
      };
    } catch (error) {
      console.error('Error in getFormData:', error);
      throw new Error(error.message || 'Failed to fetch form data');
    }
  }

  // Create purchase order
  async createPurchaseOrder(data) {
    try {
      const response = await axiosInstance.post('/purchase-order', data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to create purchase order'
      );
    }
  }

  // Get all purchase orders
  async getAllPurchaseOrders(params = {}) {
    try {
      const response = await axiosInstance.get('/purchase-order', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch purchase orders'
      );
    }
  }

  // Get purchase order by ID
  async getPurchaseOrderById(id) {
    try {
      const response = await axiosInstance.get(`/purchase-order/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch purchase order'
      );
    }
  }

  // Update purchase order
  async updatePurchaseOrder(id, data) {
    try {
      const response = await axiosInstance.put(`/purchase-order/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update purchase order'
      );
    }
  }

  // Delete purchase order
  async deletePurchaseOrder(id) {
    try {
      const response = await axiosInstance.delete(`/purchase-order/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete purchase order'
      );
    }
  }

  // Download purchase order PDF
  async downloadPurchaseOrderPDF(id) {
    try {
      const response = await axiosInstance.get(`/purchase-order/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to download PDF'
      );
    }
  }
}

export default new PurchaseOrderService();
