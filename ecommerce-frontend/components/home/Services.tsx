'use client';

import React from 'react';
import { FiTruck, FiCreditCard, FiShield } from 'react-icons/fi';

const Services = () => {
  const services = [
    {
      icon: <FiTruck size={24} />,
      title: 'Giao hàng nhanh',
      description: 'Miền Bắc từ 2-3 ngày , Miền Nam từ 3-5 ngày'
    },
    {
      icon: <FiCreditCard size={24} />,
      title: 'Thanh Toán Online',
      description: 'Nhiều lựa chọn thanh toán'
    },
    {
      icon: <FiShield size={24} />,
      title: 'Bảo mật cao',
      description: '100% An Toàn khi toán'
    }
  ];

  return (
    <div className="bg-white py-16 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-6"
            >
              <div className="text-black">{service.icon}</div>
              <div>
                <h3 className="font-medium text-sm uppercase tracking-wide text-black mb-1">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services; 