'use client';

import React from 'react';
import { FiTruck, FiCreditCard, FiShield } from 'react-icons/fi';

const Services = () => {
  const services = [
    {
      icon: <FiTruck size={24} />,
      title: 'Free Shipping',
      description: 'On all orders over $50'
    },
    {
      icon: <FiCreditCard size={24} />,
      title: 'Pay Online',
      description: 'Secure payment options'
    },
    {
      icon: <FiShield size={24} />,
      title: 'Secure Payment',
      description: '100% secure payment'
    }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex items-center justify-center space-x-4 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-gray-900">{service.icon}</div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{service.title}</h3>
                <p className="text-gray-900 text-base">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services; 