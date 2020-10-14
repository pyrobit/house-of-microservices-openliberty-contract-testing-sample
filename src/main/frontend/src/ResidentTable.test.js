/**
 */

import React from 'react';
import { render, waitForElement } from '@testing-library/react';
const { pactWith } = require('jest-pact');
import expectedResult from '../../../resources/resident.json';

import ResidentTable from './Components/ResidentTable';

// Workaround for CORS complaints; see https://github.com/axios/axios/issues/2654
import axios from 'axios';
axios.defaults.adapter = require('axios/lib/adapters/http');

describe('unit tests', () => {
  test('renders a suitable title', async () => {
    const { getByText } = render(<ResidentTable />);
    const titleElement = getByText(/House Web Service/i);
    expect(titleElement).toBeInTheDocument();
    // Because we don't need to wait for a re-render, this will cause a warning about state changes after the test finishes
  });
});

const port = 9080;

describe('contract tests', () => {
  pactWith(
    {
      port: port,
      consumer: 'App',
      provider: 'House',
    },
    (provider) => {
      beforeEach(() => {
        const interaction = {
          uponReceiving: 'a request for the resident',
          withRequest: {
            method: 'GET',
            path: '/resident',
            headers: { Accept: 'application/json' },
          },
          willRespondWith: {
            status: 201,
            headers: {
              'Content-Type': 'application/json',
            },
            body: expectedResult,
          },
        };
        return provider.addInteraction(interaction);
      });

      test('includes the body part', async () => {
        const { queryByText } = render(<ResidentTable />);
        const el = await waitForElement(() => queryByText(/album_one/i));
        expect(el).toBeTruthy();
      });
    }
  );
});