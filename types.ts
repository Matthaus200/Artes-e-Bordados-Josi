export enum Category {
  BORDADO = 'Bordados',
  CADERNO = 'Cadernos',
  CANECA = 'Canecas',
  OUTROS = 'Outros'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
}

export type ViewState = 'HOME' | 'ADMIN' | 'PRIVACY';