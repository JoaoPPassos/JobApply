export class CreateApplicationDTO {
  job_source_url: string;
  source_platform: string;
  user_id: string;
  current_status: string;
  applied_at: Date;
  notes?: string;
  contact: {
    name: string;
    email: string;
    role: string;
  };
}
