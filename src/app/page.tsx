import HomePage from '@/components/HomePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RCCIIT SWC | Student Welfare Committee',
  description:
    'Official admin panel for RCCIIT Student Welfare Committee - Manage events, registrations, and access control',
};

const Page = () => {
  return <HomePage />;
};

export default Page;
