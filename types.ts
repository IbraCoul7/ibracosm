
export interface Product {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  arrivalDate: string;
  imageUrl: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderSummary {
  items: CartItem[];
  total: number;
  orderId: string;
  customerInfo?: {
    firstName: string;
    lastName: string;
    contact?: string;
    address?: string;
  };
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  orderId: string;
  items: CartItem[];
  total: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    contact?: string;
    address?: string;
  };
  status: OrderStatus;
  date: string;
}

export enum View {
  SHOP = 'SHOP',
  ADMIN_INVENTORY = 'ADMIN_INVENTORY',
  ADMIN_STATS = 'ADMIN_STATS',
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION'
}
