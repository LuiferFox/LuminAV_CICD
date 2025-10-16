import '@testing-library/jest-dom'

// Mock para matchMedia (necesario para librerías como sonner o radix)
if (!window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {}, // deprecated
      removeListener: function () {}, // deprecated
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () { return false },
    }
  }
}
