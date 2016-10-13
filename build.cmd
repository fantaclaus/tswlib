@echo off

call tsc.cmd
if errorlevel 1 goto err

node makeout.js tmp out logo.txt tswlib
if errorlevel 1 goto err

del tmp\*.* /q
rmdir tmp

goto ex

:err
exit /B 1

:ex


