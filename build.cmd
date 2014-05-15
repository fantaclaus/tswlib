@echo off
rem echo %APPDATA%

rem if '%1'=='' echo no file name & goto err

set tsc=tsc.cmd
rem set tsc="C:\Program Files (x86)\Microsoft SDKs\TypeScript\0.9\tsc.exe"

if not exist tmp md tmp
call %tsc% src\d.ts\libcore.d.ts @files.txt --noLib  --removeComments -d --out tmp\tswlib.js

if errorlevel 1 goto err

rem TODO: remove ref to jquery in out\tswlib.d.ts

if not exist out md out
copy /b logo.txt + tmp\tswlib.js out\tswlib.js
copy /b logo.txt + tmp\tswlib.d.ts out\tswlib.d.ts
del tmp\*.* /q
rmdir tmp

goto ex

:err
exit /B 1

:ex


