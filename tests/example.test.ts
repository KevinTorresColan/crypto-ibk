// Este archivo se mantiene como ejemplo básico de configuración de Jest
// Los tests reales están organizados en la carpeta tests/ replicando la estructura de src/

import { describe, it, expect } from '@jest/globals';

describe('Example Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should check string equality', () => {
    const message = 'Hello, Jest!';
    expect(message).toBe('Hello, Jest!');
  });
});
