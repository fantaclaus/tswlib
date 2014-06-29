@echo off

call tsc.cmd @defs.txt @files.txt --noLib  --removeComments -d --out tmp\tswlib.js
if errorlevel 1 goto err

node makeout.js
if errorlevel 1 goto err

del tmp\*.* /q
rmdir tmp

goto ex

:err
exit /B 1

:ex


