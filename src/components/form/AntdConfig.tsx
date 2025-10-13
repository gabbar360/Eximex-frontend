import React from 'react';
import { ConfigProvider } from 'antd';

interface AntdConfigProps {
  children: React.ReactNode;
}

const AntdConfig: React.FC<AntdConfigProps> = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6', // Blue-500
          borderRadius: 8,
          fontSize: 14,
        },
        components: {
          DatePicker: {
            activeBorderColor: '#3b82f6',
            hoverBorderColor: '#60a5fa',
            colorBgContainer: 'transparent',
            colorText: 'inherit',
            colorTextPlaceholder: '#9ca3af',
            controlHeight: 44,
            paddingInline: 16,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default AntdConfig;
