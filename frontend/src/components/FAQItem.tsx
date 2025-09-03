'use client';

import { useState } from 'react';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="faq-toggle w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-800">{question}</h3>
          <i
            className={`fas fa-chevron-down text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          ></i>
        </div>
      </button>
      <div
        className={`faq-content px-6 pb-4 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <div className="text-gray-600">{children}</div>
      </div>
    </div>
  );
};

export default FAQItem;
