<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Photography Portfolio Backend [Snapshot]

Backend service for a Photography Portfolio website. This project is built with NestJS and uses PostgreSQL as the database and Cloudinary for image storage.

## Table of Contents

- [Photography Portfolio Backend \[Snapshot\]](#photography-portfolio-backend-snapshot)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Test](#test)
  - [License](#license)

## Requirements

1. Node.js >= 14.x
2. npm >= 6.x
3. PostgreSQL
4. Cloudinary Account

## Installation

1. **Clone the Repository**: [Repo](https://github.com/Dounder/snapshot-api.git)

   ```bash
   git clone https://github.com/Dounder/snapshot-api.git
   ```

2. **Install dependencies**:

   ```bash
   yarn
   # or
   npm install

   ```

3. **Rename `.template.env` to `.env` and set environment variables to use**
4. **Run only database container**

   ```bash
   docker compose up
   # or detached
   docker compose up -d
   ```

5. **Run api in dev mode**

   ```bash
   yarn start:dev
   # or
   npm run start:dev
   ```

6. **Open browser and navigate to `http://localhost:3000`**

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
