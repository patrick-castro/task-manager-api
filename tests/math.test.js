const { calculateTip, fahrenheitToCelsius, celsiusToFahrenheit } = require('../src/math');

test('Should calculate total with tip', () => {
    const total = calculateTip(10, 0.3);
    // Expects the number of the total variable to be 13
    expect(total).toBe(13);
});

test('Should calculate total with default tip', () => {
    const total = calculateTip(10);
    expect(total).toBe(12.5);
});

test('Should convert 32F to 0 C', () => {
    const value = fahrenheitToCelsius(32);
    expect(value).toBe(0);
});

test('Should convert 0C to 32F', () => {
    const value = celsiusToFahrenheit(0);
    expect(value).toBe(32);
});

// Async function
test('Async test demo', (done) => {
    setTimeout((params) => {
        expect(2).toBe(2);
        done(); // Called when the execution is done
    }, 2000);
});

// test('Should add two numbers async/await', async () => {
//     const sum = await add(10, 22);
//     expect(sum).toBe(32);
// });
