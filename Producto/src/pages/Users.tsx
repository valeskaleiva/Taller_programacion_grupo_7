import { useState, useEffect } from 'react';
import { User } from '../types';
import { mockApi } from '../services/mockApi';
import { Table } from '../components/ui/Table';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mockApi.getUsers().then(res => {
      setUsers(res.data);
      setIsLoading(false);
    });
  }, []);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'username', header: 'Usuario' },
    { key: 'email', header: 'Email' },
    {
      key: 'role', header: 'Rol',
      render: (row: User) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          row.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.role}
        </span>
      ),
    },
    { key: 'createdAt', header: 'Creado' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuarios</h1>
      <Table columns={columns} data={users} isLoading={isLoading} emptyMessage="No hay usuarios" />
    </div>
  );
}
