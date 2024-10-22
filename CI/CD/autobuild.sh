#!/bin/sh
cd /srv/cosiam/cosiam
git reset --hard
git pull | grep 'Already up to date.'
case $? in
    1)
        echo "La nostra repo è cambiata! Proseguo con la compilazione";
        ;;
    0)
        echo "La repository è già aggiornata. Bailing out!"
        exit 1
        ;;
esac

#### DEPLOYMENT FRONTEND (prod) ####
echo inizio deployment client app prod
cd CosiamClientApp
npm install
echo Login su docker/e38.it...
docker login e38.it -u e38 -p Ubiquity21!$
echo  ------------------------------
echo Avvio build:
node --max_old_space_size=4096 ./node_modules/@angular/cli/bin/ng build --prod
echo ------------------------------
echo Avvio build docker container:
docker build . -t e38.it/cosiamdemo:latest
echo Avvio push su e38.it del nuovo container:
docker push e38.it/cosiamdemo:latest
echo ----------------------------------------------
echo Compilazione completata complimenti!
cd ../

#### Deployment frontend (dev) ####
echo inizio deployment client app dev
cd CosiamClientApp
npm install
echo Login su docker/e38.it...
docker login e38.it -u e38 -p Ubiquity21!$
echo  ------------------------------
echo Avvio build:
node --max_old_space_size=4096 ./node_modules/@angular/cli/bin/ng build
echo ------------------------------
echo updating  ./dist/assets/config/config.dev.json
cat /srv/cosiam/config.dev.e38.json > ./dist/assets/configs/config.dev.json
echo ------------------------------
echo Avvio build docker container:
docker build . -t e38.it/cosiamdemo:dev
echo Avvio push su e38.it del nuovo container:
docker push e38.it/cosiamdemo:dev
echo ----------------------------------------------
echo Compilazione completata complimenti!
cd ../

#### Deployment BackEnd prod ####
echo inizio compilazione backend prod
cd ./CosiamAPI/CosiamAPI
dotnet publish -c release --self-contained false
echo compilazione prod terminata
cd ../../

#### Deployment BackEnd dev ####
echo inizio compilazione backend debug
cd ./CosiamAPI/CosiamAPI
dotnet publish --self-contained false
echo compilazione dev terminata
cd ../../

#### Redeployment ####
cd ../
./update.sh

exit 0
