/**
 * PUBLIC_INTERFACE
 * debounce
 * Returns a debounced function that delays invoking fn until after wait ms have elapsed.
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(fn, wait = 400) {
  let t;
  return (...args) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), wait);
  };
}
