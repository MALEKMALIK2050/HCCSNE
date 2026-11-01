import { clearTokenCookie } from '@/lib/auth';
export default function handler(req, res) {
  clearTokenCookie(res);
  return res.status(200).json({ success: true });
}
