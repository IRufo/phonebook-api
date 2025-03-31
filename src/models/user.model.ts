export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: "user" | "admin" | "super-admin";
    created_at: Date;
    updated_at: Date;
  }
  