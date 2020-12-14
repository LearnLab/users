const request = require('supertest');
const app = require('../../app');

const userToCreate = {
    "data": {
        "type": "users",
        "attributes": {
            "username": "0325-diego",
            "email": "0325.diego@gmail.com",
            "name": "Diego Castillo Giraldo"
        }
    }
};

describe('POST /api/v1/users', () => {

    it('Should send a response with top level fields as required by the json:api specification', async () => {
        const res = await request(app)
              .post('/api/v1/users')
              .type('application/vnd.api+json')
              .send({
                  "data": {
                      "type": "users",
                      "attributes": {
                          "username": "aleja",
                          "password": "",
                          "email": "aleja-rojas20@hotmail.com",
                          "name": "Alejandra Rojas López"
                      }
                  }
              });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('data');

        expect(res.body.data).toHaveProperty('type');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('attributes');
        expect(res.body.data).toHaveProperty('links');
    });

    it('Should return the same object that was created', async () => {

        const res = await request(app)
              .post('/api/v1/users')
              .type('application/vnd.api+json')
              .send({
                  "data": {
                      "type": "users",
                      "attributes": {
                          "username": "aleja",
                          "email": "aleja-rojas20@hotmail.com",
                          "name": "Alejandra Rojas López"
                      }
                  }
              });

        expect(res.body.data.attributes).toHaveProperty('username');
        expect(res.body.data.attributes.username).toEqual(userToCreate.data.attributes.username);

        expect(res.body.data.attributes).toHaveProperty('email');
        expect(res.body.data.attributes.email).toEqual(userToCreate.data.attributes.email);

        expect(res.body.data.attributes).toHaveProperty('name');
        expect(res.body.data.attributes.name).toEqual(userToCreate.data.attributes.name);

    });

});
