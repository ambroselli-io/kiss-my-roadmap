# Welcome to Remix - the Dub Stack !

This stack is very simple

- It only integrates MongoDB properly
- It can run with any Node server
- It provides the proper Clever CLoud environment to deploy on [Clever Cloud](https://www.clever-cloud.com)

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

The `.env` provided is filled up with the proper Clever Cloud environment variables.
Just create a Node application with those variables and it will work out of the box !
