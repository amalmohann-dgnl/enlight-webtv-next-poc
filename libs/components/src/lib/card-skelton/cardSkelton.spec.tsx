import React from 'react';
import CardSkelton from './../card-skelton';
import { render } from '@testing-library/react';

describe('CardSkelton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CardSkelton />);
    expect(baseElement).toBeTruthy();
  });
});
