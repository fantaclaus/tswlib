@echo off

call tsc.cmd @defs.txt @files.txt --out tmp\tswlib.js --removeComments --noLib --noImplicitAny --declaration
if errorlevel 1 goto err

node makeout.js
if errorlevel 1 goto err

del tmp\*.* /q
rmdir tmp

goto ex

:err
exit /B 1

:ex


