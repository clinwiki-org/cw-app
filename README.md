# cw-app

This is a React app built on top of
[React Boilerplate](https://github.com/react-boilerplate/react-boilerplate).

## Get started
Download from github and run: npm install
To view cw-app while working on it, run: npm start   (Then use localhost:3001)

## Building
For convenience, we're presently building production JS
and committing it directly to the
[Clinwiki Rails project code](https://github.com/clinwiki-org/clinwiki).

```bash
export CW_PATH=$YOUR_CW_PATH  # e.g., mine's at ~/Code/clinwiki
yarn build:clean && \
NODE_ENV=production yarn build && \
rm $CW_PATH/public/*.chunk.js && \
rm $CW_PATH/public/main*.js && \
cp build/* $CW_PATH/public/.
```

## Tests
We'd sure like to have 'em.'

yarn build:clean && NODE_ENV=production yarn build && rm $CW_PATH/public/main*.js && \
cp build/* $CW_PATH/public/.
```
