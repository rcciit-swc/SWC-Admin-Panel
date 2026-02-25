export interface SWCQuery {
  id: string;
  created_at: string;
  user_id: string;
  transaction_screenshot: string | null;
  email_confirmation_receipt: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  viewed_by: string | null;
  viewed_at: string | null;
  transaction_id: string;
}

export interface SWCQueryWithUser extends SWCQuery {
  users: {
    name: string;
    email: string;
    college_roll?: string;
  } | null;
}
