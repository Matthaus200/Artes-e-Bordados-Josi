import { Product, Category } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Bolo de Aniversário Floral',
    description: 'Bolo de baunilha com recheio de frutas vermelhas, decorado com flores de açúcar artesanais.',
    price: 150.00,
    category: Category.BOLO,
    imageUrl: 'https://picsum.photos/400/400?random=1'
  },
  {
    id: '2',
    name: 'Caderno Personalizado Vintage',
    description: 'Caderno A5 com capa dura encapada em tecido floral vintage e nome bordado a mão.',
    price: 45.00,
    category: Category.CADERNO,
    imageUrl: 'https://picsum.photos/400/400?random=2'
  },
  {
    id: '3',
    name: 'Caneca "Melhor Mãe"',
    description: 'Caneca de porcelana personalizada com arte exclusiva e nome. Ideal para presentes.',
    price: 35.00,
    category: Category.CANECA,
    imageUrl: 'https://picsum.photos/400/400?random=3'
  },
  {
    id: '4',
    name: 'Bastidor Bordado Porta Maternidade',
    description: 'Bastidor de 20cm com nome do bebê e elementos naturais bordados a mão.',
    price: 120.00,
    category: Category.BORDADO,
    imageUrl: 'https://picsum.photos/400/400?random=4'
  }
];

export const WHATSAPP_NUMBER = "5547996444364";