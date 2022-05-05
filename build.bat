cd /D "%~dp0\dhs-symbol"
call npm install
cd /D "%~dp0\dhs-server"
call npm install
cd /D "%~dp0"
call npm run --prefix dhs-symbol build
call npm run --prefix dhs-server build
