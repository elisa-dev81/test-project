import React from 'react';
import { Container } from '@mui/material';
import GoldCalculator from '../../components/GoldCalculator/GoldCalculator';

const Calculator = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <GoldCalculator />
    </Container>
  );
};

export default Calculator;