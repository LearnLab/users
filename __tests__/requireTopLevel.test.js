const { INVALID_TOP_LEVEL } = require('../errors');
const RequireTopLevel = require('../middleware/RequireTopLevel');

test('top level "/data" field is required', () => {
  const req = { body: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  RequireTopLevel(req, res, next);
  expect(next.mock.calls.length).toBe(0);
  expect(res.json.mock.calls.length).toBe(1);
  expect(res.json.mock.calls[0][0].errors).toContain(INVALID_TOP_LEVEL);
});

test('top level "/data/type" field is required', () => {
  const req = { body: { data: {} } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  RequireTopLevel(req, res, next);
  expect(next.mock.calls.length).toBe(0);
  expect(res.json.mock.calls.length).toBe(1);
  expect(res.json.mock.calls[0][0].errors).toContain(INVALID_TOP_LEVEL);
});
