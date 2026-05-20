export interface Candidate {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  position: string;
  branch: string;
  experience: string;
  note: string;
  createdAt: string;
  cvName?: string;
  cvData?: string; // base64 representation or data URL
}
