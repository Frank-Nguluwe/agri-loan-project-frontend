
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { LoanApplicationForm } from '@/components/farmer/LoanApplicationForm';

const LoanApplicationPage = () => {
  return (
    <Layout title="New Loan Application">
      <LoanApplicationForm />
    </Layout>
  );
};

export default LoanApplicationPage;
