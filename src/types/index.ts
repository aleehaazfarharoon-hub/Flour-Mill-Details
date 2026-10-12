export type Shift = 'Morning' | 'Evening' | 'Night';

export type EmployeeRole =
  | 'Mill Operator'
  | 'Inventory Manager'
  | 'Accountant'
  | 'Manager'
  | 'Laborer'
  | 'Quality Control'
  | 'Head Miller'
  | 'Maintenance Engineer';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  shift: Shift;
  salary: number; // in PKR
  contact?: string;
  joinedDate?: string;
}

export type MaterialCategory = 'Raw Wheat' | 'Finished Flour' | 'By-Product';

export interface Material {
  batchId: string;
  item: string;
  category: MaterialCategory;
  stockTons: number;
  moisturePercent: number; // Safe is generally <13.5%
  glutenPercent: number; // Standard is 24-32%
  proteinPercent?: number;
  ashPercent?: number;
  siloLocation: string;
  maxCapacityTons?: number;
  lastTestedDate?: string;
  status: 'Optimal' | 'Caution' | 'Action Required';
}

export interface Client {
  clientId: string;
  name: string;
  contact: string;
  email?: string;
  city: string;
  creditLimit: number; // in PKR
  outstandingBalance: number; // in PKR
  securityDepositHeld?: number;
  paymentTermsDays?: number;
  status: 'Good Standing' | 'High Utilization' | 'Credit Exceeded';
  lastOrderDate?: string;
}

export type FinancialType = 'Deposit' | 'Loan';

export interface FinancialItem {
  id: string;
  entity: string;
  type: FinancialType;
  amount: number; // in PKR
  interestRate: number; // annual %
  tenureMonths?: number;
  startDate?: string;
  status: 'Active' | 'Settled';
  purpose: string;
}

export interface BlendCalculation {
  hardWheatRatio: number; // 0 - 100
  softWheatRatio: number; // 0 - 100
  targetFlourType: 'Bakery Maida' | 'All Purpose Atta' | 'Biscuit Soft Flour';
}

export interface AdvisoryHistory {
  id: string;
  query: string;
  response: string;
  timestamp: string;
}
