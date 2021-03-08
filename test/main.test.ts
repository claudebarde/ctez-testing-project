beforeAll(async () => {
  const result = await TaquiTest.init();
  console.log(result);
});

test("Mock test", () => {
  expect(2 + 2).toEqual(4);
});
