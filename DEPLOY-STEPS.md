npx nodegui-packer --init chrono

npm run build

npx nodegui-packer --pack ./dist

echo "module.exports = require('./main.cjs');" > ./deploy/linux/build/chrono/dist/index.js

cp ./storage.json ./deploy/linux/build/chrono/
cp ./icon.png ./deploy/linux/build/chrono/

cp -R ./deploy/linux/build/chrono/dist ./deploy/linux/build/chrono/chrono/
cp -R ./assets ./deploy/linux/build/chrono/chrono/

cd ./deploy/linux/build/chrono

./AppRun