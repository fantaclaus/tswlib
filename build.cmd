@echo off
rem echo %APPDATA%

rem if '%1'=='' echo no file name & goto err

set tsc=tsc.cmd
rem set tsc="C:\Program Files (x86)\Microsoft SDKs\TypeScript\0.9\tsc.exe"

%tsc% src\d.ts\libcore.d.ts @files.txt --removeComments --noLib -d --out out\tswlib.js

if errorlevel 1 goto err

rem TODO: remove ref to jquery in out\tswlib.d.ts

goto ex

:err
exit /B 1

:ex


