import { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { DashboardStats } from '../types';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mockApi.getDashboardStats().then(res => {
      setStats(res.data);
      setIsLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Total Productos', value: stats?.totalProducts ?? 0, icon: '🎴', color: 'bg-blue-500' },
    { label: 'Total Ventas', value: stats?.totalSales ?? 0, icon: '💰', color: 'bg-green-500' },
    { label: 'Usuarios', value: stats?.totalUsers ?? 0, icon: '👥', color: 'bg-purple-500' },
    { label: 'Ingresos', value: `$${(stats?.revenue ?? 0).toFixed(2)}`, icon: '📈', color: 'bg-orange-500' },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-500">Cargando...</p></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <div className={`${card.color} text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
