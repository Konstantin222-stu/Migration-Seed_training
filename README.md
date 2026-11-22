<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## Description

Пет-проект на базе [Nest](https://github.com/nestjs/nest) + Sequelize + MySQL с настроенной схемой базы данных, миграциями и сидами через Sequelize CLI.

## База данных (MySQL + Sequelize CLI)

Локальная настройка базы данных проекта через миграции и сиды с разнесёнными путями через `.sequelizerc`.

### Структура файлов

```text
корень_проекта/
├── .env                                # Переменные окружения (не коммитить в Git!)
├── .env.example                        # Пример переменных окружения без секретов
├── .sequelizerc                        # Навигатор для sequelize-cli (указывает пути в database/)
└── database/
    ├── sequelize-cli.config.cjs          # Конфиг подключения к MySQL для CLI (CommonJS)
    ├── migrations/
    │   ├── <timestamp>-categories.js     # Создание и удаление таблицы categories
    │   └── <timestamp>-tasks.js          # Создание и удаление таблицы tasks (+ FK и индекс)
    └── seeders/
        └── <timestamp>-categories.js     # Начальные данные для categories (inbox, work, personal)
```

### За что отвечает каждый файл и таблица

- **`.sequelizerc`** (в корне проекта) — переопределяет стандартные пути `sequelize-cli`, чтобы хранить конфиг, миграции и сиды в папке `database/`. Использует `path.resolve('database', ...)` для `config`, `'migrations-path'` и `'seeders-path'`.
- **`database/sequelize-cli.config.cjs`** — CommonJS-модуль (`module.exports`) с настройками подключения к MySQL для CLI, читаемыми из переменных окружения. Расширение `.cjs` гарантирует работу через `require` / `module.exports` независимо от настроек модулей в `package.json`.
- **Миграции (`database/migrations/`)** — управляют **схемой БД** (таблицы, колонки, индексы, внешние ключи) и выполняются в хронологическом порядке по префиксу в имени файла:
  - `<timestamp>-categories.js` — в `up` создаёт таблицу `categories` (`id`, уникальный `code`, `name`, `created_at`, `updated_at`), в `down` удаляет её.
  - `<timestamp>-tasks.js` — в `up` создаёт таблицу `tasks` (`id`, `category_id` с внешним ключом на `categories.id`, `onUpdate: 'CASCADE'`, `onDelete: 'RESTRICT'`, `title`, `is_done` со значением по умолчанию `false`, nullable `due_at`, `created_at`, `updated_at`) и добавляет индекс по `category_id`; в `down` удаляет таблицу.
- **Сиды (`database/seeders/`)** — наполняют БД **стартовыми/справочными данными**, а не меняют структуру таблиц:
  - `<timestamp>-categories.js` — в `up` добавляет базовые категории (`inbox`, `work`, `personal`) с `created_at`, `updated_at` и `ignoreDuplicates: true`; в `down` удаляет их по `code`.
- **Служебные таблицы в БД**:
  - `SequelizeMeta` — хранит список уже применённых миграций; повторный запуск `db:migrate` пропускает выполненные миграции.
  - `SequelizeData` (если включено хранение истории сидов) — хранит отметки о выполненных сидах. Откат миграций сам по себе не откатывает сиды и не сбрасывает их историю — сначала откатывают сиды, затем при необходимости миграции.

### Модели, миграции и сиды — как это связано

#### 1. Зачем два интерфейса в модели (`Attributes` и `CreationAttributes`)
- `<Model>Attributes` — полный набор полей существующей записи из БД (включая `id`, `createdAt`, `updatedAt`). Используется при чтении и работе с экземпляром модели.
- `<Model>CreationAttributes` (через `Optional<..., ...>`) — набор полей при создании записи (`create` / `build`). Позволяет не передавать автогенерируемые поля (`id`, таймстампы), сохраняя строгую проверку обязательных полей.

#### 2. Изменение схемы и добавление данных
- **Уже применённые миграции не редактируем** — создаём новую миграцию (`npx sequelize-cli migration:generate --name <имя>`).
- Для правки схемы используем методы `queryInterface` (`addColumn`, `removeColumn`, `changeColumn`, `renameColumn`, `renameTable`) и зеркальный откат в `down`.
- Для добавления новых данных создаём новый сид (`npx sequelize-cli seed:generate --name <имя>`) или добавляем запись в существующий сид при включённом `ignoreDuplicates: true`.

#### 3. Ускорение работы
- Можно использовать сниппеты в редакторе или опираться на готовые миграции как на шаблон.
- Ручное описание миграций даёт прозрачный контроль над типами колонок, индексами и внешними ключами.

### Команды CLI

```bash
# Создание файлов
npx sequelize-cli migration:generate --name <имя>
npx sequelize-cli seed:generate --name <имя>

# Миграции (схема)
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate:undo:all

# Сиды (данные)
npx sequelize-cli db:seed:all
npx sequelize-cli db:seed:undo:all
```

### Перед запуском и публикацией на GitHub
- Подними MySQL и создай пустую базу данных перед запуском `db:migrate`.
- Убедись, что `.env` добавлен в `.gitignore` и не попал в репозиторий (вместо него можно положить `.env.example`).

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
