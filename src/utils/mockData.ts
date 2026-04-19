// src/utils/mockData.ts

const mockProducts = [
    { id: 1, name: 'Product 1', price: 10.99, category: 'Category A' },
    { id: 2, name: 'Product 2', price: 20.99, category: 'Category B' },
    { id: 3, name: 'Product 3', price: 30.99, category: 'Category A' },
];

const mockUsers = [
    { id: 1, username: 'user1', email: 'user1@example.com'},
    { id: 2, username: 'user2', email: 'user2@example.com'},
    { id: 3, username: 'user3', email: 'user3@example.com'},
];

const mockSales = [
    { id: 1, productId: 1, userId: 1, date: '2026-04-18', amount: 1 },
    { id: 2, productId: 2, userId: 2, date: '2026-04-19', amount: 2 },
    { id: 3, productId: 3, userId: 3, date: '2026-04-19', amount: 1 },
];

export { mockProducts, mockUsers, mockSales };