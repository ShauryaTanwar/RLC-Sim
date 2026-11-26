import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { configure } from '@testing-library/dom';

configure({ getElementError: (message, container) => new Error(`${message}\nUI: ${(container.textContent || container.body?.textContent || '').slice(-4500)}`) });

afterEach(cleanup);
