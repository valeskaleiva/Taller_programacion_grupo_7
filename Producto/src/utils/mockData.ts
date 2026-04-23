import { Product, User, Sale } from '../types';

export const mockProducts: Product[] = [
  { id: 1, name: 'Pokemon Booster Pack', price: 10.99, category: 'Pokemon', stock: 50, description: 'Pokemon TCG booster pack' },
  { id: 2, name: 'Magic: The Gathering Draft Booster', price: 20.99, category: 'Magic', stock: 30, description: 'MTG draft booster pack' },
  { id: 3, name: 'Yu-Gi-Oh! Structure Deck', price: 15.99, category: 'Yu-Gi-Oh', stock: 25, description: 'Yu-Gi-Oh structure deck' },
  { id: 4, name: 'Pokemon Elite Trainer Box', price: 49.99, category: 'Pokemon', stock: 15, description: 'Pokemon ETB' },
  { id: 5, name: 'Magic Commander Deck', price: 44.99, category: 'Magic', stock: 20, description: 'MTG Commander precon' },
];

export const mockUsers: User[] = [
  { id: 1, username: 'admin', email: 'admin@tcgstore.com', role: 'admin', createdAt: '2025-01-01' },
  { id: 2, username: 'employee1', email: 'employee1@tcgstore.com', role: 'employee', createdAt: '2025-02-15' },
  { id: 3, username: 'employee2', email: 'employee2@tcgstore.com', role: 'employee', createdAt: '2025-03-10' },
];

export const mockSales: Sale[] = [
  { id: 1, productId: 1, userId: 1, date: '2026-04-18', amount: 2, totalPrice: 21.98 },
  { id: 2, productId: 2, userId: 2, date: '2026-04-19', amount: 1, totalPrice: 20.99 },
  { id: 3, productId: 3, userId: 3, date: '2026-04-19', amount: 3, totalPrice: 47.97 },
  { id: 4, productId: 4, userId: 1, date: '2026-04-20', amount: 1, totalPrice: 49.99 },
  { id: 5, productId: 5, userId: 2, date: '2026-04-21', amount: 2, totalPrice: 89.98 },
];
