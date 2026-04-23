// Mock Data for Products, Sales, Users, and Inventory Movements

const mockData = {
  products: [
    { id: 1, name: 'Product A', price: 29.99, category: 'Electronics' },
    { id: 2, name: 'Product B', price: 19.99, category: 'Household' },
    { id: 3, name: 'Product C', price: 39.99, category: 'Clothing' }
  ],
  sales: [
    { id: 1, productId: 1, quantity: 2, total: 59.98, date: '2026-04-19' },
    { id: 2, productId: 2, quantity: 1, total: 19.99, date: '2026-04-18' },
    { id: 3, productId: 3, quantity: 5, total: 199.95, date: '2026-04-17' }
  ],
  users: [
    { id: 1, name: 'User One', email: 'userone@example.com' },
    { id: 2, name: 'User Two', email: 'usertwo@example.com' },
    { id: 3, name: 'User Three', email: 'userthree@example.com' }
  ],
  inventoryMovements: [
    { id: 1, productId: 1, movementType: 'in', quantity: 50, date: '2026-04-15' },
    { id: 2, productId: 2, movementType: 'out', quantity: 20, date: '2026-04-18' },
    { id: 3, productId: 3, movementType: 'in', quantity: 30, date: '2026-04-19' }
  ]
};

export default mockData;