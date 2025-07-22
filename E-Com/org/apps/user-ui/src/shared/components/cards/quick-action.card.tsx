import React from 'react'

const QuickActionCard = ({
  Icon,
  title,
  description
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex items-start gap-3 hover:shadow-md transition-shadow">
      <Icon className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default QuickActionCard
