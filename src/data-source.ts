
import { DataSource } from 'typeorm';
import { User } from './entities/user/user.entities';
import { SleepData } from './entities/sleepData/sleepData.entities';

export const AppDataSource = new DataSource({
  type: 'postgres', // Replace with your database type
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'sleep_tracker',
  entities: [User, SleepData],
  migrations: ['./migration/**/*.ts'],
  synchronize: false,
  
});