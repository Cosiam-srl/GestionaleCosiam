@ECHO OFF
ECHO Login su docker/e38.it...
docker login e38.it
cd ..\
ECHO Stashing delle modifiche eseguite...
git add .
ECHO Eseguendo git pull...
git pull
cd .\CosiamClientApp
ECHO ------------------------------
ECHO Avvio build:
node --max_old_space_size=4096 ./node_modules/@angular/cli/bin/ng build
ECHO ------------------------------
ECHO Avvio build docker container:
docker build . -t e38.it/cosiamdemo:dev
ECHO Avvio push su e38.it del nuovo container:
docker push e38.it/cosiamdemo:dev
ECHO ----------------------------------------------
ECHO Compilazione completata complimenti!