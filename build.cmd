@echo off

rem call tsc.cmd @defs.txt @files.txt --out tmp\tswlib.js --removeComments --noLib --noImplicitAny --declaration

call tsc.cmd
if errorlevel 1 goto err

node makeout.js tmp out logo.txt
if errorlevel 1 goto err

del tmp\*.* /q
rmdir tmp

goto ex

:err
exit /B 1

:ex


