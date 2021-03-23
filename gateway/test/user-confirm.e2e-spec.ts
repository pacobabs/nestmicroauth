import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../src/app.module';
import { userSignupRequestSuccess } from './mocks/user-signup-request-success.mock';

describe('Users Confirm Email (e2e)', () => {
  let app;
  let userToken: string;
  let userConfirmation: any[];

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_DSN, { useNewUrlParser: true });
    await mongoose.connection.dropDatabase();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.init();
  });

  it('/users/ (POST) - should create a valid user', (done) => {
    return request(app.getHttpServer())
      .post('/users/')
      .send(userSignupRequestSuccess)
      .expect(201)
      .end(done);
  });

  it('/users/login (POST) - should create a token for valid credentials', (done) => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send(userSignupRequestSuccess)
      .expect(201)
      .expect((res) => {
        userToken = res.body.data.token;
      })
      .end(done);
  });

  it('/users/ (GET) - should return an unconfirmed user before confirmation', (done) => {
    return request(app.getHttpServer())
      .get('/users/')
      .set('Authorization', userToken)
      .send()
      .expect(200)
      .expect((res) => {
        res.body.data.user.id = 'fake_value';
        res.body.data.user.email = 'fake_value';
      })
      .expect({
        message: 'user_get_by_id_success',
        data: {
          user: {
            email: 'fake_value',
            is_confirmed: false,
            id: 'fake_value',
          },
        },
      })
      .end(done);
  });

  it('/users/confirm/:code (GET) - should fail to confirm with no code', (done) => {
    return request(app.getHttpServer())
      .get('/users/confirm/')
      .send()
      .expect(404)
      .end(done);
  });

  it('/users/confirm/:code (GET) - should fail with invalid code', (done) => {
    return request(app.getHttpServer())
      .get('/users/confirm/test')
      .send()
      .expect(404)
      .expect({
        message: 'user_confirm_not_found',
        data: null,
      })
      .end(done);
  });

  it('/users/confirm/:code (GET) - should succeed with a valid code', async () => {
    const user = await mongoose.connection
      .collection('users')
      .find({
        email: userSignupRequestSuccess.email,
      })
      .toArray();

    userConfirmation = await mongoose.connection
      .collection('user_codes')
      .find({
        user_id: user[0]._id.toString(),
      })
      .toArray();

    return request(app.getHttpServer())
      .get(`/users/confirm/${userConfirmation[0].code}`)
      .send()
      .expect(200)
      .expect({
        message: 'user_confirm_success',

        data: null,
      });
  });

  it('/users/ (GET) - should return a confirmed user after confirmation', (done) => {
    return request(app.getHttpServer())
      .get('/users/')
      .set('Authorization', userToken)
      .send()
      .expect(200)
      .expect((res) => {
        res.body.data.user.id = 'fake_value';
        res.body.data.user.email = 'fake_value';
      })
      .expect({
        message: 'user_get_by_id_success',
        data: {
          user: {
            email: 'fake_value',
            is_confirmed: true,
            id: 'fake_value',
          },
        },
      })
      .end(done);
  });

  it('/users/confirm/:code (GET) - should fail with a valid code second time', async () => {
    return request(app.getHttpServer())
      .get(`/users/confirm/${userConfirmation[0].code}`)
      .send()
      .expect(404)
      .expect({
        message: 'user_confirm_not_found',
        data: null,
      });
  });
});
