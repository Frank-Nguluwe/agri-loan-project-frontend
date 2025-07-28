export interface Application {
  application_id: string;
  application_date: string;
  status: 'pending' | 'approved' | 'rejected';
  crop_type: string;
  predicted_amount: number;        
  approved_amount: number | null; 
  farm_size_hectares: number;
}

export interface FarmerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  national_id: string;
  farm_size: number;
  crops: string[];
  joined_date: string;
}

export interface YieldHistory {
  year: number;
  season: string;
  crop: string;
  yield_amount: number;
  unit: string;
}