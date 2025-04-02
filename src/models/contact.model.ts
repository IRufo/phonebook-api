export interface Contact {
    id: number;
    owner_id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    profile_photo_url?: string;  // Optional field
    created_at: Date;
    updated_at: Date;
  }
  