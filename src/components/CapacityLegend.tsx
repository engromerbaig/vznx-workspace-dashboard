import { getCapacityInfo } from '@/utils/capacity';

export default function CapacityLegend() {
  const legendItems = [
    { capacity: 30, label: 'Comfortable (<60%)' },
    { capacity: 70, label: 'Moderate (60-80%)' },
    { capacity: 90, label: 'Heavy (>80%)' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 my-6 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Workload Status Guide</h3>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-xs">
        {legendItems.map((item) => {
          const capacityInfo = getCapacityInfo(item.capacity);
          return (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${capacityInfo.color}`}></div>
              <div className="flex flex-col">
                <span className="text-gray-800 font-medium">{capacityInfo.status}</span>
                <span className="text-gray-500">{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Based on task assignment and individual capacity limits
        </p>
      </div>
    </div>
  );
}