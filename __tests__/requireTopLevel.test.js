const { INVALID_TOP_LEVEL } = require('../errors');
const RequireTopLevel = require('../middleware/RequireTopLevel');

test('top level structure is required', () => {
  const req = {};
  const res = {
    json: jest.fn(),
  };
  const next = jest.fn();

  RequireTopLevel(req, res, next);
  expect(next.mock.calls.length).toBe(0);
  expect(res.json.mock.calls.length).toBe(1);
  expect(res.json.mock.calls[0][0].errors).toContain(INVALID_TOP_LEVEL);
});
