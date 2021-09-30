import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from './App';
import axios from 'axios';
import {coins, coinsDetail_1_10, coinsDetail_11_13} from './test_utils';
import { act } from 'react-dom/test-utils';

jest.mock("axios", () => ({
  get: jest.fn((_url, _body) => {
    url = _url;
    body = _body;    
    return Promise.resolve();
  })
}))

test('renders the page with title CoinLizard', () => {
  axios.get.mockImplementation((url) => {
    return Promise.resolve({ data:[] })
  })
  const { getByText } = render(
      <App />
  );

  expect(getByText(/CoinLizard/i)).toBeInTheDocument();
});

test('filter coins by name', () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('/coins/list')) {
      return Promise.resolve({ data: coins })
    } 
    else if (url.includes("coin_11")) {
      return Promise.resolve({ data: coinsDetail_11_13 });
    }
    else {
            return Promise.resolve({ data: coinsDetail_1_10 });
          }
  })
  let screen;
  act(() => {
    screen = render(<App />);
  })
  
  const txtField = screen.getByTestId("searchTxtField");
  const searchBtn = screen.getByTestId("searchBtn");
  act(() => {
    fireEvent.change(txtField, {target: {value: "coin_name_11"}});
    fireEvent.click(searchBtn);
  })
  // since we set a timeout in the code being tested to fake loading time, we need to add timeout here
  setTimeout(() => {
    expect(screen.getByText(/coin_name_11/i)).toBeInTheDocument();
  }, 2000)
})