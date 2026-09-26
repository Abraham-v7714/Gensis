/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

// Mock native HTMLDialogElement methods for JSDOM
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
    this.open = false;
  };
});
