// Helper functions for form navigation with order selection

export const navigateToForm = (navigate: any, formType: string, orderId?: number) => {
  const routes = {
    shipment: '/orders/shipment',
    packingList: '/orders/packing-list', 
    vgm: '/orders/vgm'
  };

  const route = routes[formType as keyof typeof routes];
  if (!route) {
    console.error('Invalid form type:', formType);
    return;
  }

  if (orderId) {
    navigate(`${route}/${orderId}`);
  } else {
    navigate(route);
  }
};

export const getFormTitle = (formType: string, isEdit: boolean) => {
  const titles = {
    shipment: isEdit ? 'Edit Shipment' : 'Create Shipment',
    packingList: isEdit ? 'Edit Packing List' : 'Create Packing List',
    vgm: isEdit ? 'Edit VGM Document' : 'Create VGM Document'
  };

  return titles[formType as keyof typeof titles] || 'Form';
};

export const validateOrderSelection = (selectedOrder: any, isEdit: boolean) => {
  if (!isEdit && !selectedOrder) {
    return 'Please select an order first';
  }
  return null;
};